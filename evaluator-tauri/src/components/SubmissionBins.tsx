import React, { useState, useEffect } from 'react';
import { NetworkStatus } from '../services/networkStatus';
import { CacheService } from '../services/cacheService';
import api from '../services/apiService';
import { ModalProps } from './shared/Modal';

interface SubmissionBin {
  id: string;
  school_year: string;
  semester: string;
  created_at: string;
}

interface SubmissionBinsProps {
  onOpenBin: (bin: SubmissionBin) => void;
  onShowModal: (config: Omit<ModalProps, 'isOpen'>) => void;
}

export const SubmissionBins: React.FC<SubmissionBinsProps> = ({ onOpenBin, onShowModal }) => {
  const [bins, setBins] = useState<SubmissionBin[]>([]);
  const [status, setStatus] = useState("Loading bins...");

  useEffect(() => {
    loadBins();
  }, []);

  const loadBins = async () => {
    const CACHE_KEY = "bins/list";
    const cached = CacheService.get<SubmissionBin[]>(CACHE_KEY);

    if (cached) {
      setBins(cached);
      setStatus(`${cached.length} submission bin(s) found (cached).`);
      return;
    }

    setStatus("Loading bins...");
    const isOnline = await NetworkStatus.checkApiConnection();

    if (isOnline) {
      try {
        const res = await api.get("/submission-bins/");
        const data = res.data;
        setBins(data);
        CacheService.set(CACHE_KEY, data);
        setStatus(`${data.length} submission bin(s) found.`);
      } catch (err) {
        setStatus(`Error loading bins: ${err}`);
      }
    }
  };

  const deleteBin = async (id: string) => {
    onShowModal({
      title: 'Delete Bin?',
      message: 'This will delete the submission bin. All contained documents will be unassigned. This action cannot be undone.',
      type: 'danger',
      confirmLabel: 'Delete Permanently',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        try {
          const res = await api.delete(`/submission-bins/${id}`);
          if (res.status === 200 || res.status === 204) {
            onShowModal({
              title: 'Bin Deleted',
              message: 'The submission bin has been removed.',
              type: 'success'
            });
            loadBins();
          }
        } catch (err) {
          onShowModal({
            title: 'Delete Failed',
            message: `Failed to delete bin: ${err}`,
            type: 'danger'
          });
        }
      }
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-serif">Submission Bins</h1>
          <p className="text-sm text-gray-500 mt-1">Manage scholar document windows.</p>
        </div>
        <button className="btn-primary w-auto px-6">+ Create Bin</button>
      </div>

      <p className="text-xs text-gray-400 mb-4">{status}</p>

      <div className="flex flex-col gap-4">
        {bins.map(bin => (
          <div key={bin.id} className="bg-white p-6 rounded-lg border border-[#E0E6E0] flex items-center justify-between shadow-sm">
            <div className='flex items-center gap-4'>
              <span className='text-2xl'>📁</span>
              <div>
                <h3 className="font-bold">AY {bin.school_year} — {bin.semester} Semester</h3>
                <p className="text-xs text-gray-400">Created: {bin.created_at.slice(0, 10)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onOpenBin(bin)} className="bg-[#F7F9F7] text-[#1A8C3C] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-green-50">
                View Documents →
              </button>
              <button onClick={() => deleteBin(bin.id)} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-red-100">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
