import React, { useState, useEffect } from 'react';
import { ClipboardList, RefreshCw, Unlock, MessageSquareText } from 'lucide-react';
import api from '../services/apiService';
import { NetworkStatus } from '../services/networkStatus';
import { CacheService } from '../services/cacheService';
import { getToken } from '../services/secureStore';
import { DocumentService } from '../services/documentService';
import { openPath } from '@tauri-apps/plugin-opener';
import { ModalProps } from './shared/Modal';

// Helper to get user ID from JWT
const getUserIdFromToken = (token: string | null): string | null => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub;
  } catch (e) {
    return null;
  }
};

interface PendingChange {
  id: string;
  scholar_id: string;
  change_type: 'profile' | 'grades' | 'documents';
  payload: any;
  status: string;
  submitted_at: string;
  scholar_first_name?: string;
  scholar_last_name?: string;
  claimed_by?: string;
}

interface EvaluationRemark {
  id: string;
  pending_change_id: string;
  evaluator_id: string;
  scholar_id: string;
  remark_text: string;
  created_at: string;
  evaluator_email?: string;
  change_type?: string;
  change_status?: string;
  submitted_at?: string;
}

interface PendingSubmissionsProps {
  onShowModal: (config: Omit<ModalProps, 'isOpen'>) => void;
}

