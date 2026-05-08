import React, { useState, useEffect } from 'react';
import api from '../services/apiService';
import { ViewLayout } from './shared/ViewLayout';
import { ModalProps } from './shared/Modal';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
}

interface AnnouncementsProps {
  onShowModal: (config: Omit<ModalProps, 'isOpen'>) => void;
}

export const Announcements: React.FC<AnnouncementsProps> = ({ onShowModal }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/announcements/');
      setAnnouncements(res.data);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const createAnnouncement = async (title: string, message: string, type: string) => {
    try {
      const res = await api.post('/announcements/', { title, message, type });
      console.log('Announcement created:', res.data);
      
      onShowModal({
        title: 'Success',
        message: 'Announcement created successfully.',
        type: 'success',
        onConfirm: () => {}
      });
      await loadAnnouncements();
    } catch (err) {
      console.error('Error creating announcement:', err);
      onShowModal({
        title: 'Error',
        message: 'Failed to create announcement.',
        type: 'danger',
        onConfirm: () => {}
      });
    }
  };

  const openCreateModal = () => {
    let title = '';
    let message = '';
    let type = 'general';
    onShowModal({
      title: 'New Announcement',
      message: (
        <div className="flex flex-col gap-4 mt-4">
          <input className="input-field" placeholder="Title" onChange={(e) => title = e.target.value} />
          <textarea className="input-field min-h-[100px]" placeholder="Message" onChange={(e) => message = e.target.value} />
          <select className="input-field" onChange={(e) => type = e.target.value}>
            <option value="general">General</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      ) as any,
      confirmLabel: 'Post',
      cancelLabel: 'Cancel',
      onConfirm: () => createAnnouncement(title, message, type)
    });
  };

  return (
    <ViewLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl text-[#1A1A1A]">Announcements</h1>
          <p className="text-sm text-[#4A5568] mt-1">Broadcast important updates to scholars.</p>
        </div>
        <button onClick={openCreateModal} className="bg-[#1A8C3C] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-[#0F5C27]">
          + New Announcement
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {loading ? (
          <p className="text-[#A0AEC0] text-center">Loading...</p>
        ) : announcements.length === 0 ? (
          <p className="text-[#A0AEC0] text-center">No announcements.</p>
        ) : (
          announcements.map(a => (
            <div key={a.id} className="bg-white p-6 rounded-2xl border border-[#E0E6E0] shadow-sm">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-[#1A1A1A]">{a.title}</h3>
                <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${a.type === 'urgent' ? 'bg-red-50 text-red-600' : 'bg-gray-100'}`}>
                  {a.type}
                </span>
              </div>
              <p className="text-sm text-[#4A5568] mt-2">{a.message}</p>
              <p className="text-[10px] text-[#A0AEC0] mt-4">{new Date(a.created_at).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </ViewLayout>
  );
};
