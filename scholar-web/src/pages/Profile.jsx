import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Edit3 } from 'lucide-react';
import Layout from '../components/Layout';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8000/scholars/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch (err) {
         if (err.response && err.response.status === 401) {
             localStorage.removeItem('token');
             navigate('/login');
         }
      }
    };
    fetchProfile();
  }, [navigate]);

  if (!profile) return (
    <Layout>
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh'}}>
          <div className="headline-sm" style={{color: 'var(--primary)'}}>Accessing Personal Data...</div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <header style={{marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2 className="headline-sm">Personal Data</h2>
          <button className="btn-secondary" style={{padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
              <Edit3 size={16}/> Edit Profile
          </button>
      </header>

      <div className="ms-grid">
         <div className="surface-lowest ms-col-5">
            <h3 className="headline-md" style={{marginBottom: '1.5rem'}}>Academic Identifiers</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                <div>
                   <div className="label-sm">Name</div>
                   <div className="body-md" style={{fontWeight: '600'}}>{profile.first_name} {profile.last_name}</div>
                </div>
                <div>
                   <div className="label-sm">Program</div>
                   <div className="body-md" style={{fontWeight: '600'}}>{profile.course}</div>
                </div>
                <div>
                   <div className="label-sm">Institution</div>
                   <div className="body-md" style={{fontWeight: '600'}}>{profile.school}</div>
                </div>
                <div>
                   <div className="label-sm">Cohort</div>
                   <div className="body-md" style={{fontWeight: '600'}}>Batch {profile.batch_number}</div>
                </div>
                <div>
                   <div className="label-sm">Standing</div>
                   <div className="chip-secondary" style={{marginTop: '0.5rem'}}>{profile.status.toUpperCase()}</div>
                </div>
            </div>
         </div>

         <div className="surface-low ms-col-7">
            <h3 className="headline-md" style={{marginBottom: '1.5rem'}}>Contact & Demographics</h3>
            <p className="body-md" style={{color: 'var(--on-surface-variant)'}}>Ensure this information is routinely updated. Any pending changes submitted will be placed in the Evaluator Queue for manual tracking approval.</p>
            
            <div style={{marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                <div>
                   <div className="label-sm">Date of Birth</div>
                   <div className="body-md" style={{fontWeight: '600'}}>{profile.date_of_birth || "Not Stated"}</div>
                </div>
                <div>
                   <div className="label-sm">Contact Number</div>
                   <div className="body-md" style={{fontWeight: '600'}}>{profile.contact_number || "Not Stated"}</div>
                </div>
                <div>
                   <div className="label-sm">Resident Address</div>
                   <div className="body-md" style={{fontWeight: '600'}}>{profile.address || "Not Stated"}</div>
                </div>
            </div>
         </div>
      </div>
    </Layout>
  );
};

export default Profile;
