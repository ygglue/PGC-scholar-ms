import React, { useState, useEffect } from 'react';
import { UserCircle, ArrowLeft } from 'lucide-react';
import api from '../../services/apiService';
import { useTabs } from '../../contexts/TabContext';

interface Scholar {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  batch_number: string;
  school: string;
  course: string;
  year_level: string;
  status: string;
  avatar_url?: string;
  date_of_birth?: string;
  place_of_birth?: string;
  sex?: string;
  civil_status?: string;
  religion?: string;
  address?: string;
  contact_number?: string;
  date_enrolled?: string;
}

interface ScholarProfileProps {
  scholarId: string;
}

export const ScholarProfile: React.FC<ScholarProfileProps> = ({ scholarId }) => {
  const [scholar, setScholar] = useState<Scholar | null>(null);
  const [loading, setLoading] = useState(true);
  const { closeTab, activeTabId, tabs } = useTabs();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/scholars/${scholarId}`);
        setScholar(res.data);
      } catch (err) {
        console.error('Failed to load scholar:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [scholarId]);

  if (loading) {
    return (
      <div className="p-8 h-full flex items-center justify-center text-[#A0AEC0] dark:text-dark-text-muted">
        Loading scholar profile...
      </div>
    );
  }

  if (!scholar) {
    return (
      <div className="p-8 h-full flex items-center justify-center text-[#A0AEC0] dark:text-dark-text-muted">
        Scholar not found.
      </div>
    );
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex items-center gap-4 mb-8 shrink-0">
        <button
          onClick={() => {
            const tab = tabs.find(t => t.id === activeTabId);
            if (tab) closeTab(tab.id);
          }}
          className="flex items-center gap-2 text-sm text-[#4A5568] dark:text-dark-text-sec hover:text-[#1A8C3C] transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col items-center text-center mb-10">
            {scholar.avatar_url ? (
              <img src={scholar.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full object-cover mb-4" />
            ) : (
              <UserCircle size={80} className="text-[#A0AEC0] dark:text-dark-text-muted mb-4" />
            )}
            <h1 className="text-2xl font-bold text-[#1A1A1A] dark:text-dark-text">{scholar.first_name} {scholar.last_name}</h1>
            <span className="text-sm text-[#A0AEC0] dark:text-dark-text-muted uppercase tracking-wider mt-1">{scholar.status}</span>
          </div>

          <div className="bg-white dark:bg-dark-card rounded-2xl border border-[#E0E6E0] dark:border-dark-border p-8">
            <div className="grid grid-cols-2 gap-y-5">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#A0AEC0] dark:text-dark-text-muted">Status</p>
                <p className="text-sm font-semibold text-[#1A1A1A] dark:text-dark-text capitalize mt-1">{scholar.status}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#A0AEC0] dark:text-dark-text-muted">School</p>
                <p className="text-sm font-semibold text-[#1A1A1A] dark:text-dark-text mt-1">{scholar.school}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#A0AEC0] dark:text-dark-text-muted">Batch</p>
                <p className="text-sm font-semibold text-[#1A1A1A] dark:text-dark-text mt-1">{scholar.batch_number}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#A0AEC0] dark:text-dark-text-muted">Course</p>
                <p className="text-sm font-semibold text-[#1A1A1A] dark:text-dark-text mt-1">{scholar.course}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#A0AEC0] dark:text-dark-text-muted">Year Level</p>
                <p className="text-sm font-semibold text-[#1A1A1A] dark:text-dark-text mt-1">{scholar.year_level}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#A0AEC0] dark:text-dark-text-muted">Birth Date</p>
                <p className="text-sm font-semibold text-[#1A1A1A] dark:text-dark-text mt-1">{scholar.date_of_birth || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#A0AEC0] dark:text-dark-text-muted">Sex</p>
                <p className="text-sm font-semibold text-[#1A1A1A] dark:text-dark-text capitalize mt-1">{scholar.sex || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#A0AEC0] dark:text-dark-text-muted">Religion</p>
                <p className="text-sm font-semibold text-[#1A1A1A] dark:text-dark-text mt-1">{scholar.religion || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#A0AEC0] dark:text-dark-text-muted">Contact</p>
                <p className="text-sm font-semibold text-[#1A1A1A] dark:text-dark-text mt-1">{scholar.contact_number || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#A0AEC0] dark:text-dark-text-muted">Address</p>
                <p className="text-sm font-semibold text-[#1A1A1A] dark:text-dark-text mt-1">{scholar.address || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
