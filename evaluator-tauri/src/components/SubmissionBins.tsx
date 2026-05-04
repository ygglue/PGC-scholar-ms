import React, { useState, useEffect } from 'react';
import { NetworkStatus } from '../services/networkStatus';
import { CacheService } from '../services/cacheService';
import api from '../services/apiService';
import { ModalProps } from './shared/Modal';
import { ViewLayout } from './shared/ViewLayout';

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
      setStatus(`${cached.length} submission bin(s) found.`);
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
              type: 'success',
              onConfirm: () => {}
            });
            loadBins();
            }
            } catch (err) {
            onShowModal({
            title: 'Delete Failed',
            message: `Failed to delete bin: ${err}`,
            type: 'danger',
            onConfirm: () => {}
            });
            }      }
    });
  };

  return (
    <ViewLayout>
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-serif text-[#1A1A1A]">Submission Bins</h1>
          <p className="text-sm text-[#4A5568] mt-1">Manage scholar document collection windows.</p>
        </div>
        <button className="bg-[#1A8C3C] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-[#0F5C27] transition-all">
          + Create New Bin
        </button>
      </div>

      <p className="text-[10px] uppercase font-bold tracking-wider text-[#A0AEC0] mb-4 shrink-0">{status}</p>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
          {bins.map(bin => (
            <div key={bin.id} className="bg-white p-6 rounded-2xl border border-[#E0E6E0] shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className='flex items-center gap-3 mb-4'>
                  <span className='text-3xl'>📁</span>
                  <h3 className="font-serif text-lg text-[#1A1A1A]">AY {bin.school_year}</h3>
                </div>
                <p className="text-sm text-[#4A5568] mb-1 font-semibold">{bin.semester} Semester</p>
                <p className="text-[11px] text-[#A0AEC0] font-mono">Created: {bin.created_at.slice(0, 10)}</p>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button onClick={() => onOpenBin(bin)} className="flex-1 bg-[#F7F9F7] text-[#1A8C3C] py-2 rounded-xl font-semibold text-sm hover:bg-[#E8F5ED] transition-colors">
                  View
                </button>
                <button onClick={() => deleteBin(bin.id)} className="px-4 py-2 rounded-xl font-semibold text-sm bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ViewLayout>
  );
};
