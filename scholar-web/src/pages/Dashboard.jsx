import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UploadCloud, FileText, CheckCircle } from 'lucide-react';
import Layout from '../components/Layout';

const Dashboard = () => {
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
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', background: 'transparent'}}>
          <div className="headline-sm" style={{color: 'var(--primary)'}}>Mounting Dashboard Engine...</div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <header style={{marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2 className="headline-sm">Semester Hub</h2>
      </header>

      {/* Submission Bin for Current Semester Documents */}
      <section className="hero-gradient" style={{marginBottom: '2.5rem'}}>
          <div style={{flex: 1}}>
              <h1 className="headline-lg">Required Submissions</h1>
              <p className="body-md" style={{marginTop: '0.5rem', opacity: 0.9, maxWidth: '600px'}}>
                Upload your Proof of Enrollment (COR) and Prospectus load for the active semester cycle to maintain your {profile.status} standing.
              </p>
              
              <div style={{marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                  <button className="btn-secondary" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <UploadCloud size={20}/> Upload Document
                  </button>
                  <button className="btn-secondary" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-lowest)', color: 'var(--primary)'}}>
                      <FileText size={20}/> Submit Grades
                  </button>
              </div>
          </div>
      </section>

      {/* Historical Records component */}
      <section className="ms-grid">
           <div className="surface-lowest ms-col-full">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                 <h3 className="headline-md">Historical Records</h3>
                 <span className="chip-tertiary label-sm">All Time Archives</span>
              </div>
              
              {/* Dummy Iteratable Base List */}
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                  <div style={{padding: '1rem', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                     <div>
                         <div className="label-md" style={{color: 'var(--primary)', fontWeight: 'bold'}}>2024-2025 • 2nd Semester</div>
                         <div className="body-md" style={{marginTop: '0.25rem'}}>Submitted: 6 Subjects, Pending Verification</div>
                     </div>
                     <span className="chip-tertiary label-sm">Processing</span>
                  </div>
              
                  <div style={{padding: '1rem', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                     <div>
                         <div className="label-md" style={{color: 'var(--primary)', fontWeight: 'bold'}}>2024-2025 • 1st Semester</div>
                         <div className="body-md" style={{marginTop: '0.25rem'}}>Submitted: 5 Subjects, COR Verified</div>
                     </div>
                     <CheckCircle size={24} color="var(--primary)"/>
                  </div>
              </div>
           </div>
      </section>
    </Layout>
  );
};

export default Dashboard;
