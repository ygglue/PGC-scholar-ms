import React, { useState, useEffect } from 'react';
import { Trash2, Edit2 } from 'lucide-react';
import api from '../services/apiService';
import { CacheService } from '../services/cacheService';
import { NetworkStatus } from '../services/networkStatus';
import { ViewLayout } from './shared/ViewLayout';
import { ModalProps } from './shared/Modal';
import { getToken } from '../services/secureStore';

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

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  created_by: string;
}

interface AnnouncementsProps {
  onShowModal: (config: Omit<ModalProps, 'isOpen'>) => void;
}

export const Announcements: React.FC<AnnouncementsProps> = ({ onShowModal }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadAnnouncements();
    const initUser = async () => {
      const token = await getToken();
      setCurrentUserId(getUserIdFromToken(token));
    };
    initUser();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    const CACHE_KEY = 'announcements/list';
    
    const isOnline = await NetworkStatus.checkApiConnection();
    if (isOnline) {
      try {
        const res = await api.get('/announcements/');
        setAnnouncements(res.data);
        CacheService.set(CACHE_KEY, res.data);
      } catch (err) {
        console.error('Failed to load announcements:', err);
      } finally {
        setLoading(false);
      }
    } else {
      const cached = CacheService.get<Announcement[]>(CACHE_KEY);
      if (cached) setAnnouncements(cached);
      setLoading(false);
    }
  };

  const createAnnouncement = async (title: string, message: string, type: string) => {
    try {
      await api.post('/announcements/', { title, message, type });
      await loadAnnouncements();
    } catch (err) {
      console.error('Error creating announcement:', err);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    onShowModal({
        title: 'Delete Announcement',
        message: 'Are you sure you want to delete this announcement?',
        type: 'danger',
        confirmLabel: 'Delete',
        onConfirm: async () => {
            await api.delete(`/announcements/${id}`);
            await loadAnnouncements();
        }
    });
  };

  const editAnnouncement = async (id: string, title: string, message: string, type: string) => {
    try {
        await api.put(`/announcements/${id}`, { title, message, type });
        await loadAnnouncements();
    } catch (err) {
        console.error('Error updating:', err);
    }
  };

  const openModal = (announcement?: Announcement) => {
    let title = announcement?.title || '';
    let message = announcement?.message || '';
    let type = announcement?.type || 'general';

    onShowModal({
      title: announcement ? 'Edit Announcement' : 'New Announcement',
      message: (
        <div className="flex flex-col gap-4 mt-4">
          <input className="border p-2 rounded" placeholder="Title" defaultValue={title} onChange={(e) => title = e.target.value} />
          <textarea className="border p-2 rounded min-h-[100px]" placeholder="Message" defaultValue={message} onChange={(e) => message = e.target.value} />
          <select className="border p-2 rounded" defaultValue={type} onChange={(e) => type = e.target.value}>
            <option value="general">General</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      ) as any,
      confirmLabel: announcement ? 'Save' : 'Post',
      cancelLabel: 'Cancel',
      onConfirm: () => announcement 
        ? editAnnouncement(announcement.id, title, message, type)
        : createAnnouncement(title, message, type)
    });
  };

  // Export openModal via ref or by moving logic to a context? 
  // Actually, simplest approach: expose a ref or just keep the logic accessible.
  // Given I cannot easily export a function from a component file without refactoring,
  // I will just make it available via a shared service or move the modal logic to a hook.


  return (
    <ViewLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl text-[#1A1A1A] dark:text-dark-text">Announcements</h1>
          <p className="text-sm text-[#4A5568] dark:text-dark-text-sec mt-1">Broadcast important updates to scholars.</p>
        </div>
        <button onClick={() => openModal()} className="bg-[#1A8C3C] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-[#0F5C27]">
          + New Announcement
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {loading ? (
          <p className="text-[#A0AEC0] dark:text-dark-text-muted text-center">Loading...</p>
        ) : announcements.length === 0 ? (
          <p className="text-[#A0AEC0] dark:text-dark-text-muted text-center">No announcements.</p>
        ) : (
          announcements.map(a => (
            <div key={a.id} className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-[#E0E6E0] dark:border-dark-border shadow-sm">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-[#1A1A1A] dark:text-dark-text">{a.title}</h3>
                <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${a.type === 'urgent' ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 dark:bg-dark-surface dark:text-dark-text-sec'}`}>
                    {a.type}
                    </span>
                    {currentUserId === a.created_by && (
                        <div className="flex gap-2">
                            <button onClick={() => openModal(a)} className="text-gray-400 hover:text-green-600 dark:text-dark-text-muted"><Edit2 size={16} /></button>
                            <button onClick={() => deleteAnnouncement(a.id)} className="text-gray-400 hover:text-red-500 dark:text-dark-text-muted"><Trash2 size={16} /></button>
                        </div>
                    )}
                </div>
              </div>
              <p className="text-sm text-[#4A5568] dark:text-dark-text-sec mt-2">{a.message}</p>
              <p className="text-[10px] text-[#A0AEC0] dark:text-dark-text-muted mt-4">{new Date(a.created_at).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </ViewLayout>
  );
};
