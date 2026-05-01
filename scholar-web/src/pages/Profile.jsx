import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { API_BASE } from '../config/api';
import Layout from '../components/Layout';
import { useApiCache } from '../hooks/useApiCache';

const Profile = () => {
  const navigate = useNavigate();
  const { data: profile } = useApiCache('profile', `${API_BASE}/scholars/me`);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleLogout = async () => {
    try {
      await apiClient.post(`${API_BASE}/auth/logout`);
    } catch (err) {
      // Ignore logout errors
    }
    navigate('/login');
  };

  const startEditing = () => {
      setEditForm({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          contact_number: profile.contact_number || '',
          date_of_birth: profile.date_of_birth || ''
      });
      setIsEditing(true);
      setSubmitStatus(null);
  };

  const handleEditChange = (e) => {
      setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveChanges = async () => {
      setSubmitStatus('saving');
      try {
          await apiClient.post(`${API_BASE}/scholars/me/update`, editForm);
          setSubmitStatus('success');
          setIsEditing(false);
          setTimeout(() => setSubmitStatus(null), 3000);
      } catch(err) {
          if (err.response && err.response.status === 409) {
              alert("You already have a pending profile update in the queue.");
          }
          setSubmitStatus('error');
      }
  };

  if (!profile) return (
    <Layout>
      <div className="flex justify-center items-center h-[60vh] text-primary">Loading identity...</div>
    </Layout>
  );

  return (
    <Layout>
      {submitStatus === 'success' && (
         <div className="bg-primary-container text-on-primary-container p-4 rounded-xl mb-6 font-bold flex items-center justify-center gap-2">
             <span className="material-symbols-outlined">check_circle</span> Changes submitted to queue!
         </div>
      )}

      <section className="flex flex-col items-center text-center space-y-4 mb-8">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-surface-container-lowest shadow-lg overflow-hidden bg-surface-container-highest">
          </div>
          {!isEditing && (
              <button onClick={startEditing} className="absolute bottom-0 right-0 bg-primary text-on-primary p-2 rounded-full shadow-md hover:bg-primary-container transition-colors">
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
          )}
        </div>
        <div>
          <h2 className="font-headline font-extrabold text-2xl text-on-surface">{profile.first_name} {profile.last_name}</h2>
          <div className="flex items-center justify-center mt-2">
            <span className="text-label-sm font-label uppercase tracking-widest text-on-surface-variant bg-surface-container-highest px-3 py-1 rounded-full text-[10px] font-bold">
               Scholar ID: ES-2024-{profile.id.substring(0, 4)}
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <section className="md:col-span-8 bg-surface-container-lowest rounded-[32px] p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-bold text-xl text-primary">Personal Information</h3>
             {isEditing ? (
                 <button onClick={() => setIsEditing(false)} className="text-error"><span className="material-symbols-outlined">close</span></button>
             ) : (
                 <span className="material-symbols-outlined text-outline">person_edit</span>
             )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-outline">First Name</label>
              <input 
                 className={`w-full ${isEditing ? 'bg-white ring-2 ring-primary' : 'bg-surface-container-low'} border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-on-surface font-medium outline-none`}
                 name="first_name" type="text" readOnly={!isEditing} 
                 value={isEditing ? editForm.first_name : profile.first_name} 
                 onChange={handleEditChange} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-outline">Last Name</label>
              <input 
                 className={`w-full ${isEditing ? 'bg-white ring-2 ring-primary' : 'bg-surface-container-low'} border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-on-surface font-medium outline-none`}
                 name="last_name" type="text" readOnly={!isEditing} 
                 value={isEditing ? editForm.last_name : profile.last_name} 
                 onChange={handleEditChange} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-outline">Contact Number</label>
              <input 
                 className={`w-full ${isEditing ? 'bg-white ring-2 ring-primary' : 'bg-surface-container-low'} border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-on-surface font-medium outline-none`}
                 name="contact_number" type="tel" readOnly={!isEditing} 
                 value={isEditing ? editForm.contact_number : (profile.contact_number || "")}
                 onChange={handleEditChange} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-outline">Date of Birth</label>
              <input 
                 className={`w-full ${isEditing ? 'bg-white ring-2 ring-primary' : 'bg-surface-container-low'} border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-on-surface font-medium outline-none`}
                 name="date_of_birth" type={isEditing ? "date" : "text"} readOnly={!isEditing} 
                 value={isEditing ? editForm.date_of_birth : (profile.date_of_birth || "")}
                 onChange={handleEditChange} 
              />
            </div>
          </div>
          {isEditing && (
             <div className="pt-4 flex justify-end gap-4">
                 <button onClick={() => setIsEditing(false)} className="text-on-surface-variant px-4 py-3 font-bold hover:text-on-surface transition-colors">Cancel</button>
                 <button 
                     onClick={saveChanges} 
                     disabled={submitStatus === 'saving'}
                     className={`bg-primary text-on-primary px-8 py-3 rounded-full font-bold shadow-md hover:bg-primary-container transition-all active:scale-95 ${submitStatus === 'saving' ? 'opacity-70' : ''}`}>
                     {submitStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                 </button>
             </div>
          )}
        </section>

        <div className="md:col-span-4 space-y-6">
          <section className="bg-surface-container-lowest rounded-[32px] p-6 shadow-sm space-y-4 border-l-4 border-primary">
            <h3 className="font-headline font-bold text-lg text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">school</span> Academic Details
            </h3>
            <div className="space-y-4">
              <div className="bg-surface-container-low p-4 rounded-2xl">
                <label className="text-[10px] uppercase tracking-widest font-bold text-outline block mb-1">Institution</label>
                <p className="text-on-surface font-bold">{profile.school}</p>
              </div>
              <div className="bg-surface-container-low p-4 rounded-2xl">
                <label className="text-[10px] uppercase tracking-widest font-bold text-outline block mb-1">Program</label>
                <p className="text-on-surface font-bold">{profile.course}</p>
                <p className="text-xs text-on-surface-variant mt-1">Batch {profile.batch_number} • Year {profile.year_level || '1'}</p>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-[32px] p-6 shadow-sm space-y-4">
            <h3 className="font-headline font-bold text-lg text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">verified_user</span> Account Security
            </h3>
            <div className="flex flex-col gap-3">
              <div className="w-full flex items-center justify-between px-5 py-4 bg-surface-container-low rounded-2xl text-on-surface opacity-80">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">email</span>
                  <span className="font-bold text-sm">{profile.email}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-[32px] p-2 shadow-sm">
            <button onClick={handleLogout} className="w-full flex items-center justify-between px-5 py-4 bg-error-container/20 hover:bg-error-container/40 transition-colors rounded-[24px] text-error group">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined font-bold">logout</span>
                <span className="font-bold text-sm uppercase tracking-wider">Log Out</span>
              </div>
              <span className="material-symbols-outlined text-error/50 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