export const PendingSubmissions: React.FC<PendingSubmissionsProps> = ({ onShowModal }) => {
  const [changes, setChanges] = useState<PendingChange[]>([]);
  const [selectedChange, setSelectedChange] = useState<PendingChange | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected' | 'more_info'>('approved');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState<EvaluationRemark[]>([]);
  const [remarksLoading, setRemarksLoading] = useState(false);

  useEffect(() => {
    loadPendingChanges();
    const initUser = async () => {
      const token = await getToken();
      setCurrentUserId(getUserIdFromToken(token));
    };
    initUser();
  }, []);

  useEffect(() => {
    if (selectedChange) {
      loadRemarks(selectedChange.id);
    } else {
      setRemarks([]);
    }
  }, [selectedChange]);

  const loadRemarks = async (changeId: string) => {
    setRemarksLoading(true);
    try {
      const res = await api.get(`/remarks/pending-change/${changeId}`);
      setRemarks(res.data);
    } catch (err) {
      console.error("Failed to load remarks:", err);
    } finally {
      setRemarksLoading(false);
    }
  };

  const loadPendingChanges = async (forceRefresh: boolean = false) => {
    const CACHE_KEY = "pending_changes/list";
    
    if (!forceRefresh) {
      const cached = CacheService.get<PendingChange[]>(CACHE_KEY);
      if (cached) {
        setChanges(cached);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    const isOnline = await NetworkStatus.checkApiConnection();

    if (isOnline) {
      try {
        const res = await api.get("/pending-changes/");
        setChanges(res.data);
        CacheService.set(CACHE_KEY, res.data);
      } catch (err) {
        console.error("Failed to load changes:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClaimAndSelect = async (change: PendingChange) => {
    if (selectedChange?.id === change.id) return;

    // Optimistic UI Update
    const previousChanges = [...changes];
    const newChanges = changes.map(c => 
      c.id === change.id ? { ...c, claimed_by: currentUserId || 'local' } : c
    );
    setChanges(newChanges);
    CacheService.set("pending_changes/list", newChanges);
    setSelectedChange({ ...change, claimed_by: currentUserId || 'local' });
    setReviewNote('');

    try {
      await api.post(`/pending-changes/${change.id}/claim`);
      // No need to reload, the UI is already updated.
    } catch (err: any) {
      // Revert on failure
      setChanges(previousChanges);
      CacheService.set("pending_changes/list", previousChanges);
      setSelectedChange(null);
      if (err.response?.status === 409) {
        onShowModal({
          title: 'Already Claimed',
          message: 'This submission is already being reviewed by another evaluator.',
          type: 'danger',
          onConfirm: () => {}
        });
      } else {
        onShowModal({
          title: 'Claim Failed',
          message: 'Failed to claim submission. Please try again.',
          type: 'danger',
          onConfirm: () => {}
        });
      }
    }
  };

  const handleViewDocument = async (docId: string, scholarId: string) => {
    try {
      const res = await api.get(`/documents/${docId}/view-evaluator`);
      const localPath = await DocumentService.downloadAndCacheDocument(docId, scholarId, res.data.url);
      await openPath(localPath.replace(/\\/g, '/'));
    } catch (err) {
      onShowModal({
        title: 'Open Failed',
        message: `Could not open document: ${err}`,
        type: 'danger',
        onConfirm: () => {}
      });
    }
  };

  const handleReview = async () => {
    if (!selectedChange) return;
    
    if ((reviewStatus === 'rejected' || reviewStatus === 'more_info') && !reviewNote.trim()) {
      onShowModal({
        title: 'Note Required',
        message: 'Please provide a reason in the Evaluator Notes for your decision.',
        type: 'danger',
        onConfirm: () => {}
      });
      return;
    }

    try {
      await api.post(`/pending-changes/${selectedChange.id}/review`, {
        status: reviewStatus,
        evaluator_note: reviewNote
      });
      
      // Immediate UI update
      const updatedChanges = changes.filter(c => c.id !== selectedChange.id);
      setChanges(updatedChanges);
      CacheService.set("pending_changes/list", updatedChanges);
      
      onShowModal({
        title: 'Review Submitted',
        message: `The submission has been ${reviewStatus} successfully.`,
        type: 'success',
        onConfirm: () => {}
      });
      
      setSelectedChange(null);
      setReviewNote('');
      setReviewStatus('approved');
    } catch (err) {
      onShowModal({
        title: 'Review Failed',
        message: 'Failed to submit review. Check your connection.',
        type: 'danger',
        onConfirm: () => {}
      });
    }
  };

  const handleUnlock = async (changeId: string) => {
    try {
        await api.post(`/pending-changes/${changeId}/unlock`);
        setChanges(changes.map(c => c.id === changeId ? { ...c, claimed_by: undefined } : c));
        setSelectedChange(null);
    } catch (err) {
        console.error("Failed to unlock:", err);
    }
  };

  const renderPayload = (change: PendingChange) => {
    if (change.change_type === 'profile') {
      return (
        <div className="flex flex-col gap-2">
          {Object.entries(change.payload).map(([key, val]: [string, any]) => (
            <div key={key} className="text-sm border-b border-[#F0F2F0] pb-2 pt-2">
              <span className="font-semibold text-[#1A1A1A] capitalize">{key.replace('_', ' ')}:</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-red-500 line-through text-xs">{val.from || 'None'}</span>
                <span className="text-[#A0AEC0]">→</span>
                    <span className="text-[#1A8C3C] dark:text-dark-green font-bold text-sm">{val.to}</span>
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (change.change_type === 'grades') {
      return (
        <div className="bg-[#F7F9F7] p-4 rounded-xl text-xs space-y-2">
          <p className="font-bold uppercase text-[#A0AEC0]">Grade Changes</p>
          {Object.entries(change.payload).map(([subject, grades]: [string, any]) => (
            <div key={subject} className="flex justify-between">
              <span className="font-medium">{subject}</span>
              <span className="font-bold text-[#1A8C3C] dark:text-dark-green">{grades.from} → {grades.to}</span>
            </div>
          ))}
        </div>
      );
    }
    if (change.change_type === 'documents') {
      return (
        <div className="bg-[#F7F9F7] dark:bg-dark-surface p-4 rounded-xl text-xs space-y-3">
          <p className="font-bold uppercase text-[#A0AEC0] dark:text-dark-text-muted">Submitted Document</p>
          <div className="bg-white dark:bg-dark-card p-3 rounded-lg border border-[#E0E6E0] dark:border-dark-border">
            <p className="font-medium text-[#1A1A1A] dark:text-dark-text truncate">{change.payload.doc_type || 'Document'}</p>
          </div>
          <button 
            onClick={() => handleViewDocument(change.payload.document_id, change.scholar_id)}
            className="w-full bg-[#1A8C3C] text-white py-2 rounded-lg font-semibold hover:bg-[#0F5C27] transition-colors"
          >
            View Document
          </button>
        </div>
      );
    }
    return <pre className="text-xs bg-[#F7F9F7] dark:bg-dark-surface p-4 rounded-xl overflow-auto dark:text-gray-300">{JSON.stringify(change.payload, null, 2)}</pre>;
  };

  const [filterType, setFilterType] = useState<string>('all');

  // ... (inside component)

  const filteredChanges = changes
    .filter(c => filterType === 'all' || c.change_type === filterType)
    .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

  // ... (in JSX return)
  return (
    <div className="p-8 h-full flex flex-col">
      <h1 className="text-2xl text-[#1A1A1A] dark:text-dark-text mb-8 shrink-0">Pending Submissions</h1>
      <div className="flex-1 flex gap-8 min-h-0">
        <div className="flex-1 bg-white dark:bg-dark-card rounded-2xl border border-[#E0E6E0] dark:border-dark-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#E0E6E0] dark:border-dark-border bg-[#F7F9F7] dark:bg-dark-surface flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
                <span className="font-bold text-[11px] uppercase tracking-wider text-[#A0AEC0] dark:text-dark-text-muted">{filteredChanges.length} Items Pending</span>
                <select 
                    className="text-[11px] font-semibold text-[#1A1A1A] dark:text-dark-text border border-[#E0E6E0] dark:border-dark-border rounded-lg px-3 py-2 bg-white dark:bg-dark-card focus:ring-2 focus:ring-[#1A8C3C] outline-none transition-all cursor-pointer"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                >
                    <option value="all">All Types</option>
                    <option value="profile">Profile</option>
                    <option value="grades">Grades</option>
                    <option value="documents">Documents</option>
                </select>
            </div>
            <button onClick={() => loadPendingChanges(true)} className="text-[#1A8C3C] p-2 hover:bg-[#E8F5ED] dark:hover:bg-dark-green-bg rounded-full transition-colors" title="Refresh">
                <RefreshCw size={16} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-[#4A5568] dark:text-dark-text-sec">Loading submissions...</div>
            ) : filteredChanges.length === 0 ? (
              <div className="p-8 text-center text-[#4A5568] dark:text-dark-text-sec">No pending submissions found.</div>
            ) : (
              <>
                {filteredChanges.map(change => (
                    <div 
                    key={change.id} 
                    onClick={() => handleClaimAndSelect(change)}
                    className={`p-5 border-b border-[#F0F2F0] dark:border-dark-border cursor-pointer hover:bg-[#F7F9F7] dark:hover:bg-gray-800 transition-all ${selectedChange?.id === change.id ? 'bg-[#E8F5ED] dark:bg-dark-green-bg border-l-4 border-l-[#1A8C3C]' : ''} ${change.claimed_by ? 'opacity-70' : ''}`}
                    >
                    <div className="flex justify-between items-start mb-2">
                        <span className={`font-bold text-[#1A1A1A] dark:text-dark-text ${change.claimed_by ? 'flex items-center gap-2' : ''}`}>
                        {change.scholar_first_name} {change.scholar_last_name} — {change.change_type.toUpperCase()}
                        {change.claimed_by && <span className="text-[10px] bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded italic">Locked</span>}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${
                        change.change_type === 'profile' ? 'bg-[#EBF8FF] text-[#3182CE]' :
                        change.change_type === 'grades' ? 'bg-[#FAF5FF] text-[#805AD5]' :
                        'bg-[#FFF5F5] text-[#DD6B20]'
                        }`}>
                        {change.status}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-[11px] text-[#A0AEC0] dark:text-dark-text-muted font-mono">Submitted: {new Date(change.submitted_at).toLocaleString()}</p>
                        {change.claimed_by && (
                        <p className="text-[10px] text-[#DD6B20] font-semibold">
                            In Review By: {change.claimed_by === currentUserId ? 'You' : 'Evaluator'}
                        </p>
                        )}
                    </div>
                    </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="w-[400px] bg-white dark:bg-dark-card rounded-2xl border border-[#E0E6E0] dark:border-dark-border shadow-sm flex flex-col p-8 overflow-hidden">
          {selectedChange ? (
            <>
              <div className="flex justify-between items-start mb-1 shrink-0">
                  <h2 className="text-xl text-[#1A1A1A] dark:text-dark-text">Review Details</h2>
                  {selectedChange.claimed_by === currentUserId && (
                    <button onClick={() => handleUnlock(selectedChange.id)} className="text-[#A0AEC0] dark:text-dark-text-muted hover:text-blue-600 p-2" title="Unlock">
                        <Unlock size={18} />
                    </button>
                  )}
              </div>
              <p className="text-sm text-[#4A5568] dark:text-dark-text-sec mb-6 shrink-0">
                Scholar: {selectedChange.scholar_first_name} {selectedChange.scholar_last_name}
              </p>

              <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-6">
                <div>
                  <h3 className="text-[11px] font-bold text-[#A0AEC0] dark:text-dark-text-muted uppercase tracking-wider mb-3">Change Summary</h3>
                  {renderPayload(selectedChange)}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[11px] font-bold text-[#A0AEC0] dark:text-dark-text-muted uppercase tracking-wider">Remarks History</h3>
                    <MessageSquareText size={14} className="text-[#A0AEC0] dark:text-dark-text-muted" />
                  </div>

                  {remarksLoading ? (
                    <p className="text-xs text-[#A0AEC0] dark:text-dark-text-muted">Loading remarks...</p>
                  ) : remarks.length === 0 ? (
                    <p className="text-xs text-[#A0AEC0] dark:text-dark-text-muted italic">No remarks yet.</p>
                  ) : (
                    <div className="space-y-3 max-h-[240px] overflow-y-auto">
                      {remarks.map(remark => (
                        <div key={remark.id} className="bg-[#F7F9F7] dark:bg-dark-surface rounded-xl p-3 border border-[#E0E6E0] dark:border-dark-border">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold text-[#1A1A1A] dark:text-dark-text">
                              {remark.evaluator_email || 'Evaluator'}
                            </span>
                            <span className="text-[9px] text-[#A0AEC0] dark:text-dark-text-muted">
                              {new Date(remark.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-[#4A5568] dark:text-dark-text-sec leading-relaxed">{remark.remark_text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-5 pt-6 border-t border-[#F0F2F0] dark:border-dark-border shrink-0">
                <div>
                  <label className="text-[11px] font-bold text-[#A0AEC0] dark:text-dark-text-muted uppercase mb-2 block">Evaluation Decision</label>
                  <select 
                    className="w-full p-3 rounded-xl border border-[#E0E6E0] dark:border-dark-border bg-white dark:bg-dark-card text-[#1A1A1A] dark:text-dark-text focus:ring-2 focus:ring-[#1A8C3C] outline-none text-sm"
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value as any)}
                  >
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                    <option value="more_info">Request More Info</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#A0AEC0] dark:text-dark-text-muted uppercase mb-2 block">Evaluator Notes / Remarks</label>
                  <textarea 
                    className="w-full p-3 rounded-xl border border-[#E0E6E0] dark:border-dark-border bg-white dark:bg-dark-card text-[#1A1A1A] dark:text-dark-text focus:ring-2 focus:ring-[#1A8C3C] outline-none text-sm min-h-[100px] resize-none"
                    placeholder="Add a remark for the scholar (saved on review)..."
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                  />
                </div>

                <button 
                  onClick={handleReview}
                  className={`w-full text-white py-3 rounded-full font-semibold text-sm transition-all shadow-md active:scale-95 ${reviewStatus === 'rejected' ? 'bg-[#E53935] hover:bg-[#C62828]' : 'bg-[#1A8C3C] hover:bg-[#0F5C27]'}`}
                >
                  Submit {reviewStatus.replace('_', ' ')}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-[#A0AEC0] dark:text-dark-text-muted">
              <div className="p-4 bg-[#F7F9F7] dark:bg-dark-surface rounded-2xl mb-4">
                <ClipboardList size={48} className="text-[#A0AEC0] dark:text-dark-text-muted" />
              </div>
              <h2 className="text-lg text-[#4A5568] dark:text-dark-text-sec">No Submission Selected</h2>
              <p className="text-sm">Select an item on the left to begin your review.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
