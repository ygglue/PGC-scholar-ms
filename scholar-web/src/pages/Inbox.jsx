import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { API_BASE } from '../config/api';
import Layout from '../components/Layout';

const Inbox = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [readIds, setReadIds] = useState(() => {
    const saved = localStorage.getItem('readAnnouncements');
    return saved ? JSON.parse(saved) : [];
  });
  const [remarks, setRemarks] = useState([]);

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const formatLastUpdated = (date) => {
    if (!date) return '';
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const fetchData = async () => {
    try {
      const [announcementsRes, profileRes, remarksRes] = await Promise.all([
        apiClient.get(`${API_BASE}/announcements/`),
        apiClient.get(`${API_BASE}/scholars/me`),
        apiClient.get(`${API_BASE}/remarks/me`).catch(() => ({ data: [] }))
      ]);
      setAnnouncements(announcementsRes.data);
      setProfile(profileRes.data);
      setRemarks(remarksRes.data);
      setLastUpdated(new Date());
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      }
      console.error('Failed to fetch inbox data:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id) => {
    const newReadIds = [...readIds, id];
    setReadIds(newReadIds);
    localStorage.setItem('readAnnouncements', JSON.stringify(newReadIds));
  };

  const handleAnnouncementClick = (announcement) => {
    if (!readIds.includes(announcement.id)) {
      markAsRead(announcement.id);
    }
    setSelectedAnnouncement(announcement);
  };

  const closeModal = () => {
    setSelectedAnnouncement(null);
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'warning':
        return { icon: 'warning', className: 'bg-palawan-yellow/10 text-on-surface' };
      case 'reminder':
        return { icon: 'notifications', className: 'bg-primary-fixed/20 text-primary' };
      case 'deadline':
        return { icon: 'schedule', className: 'bg-error-container text-error' };
      default:
        return { icon: 'info', className: 'bg-surface-container-high text-on-surface-variant' };
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'warning':
        return 'border-palawan-yellow';
      case 'deadline':
        return 'border-error';
      default:
        return 'border-transparent';
    }
  };

  const unreadCount = announcements.filter(a => !readIds.includes(a.id)).length;

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[60vh] text-primary">Loading inbox...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface mb-2">Scholar Communications</h1>
        <p className="text-on-surface-variant font-body">Manage your institutional updates and evaluator feedback.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Section 1: System Updates */}
        <section className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">System Updates</h2>
              {lastUpdated && (
                <span className="text-[9px] text-on-surface-variant/60 bg-surface-container px-2 py-0.5 rounded-full">
                  {formatLastUpdated(lastUpdated)}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full text-[10px] font-bold">{unreadCount} Unread</span>
            )}
          </div>

          {announcements.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-[28px] p-6 shadow-sm text-center">
              <p className="text-on-surface-variant text-sm">No system updates at this time.</p>
            </div>
          ) : (
            announcements.map((announcement) => {
              const isRead = readIds.includes(announcement.id);
              const { icon, className } = getIconForType(announcement.type);
              const borderClass = getBorderColor(announcement.type);
              
              return (
                <div 
                  key={announcement.id}
                  onClick={() => handleAnnouncementClick(announcement)}
                  className={`bg-surface-container-lowest rounded-[28px] p-6 shadow-sm border-l-8 ${borderClass} relative overflow-hidden group hover:shadow-md transition-all cursor-pointer ${isRead ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl ${className}`}>
                      <span className="material-symbols-outlined text-[32px]" style={{fontVariationSettings: '"FILL" 1'}}>{icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg font-headline text-on-surface leading-tight mb-1">{announcement.title}</h3>
                      <p className="text-sm text-on-surface-variant mb-2 line-clamp-2">{announcement.message}</p>
                      {announcement.created_at && (
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                          {new Date(announcement.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {!isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Compliance Card */}
          <div className="bg-primary text-on-primary rounded-[32px] p-8 shadow-lg relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80 mb-2 block">Grantee Compliance</span>
              <div className="text-4xl font-extrabold font-headline mb-4">
                {profile?.status === 'active' ? '95%' : profile?.status === 'graduate' ? '100%' : '70%'}
              </div>
              <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mb-4">
                <div className="bg-white h-full rounded-full" style={{ width: profile?.status === 'active' ? '95%' : profile?.status === 'graduate' ? '100%' : '70%' }}></div>
              </div>
              <p className="text-xs opacity-90 font-medium">
                {profile?.status === 'active' 
                  ? 'Keep it up! Complete your pending requirements to reach 100% standing.'
                  : profile?.status === 'graduate'
                  ? 'Congratulations on completing your scholarship!'
                  : 'Please complete your pending requirements to maintain good standing.'}
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Evaluator Remarks */}
        <section className="lg:col-span-7">
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">Evaluator Remarks</h2>
            {remarks.length > 0 && (
              <span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full text-[10px] font-bold">{remarks.length} Total</span>
            )}
          </div>

          {remarks.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-[32px] p-6 shadow-sm border border-transparent hover:border-primary-fixed transition-colors opacity-60">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-surface-container-high overflow-hidden border-2 border-primary/10">
                  </div>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-on-surface font-headline">No Remarks Yet</h4>
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">System</p>
                    </div>
                    <span className="text-[10px] text-on-surface-variant font-medium">-</span>
                  </div>
                  <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">
                    Evaluator remarks will appear here when they provide feedback on your submissions.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {remarks.map((remark) => {
                const changeLabel = remark.change_type
                  ? remark.change_type.charAt(0).toUpperCase() + remark.change_type.slice(1)
                  : 'Submission';

                return (
                  <div key={remark.id} className="bg-surface-container-lowest rounded-[32px] p-6 shadow-sm border border-transparent hover:border-primary-fixed transition-colors">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-primary-container overflow-hidden border-2 border-primary/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: '"FILL" 1'}}>rate_review</span>
                        </div>
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-on-surface font-headline truncate">{remark.evaluator_email || 'Evaluator'}</h4>
                            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                              {changeLabel} — {remark.change_status || 'pending'}
                            </p>
                          </div>
                          <span className="text-[10px] text-on-surface-variant font-medium shrink-0 ml-2">
                            {new Date(remark.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface-variant mb-3 leading-relaxed">
                          {remark.remark_text}
                        </p>

                        {remark.change_type === 'documents' && remark.payload?.document_id && (
                          <button
                            onClick={async () => {
                              try {
                                const res = await apiClient.get(`${API_BASE}/documents/${remark.payload.document_id}/view`);
                                window.open(res.data.url, '_blank');
                              } catch (e) {
                                console.error('Failed to open document:', e);
                              }
                            }}
                            className="mb-3 bg-primary text-on-primary px-5 py-2.5 rounded-full text-xs font-bold hover:bg-primary-fixed transition-all shadow-sm active:scale-95 inline-flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: '"FILL" 1'}}>visibility</span>
                            View Document
                          </button>
                        )}

                        {remark.change_type === 'profile' && remark.payload && (
                          <div className="mb-3 bg-surface-container-high rounded-xl p-4 space-y-2">
                            {Object.entries(remark.payload).map(([key, val]) => {
                              if (val && typeof val === 'object' && 'to' in val) {
                                return (
                                  <div key={key} className="text-xs border-b border-outline-variant/20 pb-2 last:border-0">
                                    <span className="font-bold text-on-surface capitalize">{key.replace(/_/g, ' ')}:</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-error line-through">{val.from || 'None'}</span>
                                      <span className="text-on-surface-variant/50">→</span>
                                      <span className="text-primary font-semibold">{val.to}</span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        )}

                        {remark.change_type === 'grades' && remark.payload && (
                          <div className="mb-3 bg-surface-container-high rounded-xl px-4 py-3">
                            <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">
                              {remark.payload.school_year || ''} — {remark.payload.semester || ''}
                            </p>
                          </div>
                        )}

                        {remark.submitted_at && (
                          <div className="mb-3 bg-surface-container-high rounded-xl px-4 py-3">
                            <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Submission Date</p>
                            <p className="text-xs text-on-surface font-medium">
                              {new Date(remark.submitted_at).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'long', day: 'numeric'
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Modal */}
      {selectedAnnouncement && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={closeModal}
        >
          <div 
            className="bg-surface-container-lowest rounded-[28px] max-w-lg w-full p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className={`p-4 rounded-2xl ${getIconForType(selectedAnnouncement.type).className}`}>
                <span className="material-symbols-outlined text-[40px]" style={{fontVariationSettings: '"FILL" 1'}}>
                  {getIconForType(selectedAnnouncement.type).icon}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold font-headline text-on-surface">{selectedAnnouncement.title}</h2>
                {selectedAnnouncement.created_at && (
                  <p className="text-xs text-on-surface-variant mt-1">
                    {new Date(selectedAnnouncement.created_at).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                )}
              </div>
              <button 
                onClick={closeModal}
                className="text-on-surface-variant hover:text-on-surface p-2"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-on-surface text-base leading-relaxed">
              {selectedAnnouncement.message}
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Inbox;