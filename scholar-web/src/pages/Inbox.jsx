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
  const [selectedRemark, setSelectedRemark] = useState(null);
  const [readIds, setReadIds] = useState(() => {
    const saved = localStorage.getItem('readAnnouncements');
    return saved ? JSON.parse(saved) : [];
  });
  const [remarks, setRemarks] = useState([]);
  const [readRemarks, setReadRemarks] = useState(() => {
    const saved = localStorage.getItem('readRemarks');
    return saved ? JSON.parse(saved) : [];
  });

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
      dispatchUnread(announcementsRes.data, remarksRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      }
      console.error('Failed to fetch inbox data:', err);
    } finally {
      setLoading(false);
    }
  };

  const dispatchUnread = (anns, rems) => {
    const saved = localStorage.getItem('readAnnouncements');
    const read = saved ? JSON.parse(saved) : [];
    const readRem = localStorage.getItem('readRemarks');
    const readR = readRem ? JSON.parse(readRem) : [];
    const unread = anns.filter(a => !read.includes(a.id)).length + (rems?.filter(r => !readR.includes(r.id)).length || 0);
    localStorage.setItem('inbox-unread', unread);
    window.dispatchEvent(new CustomEvent('inbox-update', { detail: { unread } }));
  };

  const markAsRead = (id) => {
    const newReadIds = [...readIds, id];
    setReadIds(newReadIds);
    localStorage.setItem('readAnnouncements', JSON.stringify(newReadIds));
    dispatchUnread(announcements, remarks);
  };

  const handleAnnouncementClick = (announcement) => {
    if (!readIds.includes(announcement.id)) {
      markAsRead(announcement.id);
    }
    setSelectedAnnouncement(announcement);
  };

  const handleRemarkClick = (remark) => {
    if (!readRemarks.includes(remark.id)) {
      const next = [...readRemarks, remark.id];
      setReadRemarks(next);
      localStorage.setItem('readRemarks', JSON.stringify(next));
      dispatchUnread(announcements, remarks);
    }
    setSelectedRemark(remark);
  };

  const closeModals = () => {
    setSelectedAnnouncement(null);
    setSelectedRemark(null);
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'warning':
        return { icon: 'warning', className: 'bg-palawan-yellow/10 text-on-surface' };
      case 'reminder':
        return { icon: 'notifications', className: 'bg-primary-pale/20 text-primary' };
      case 'deadline':
        return { icon: 'schedule', className: 'bg-error-container text-error' };
      default:
        return { icon: 'info', className: 'bg-surface-high text-on-surface-variant' };
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

  const unreadCount = announcements.filter(a => !readIds.includes(a.id)).length + remarks.filter(r => !readRemarks.includes(r.id)).length;

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[60vh] text-primary">Loading inbox...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface mb-2">Scholar Communications</h1>
          <p className="text-on-surface-variant font-body">Manage your institutional updates and evaluator feedback.</p>
        </header>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-gold/15 text-gold px-3 py-1 rounded-full text-[11px] font-bold">{unreadCount} Unread</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Section 1: System Updates */}
        <section className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold font-label uppercase tracking-widest text-on-surface-variant">System Updates</h2>
              {lastUpdated && (
                <span className="text-[9px] text-on-surface-variant/60 bg-surface-high/50 px-2 py-0.5 rounded-full">
                  {formatLastUpdated(lastUpdated)}
                </span>
              )}
            </div>
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
                      <div className="w-2 h-2 rounded-full bg-gold shrink-0 mt-2"></div>
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
          </div>

          {remarks.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-[32px] p-6 shadow-sm border border-transparent hover:border-primary transition-colors opacity-60">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-surface-high overflow-hidden border-2 border-primary/10"></div>
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
                const isRead = readRemarks.includes(remark.id);

                return (
                  <div
                    key={remark.id}
                    onClick={() => handleRemarkClick(remark)}
                    className={`bg-surface-container-lowest rounded-[28px] p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition-all cursor-pointer ${isRead ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-primary-pale overflow-hidden border-2 border-primary/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: '"FILL" 1'}}>rate_review</span>
                        </div>
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <h4 className="font-bold text-sm font-headline text-on-surface truncate">{remark.evaluator_email || 'Evaluator'}</h4>
                          </div>
                          <span className="text-[10px] text-on-surface-variant font-medium shrink-0 ml-2">
                            {new Date(remark.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2">{remark.remark_text}</p>
                      </div>
                      {!isRead && (
                        <div className="w-2 h-2 rounded-full bg-gold shrink-0 mt-2"></div>
                      )}
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
          onClick={closeModals}
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
                onClick={closeModals}
                className="text-on-surface-variant hover:text-on-surface p-2 shrink-0"
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

      {selectedRemark && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={closeModals}
        >
          <div
            className="bg-surface-container-lowest rounded-[28px] max-w-lg w-full p-8 shadow-2xl max-h-[80vh] overflow-y-auto overflow-x-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 hidden sm:block">
                <div className="w-14 h-14 rounded-2xl bg-primary-pale overflow-hidden border-2 border-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[32px]" style={{fontVariationSettings: '"FILL" 1'}}>rate_review</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold font-headline text-on-surface truncate">{selectedRemark.evaluator_email || 'Evaluator'}</h2>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-1">
                  {selectedRemark.change_type
                    ? selectedRemark.change_type.charAt(0).toUpperCase() + selectedRemark.change_type.slice(1)
                    : 'Submission'} — {selectedRemark.change_status || 'pending'}
                </p>
                <p className="text-xs text-on-surface-variant mt-1">
                  {new Date(selectedRemark.created_at).toLocaleDateString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
              <button onClick={closeModals} className="text-on-surface-variant hover:text-on-surface p-2 shrink-0">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-on-surface text-sm sm:text-base leading-relaxed mb-5">{selectedRemark.remark_text}</p>

            {selectedRemark.change_type === 'documents' && selectedRemark.payload?.document_id && (
              <div className="mb-4 bg-surface-high rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Document</p>
                  <p className="text-xs text-on-surface font-medium truncate">{selectedRemark.payload.doc_type || 'Submitted File'}</p>
                </div>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      const res = await apiClient.get(`${API_BASE}/documents/${selectedRemark.payload.document_id}/view`);
                      window.open(res.data.url, '_blank');
                    } catch (err) {
                      console.error('Failed to open document:', err);
                    }
                  }}
                  className="text-primary hover:text-primary/70 transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined" style={{fontVariationSettings: '"FILL" 1'}}>arrow_forward</span>
                </button>
              </div>
            )}

            {selectedRemark.change_type === 'profile' && selectedRemark.payload && (
              <div className="mb-4 bg-surface-high rounded-xl p-4 space-y-2 overflow-x-hidden">
                {Object.entries(selectedRemark.payload).map(([key, val]) => {
                  if (val && typeof val === 'object' && 'to' in val) {
                    return (
                      <div key={key} className="text-xs border-b border-outline/20 pb-2 last:border-0">
                        <span className="font-bold text-on-surface capitalize block truncate">{key.replace(/_/g, ' ')}:</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-error line-through shrink-0">{val.from || 'None'}</span>
                          <span className="text-on-surface-variant/50 shrink-0">→</span>
                          <span className="text-primary font-semibold truncate">{val.to}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}

            {selectedRemark.change_type === 'grades' && selectedRemark.payload && (
              <div className="mb-4 bg-surface-high rounded-xl px-4 py-3 overflow-x-hidden">
                <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider truncate">
                  {selectedRemark.payload.school_year || ''} — {selectedRemark.payload.semester || ''}
                </p>
              </div>
            )}

            {selectedRemark.submitted_at && (
              <div className="bg-surface-high rounded-xl px-4 py-3 overflow-x-hidden">
                <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider">Submission Date</p>
                <p className="text-xs text-on-surface font-medium">
                  {new Date(selectedRemark.submitted_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Inbox;