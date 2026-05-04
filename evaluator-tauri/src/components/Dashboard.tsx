import React, { useState, useEffect } from 'react';
import api from '../services/apiService';
import { NetworkStatus } from '../services/networkStatus';
import { CacheService } from '../services/cacheService';
import { ModalProps } from './shared/Modal';

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

interface DashboardProps {
  onShowModal: (config: Omit<ModalProps, 'isOpen'>) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onShowModal }) => {
  const [changes, setChanges] = useState<PendingChange[]>([]);
  const [selectedChange, setSelectedChange] = useState<PendingChange | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected' | 'more_info'>('approved');

  useEffect(() => {
    loadPendingChanges();
  }, []);

  const loadPendingChanges = async () => {
    const CACHE_KEY = "pending_changes/list";
    const cached = CacheService.get<PendingChange[]>(CACHE_KEY);

    if (cached) {
      setChanges(cached);
      setLoading(false);
      return;
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
    try {
      await api.post(`/pending-changes/${change.id}/claim`);
      setSelectedChange(change);
      setReviewNote('');
    } catch (err: any) {
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

  const handleReview = async () => {
    if (!selectedChange) return;
    
    try {
      await api.post(`/pending-changes/${selectedChange.id}/review`, {
        status: reviewStatus,
        evaluator_note: reviewNote
      });
      
      onShowModal({
        title: 'Review Submitted',
        message: `The submission has been ${reviewStatus} successfully.`,
        type: 'success',
        onConfirm: () => {}
      });
      
      setSelectedChange(null);
      loadPendingChanges();
    } catch (err) {
      onShowModal({
        title: 'Review Failed',
        message: 'Failed to submit review. Check your connection.',
        type: 'danger',
        onConfirm: () => {}
      });
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
                <span className="text-[#1A8C3C] font-bold text-sm">{val.to}</span>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return <pre className="text-xs bg-[#F7F9F7] p-4 rounded-xl overflow-auto">{JSON.stringify(change.payload, null, 2)}</pre>;
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <h1 className="text-2xl font-serif text-[#1A1A1A] mb-8 shrink-0">Pending Submissions</h1>

      <div className="flex-1 flex gap-8 min-h-0">
        <div className="flex-1 bg-white rounded-2xl border border-[#E0E6E0] shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#E0E6E0] bg-[#F7F9F7] flex justify-between items-center shrink-0">
            <span className="font-bold text-[11px] uppercase tracking-wider text-[#A0AEC0]">{changes.length} Items Pending</span>
            <button onClick={loadPendingChanges} className="text-[#1A8C3C] text-sm font-semibold hover:underline">Refresh</button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-[#4A5568]">Loading submissions...</div>
            ) : changes.length === 0 ? (
              <div className="p-8 text-center text-[#4A5568]">No pending submissions found.</div>
            ) : (
              changes.map(change => (
                <div 
                  key={change.id} 
                  onClick={() => handleClaimAndSelect(change)}
                  className={`p-5 border-b border-[#F0F2F0] cursor-pointer hover:bg-[#F7F9F7] transition-all ${selectedChange?.id === change.id ? 'bg-[#E8F5ED] border-l-4 border-l-[#1A8C3C]' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-[#1A1A1A]">{change.scholar_first_name} {change.scholar_last_name}</span>
                    <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${
                      change.change_type === 'profile' ? 'bg-[#EBF8FF] text-[#3182CE]' :
                      change.change_type === 'grades' ? 'bg-[#FAF5FF] text-[#805AD5]' :
                      'bg-[#FFF5F5] text-[#DD6B20]'
                    }`}>
                      {change.change_type}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A0AEC0] font-mono">Submitted: {new Date(change.submitted_at).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="w-[400px] bg-white rounded-2xl border border-[#E0E6E0] shadow-sm flex flex-col p-8 overflow-hidden">
          {selectedChange ? (
            <>
              <h2 className="text-xl font-serif text-[#1A1A1A] mb-1 shrink-0">Review Details</h2>
              <p className="text-sm text-[#4A5568] mb-6 shrink-0">
                Scholar: {selectedChange.scholar_first_name} {selectedChange.scholar_last_name}
              </p>

              <div className="flex-1 overflow-y-auto mb-6 pr-2">
                <h3 className="text-[11px] font-bold text-[#A0AEC0] uppercase tracking-wider mb-3">Change Summary</h3>
                {renderPayload(selectedChange)}
              </div>

              <div className="flex flex-col gap-5 pt-6 border-t border-[#F0F2F0] shrink-0">
                <div>
                  <label className="text-[11px] font-bold text-[#A0AEC0] uppercase mb-2 block">Evaluation Decision</label>
                  <select 
                    className="w-full p-3 rounded-xl border border-[#E0E6E0] focus:ring-2 focus:ring-[#1A8C3C] outline-none text-sm"
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value as any)}
                  >
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                    <option value="more_info">Request More Info</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#A0AEC0] uppercase mb-2 block">Evaluator Notes</label>
                  <textarea 
                    className="w-full p-3 rounded-xl border border-[#E0E6E0] focus:ring-2 focus:ring-[#1A8C3C] outline-none text-sm min-h-[100px] resize-none"
                    placeholder="Add feedback for scholar..."
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
            <div className="flex-1 flex flex-col items-center justify-center text-center text-[#A0AEC0]">
              <span className="text-5xl mb-4">📋</span>
              <h2 className="text-lg font-serif text-[#4A5568]">No Submission Selected</h2>
              <p className="text-sm">Select an item on the left to begin your review.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
