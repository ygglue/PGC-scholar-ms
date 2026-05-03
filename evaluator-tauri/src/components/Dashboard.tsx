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
          type: 'danger'
        });
      } else {
        onShowModal({
          title: 'Claim Failed',
          message: 'Failed to claim submission. Please try again.',
          type: 'danger'
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
        type: 'success'
      });
      
      setSelectedChange(null);
      loadPendingChanges();
    } catch (err) {
      onShowModal({
        title: 'Review Failed',
        message: 'Failed to submit review. Check your connection.',
        type: 'danger'
      });
    }
  };

  const renderPayload = (change: PendingChange) => {
    if (change.change_type === 'profile') {
      return (
        <div className="flex flex-col gap-2">
          {Object.entries(change.payload).map(([key, val]: [string, any]) => (
            <div key={key} className="text-sm border-b border-gray-100 pb-1">
              <span className="font-semibold capitalize">{key.replace('_', ' ')}:</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-red-500 line-through">{val.from || 'None'}</span>
                <span>→</span>
                <span className="text-green-600 font-bold">{val.to}</span>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-40">{JSON.stringify(change.payload, null, 2)}</pre>;
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <h1 className="text-2xl font-serif mb-8">Pending Submissions</h1>

      <div className="flex-1 flex gap-8 min-h-0">
        {/* List Section */}
        <div className="flex-1 bg-white rounded-xl border border-[#E0E6E0] shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#E0E6E0] bg-[#F7F9F7] flex justify-between items-center">
            <span className="font-semibold text-sm">{changes.length} Items Pending</span>
            <button onClick={loadPendingChanges} className="text-[#1A8C3C] text-sm hover:underline">Refresh</button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading submissions...</div>
            ) : changes.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No pending submissions found.</div>
            ) : (
              changes.map(change => (
                <div 
                  key={change.id} 
                  onClick={() => handleClaimAndSelect(change)}
                  className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-green-50 transition-colors ${selectedChange?.id === change.id ? 'bg-green-50 border-l-4 border-l-[#1A8C3C]' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold">{change.scholar_first_name} {change.scholar_last_name}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      change.change_type === 'profile' ? 'bg-blue-100 text-blue-700' :
                      change.change_type === 'grades' ? 'bg-purple-100 text-purple-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {change.change_type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Submitted: {new Date(change.submitted_at).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detail Section */}
        <div className="w-[400px] bg-white rounded-xl border border-[#E0E6E0] shadow-sm flex flex-col p-6">
          {selectedChange ? (
            <>
              <h2 className="text-xl font-serif mb-2">Review Details</h2>
              <p className="text-sm text-gray-500 mb-6">
                Scholar: {selectedChange.scholar_first_name} {selectedChange.scholar_last_name}
              </p>

              <div className="flex-1 overflow-y-auto mb-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Changes</h3>
                {renderPayload(selectedChange)}
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Decision</label>
                  <select 
                    className="input-field"
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value as any)}
                  >
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                    <option value="more_info">Request More Info</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Notes (Optional)</label>
                  <textarea 
                    className="input-field min-h-[100px] resize-none"
                    placeholder="Add a reason for rejection or details for more info..."
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                  />
                </div>

                <button 
                  onClick={handleReview}
                  className={`btn-primary w-full ${reviewStatus === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                >
                  Submit {reviewStatus.replace('_', ' ')}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
              <span className="text-4xl mb-4">📋</span>
              <h2 className="text-lg font-serif text-gray-600">No Item Selected</h2>
              <p className="text-sm">Select a submission from the list to begin the review process.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
