import { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import apiClient, { API_BASE, removeToken } from "../config/api";
import Layout from "../components/Layout";
import { useApiCache } from "../hooks/useApiCache";
import { getAvatarColor } from "../utils/colors";

const Profile = () => {
  const navigate = useNavigate();
  const { data: profile, mutate: mutateProfile } = useApiCache('profile', `${API_BASE}/scholars/me`);
  const [pendingChanges, setPendingChanges] = useState([]);

  const fetchPending = async () => {
    try {
        const res = await apiClient.get(`${API_BASE}/pending-changes/me`);
        setPendingChanges(res.data);
    } catch (err) {
        console.error("Failed to fetch pending changes", err);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const hasPendingProfileChanges = pendingChanges.some(c => c.change_type === 'profile' && c.status === 'pending');

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Maximum size is 5MB");
      if (e.target) e.target.value = "";
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      setSubmitStatus("saving");
      const res = await apiClient.post(
        `${API_BASE}/scholars/me/avatar`,
        formData,
      );
      mutateProfile({ ...profile, avatar_url: res.data.avatar_url });
      setSubmitStatus("success");
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (err) {
      setSubmitStatus("error");
      alert(err.response?.data?.detail || "Upload failed");
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.post(`${API_BASE}/auth/logout`);
    } catch (err) {
      // Ignore logout errors
    }
    removeToken();
    navigate("/login");
  };

  const editableFields = [
    { key: 'first_name', label: 'First Name', type: 'text', required: true },
    { key: 'last_name', label: 'Last Name', type: 'text', required: true },
    { key: 'middle_name', label: 'Middle Name', type: 'text' },
    { key: 'date_of_birth', label: 'Date of Birth', type: 'date' },
    { key: 'place_of_birth', label: 'Place of Birth', type: 'text' },
    { key: 'sex', label: 'Sex', type: 'text' },
    { key: 'civil_status', label: 'Civil Status', type: 'text' },
    { key: 'religion', label: 'Religion', type: 'text' },
    { key: 'contact_number', label: 'Contact Number', type: 'tel' },
    { key: 'address', label: 'Address', type: 'text' },
    { key: 'batch_number', label: 'Batch Number', type: 'text' },
    { key: 'year_level', label: 'Year Level', type: 'text' },
    { key: 'course', label: 'Course', type: 'text' },
    { key: 'school', label: 'School', type: 'text' },
    { key: 'student_type', label: 'Student Type', type: 'text' },
  ];

  const startEditing = () => {
    const form = {};
    editableFields.forEach(({ key }) => { form[key] = profile[key] || ""; });
    setEditForm(form);
    setIsEditing(true);
    setSubmitStatus(null);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: false });
  };

  const [errors, setErrors] = useState({});

  const saveChanges = async () => {
    const newErrors = {};
    editableFields.filter(f => f.required).forEach(({ key }) => {
      if (!editForm[key] || editForm[key].trim() === "") {
        newErrors[key] = true;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitStatus("error");
      return;
    }

    setSubmitStatus("saving");
    const cleanedData = { ...editForm };
    Object.keys(cleanedData).forEach((key) => {
      if (cleanedData[key] === "") {
        cleanedData[key] = null;
      }
    });

    try {
      await apiClient.post(`${API_BASE}/scholars/me/update`, cleanedData);
      setSubmitStatus("success");
      setIsEditing(false);
      setErrors({});
      fetchPending();
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (err) {
      setSubmitStatus("error");
    }
  };

  if (!profile)
    return (
      <Layout>
        <div className="flex justify-center items-center h-[60vh] text-primary">
          Loading identity...
        </div>
      </Layout>
    );

  return (
    <Layout>
      {submitStatus === "success" && (
        <div className="bg-primary-pale text-on-primary p-4 rounded-xl mb-6 font-bold flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">check_circle</span>{" "}
          Changes submitted to queue!
        </div>
      )}

      <section className="flex flex-col items-center text-center space-y-4 mb-8">
        <div className="relative group">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarUpload}
            accept="image/jpeg, image/png, image/webp"
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`w-32 h-32 md:w-[200px] md:h-[200px] rounded-full border-4 border-outline/50est shadow-lg overflow-hidden flex items-center justify-center cursor-pointer relative ${getAvatarColor(profile.id)}`}
          >
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl md:text-6xl font-headline font-bold">
                {profile.first_name?.[0]}
                {profile.last_name?.[0]}
              </span>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white text-3xl">
                photo_camera
              </span>
            </div>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-gold text-on-primary w-10 h-10 flex items-center justify-center rounded-full shadow-lg hover:bg-gold-light transition-colors z-10"
            title="Change Profile Picture"
          >
            <span className="material-symbols-outlined text-sm md:text-base">
              photo_camera
            </span>
          </button>
        </div>
        <div>
          <h2 className="font-headline font-extrabold text-2xl text-on-surface">
            {profile.first_name} {profile.last_name}
          </h2>
          <div className="flex items-center justify-center mt-2">
            <span className="text-label-sm font-label uppercase tracking-widest text-on-surface-variant bg-surface-high px-3 py-1 rounded-full text-[10px] font-bold">
              Scholar ID: ES-2024-{profile.id.substring(0, 4)}
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <section className="md:col-span-8 bg-surface-container-lowest rounded-[32px] p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-headline font-bold text-xl text-primary">Personal Information</h3>
              {hasPendingProfileChanges && (
                  <span className="text-gold text-[9px] bg-gold/15 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                      UNDER REVIEW
                  </span>
              )}
            </div>
             {isEditing ? (
                 <button onClick={() => setIsEditing(false)} className="text-error"><span className="material-symbols-outlined">close</span></button>
             ) : (
                 <button onClick={startEditing} className="text-outline hover:text-primary transition-colors">
                     <span className="material-symbols-outlined">person_edit</span>
                 </button>
             )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {editableFields.map(({ key, label, type, required }) => (
              <div key={key} className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                  {label}{required && <span className="text-red-accent ml-0.5">*</span>}
                </label>
                <input
                  className={`w-full ${isEditing ? (errors[key] ? "bg-surface-container-lowest ring-2 ring-red-500" : "bg-surface-container-lowest ring-2 ring-primary") : "bg-surface-high border border-outline"} rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-on-surface font-medium outline-none transition-all`}
                  name={key}
                  type={isEditing ? type : "text"}
                  readOnly={!isEditing}
                  value={isEditing ? editForm[key] : (profile[key] || "")}
                  onChange={handleEditChange}
                />
              </div>
            ))}
          </div>
          {isEditing && (
            <div className="pt-4 flex flex-col items-end gap-2">
              {submitStatus === "error" && (
                <p className="text-[#E53935] text-xs font-bold text-right">
                  Please fill in all fields.
                </p>
              )}
              <div className="flex gap-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-on-surface-variant px-4 py-3 font-bold hover:text-on-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveChanges}
                  disabled={submitStatus === "saving"}
                  className={`bg-primary text-on-primary px-8 py-3 rounded-full font-bold shadow-md hover:bg-primary-dark transition-all active:scale-95 ${submitStatus === "saving" ? "opacity-70" : ""}`}
                >
                  {submitStatus === "saving" ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </section>

        <div className="md:col-span-4 space-y-6">
          <section className="bg-surface-container-lowest rounded-[32px] p-6 shadow-sm space-y-4">
            <h3 className="font-headline font-bold text-lg text-primary flex items-center gap-2">
              <span className="material-symbols-outlined">verified_user</span>{" "}
              Account Security
            </h3>
            <div className="flex flex-col gap-3">
              <div className="w-full flex items-center justify-between px-5 py-4 bg-surface-alt rounded-2xl text-on-surface opacity-80">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">
                    email
                  </span>
                  <span className="font-bold text-sm">{profile.email}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-[32px] p-2 shadow-sm">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-5 py-4 bg-error-container/20 hover:bg-error-container/40 dark:bg-red-accent/10 dark:hover:bg-red-accent/20 transition-colors rounded-[24px] text-error group"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined font-bold">
                  logout
                </span>
                <span className="font-bold text-sm uppercase tracking-wider">
                  Log Out
                </span>
              </div>
              <span className="material-symbols-outlined text-error/50 group-hover:translate-x-1 transition-transform">
                chevron_right
              </span>
            </button>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
