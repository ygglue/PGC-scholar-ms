import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquareWarning } from 'lucide-react';
import Layout from '../components/Layout';

const Inbox = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  return (
    <Layout>
      <header style={{marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2 className="headline-sm">Inbox</h2>
      </header>

      <section className="ms-grid">
         <div className="surface-lowest ms-col-full">
            <div style={{display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem'}}>
                <Bell size={24} color="var(--primary)"/>
                <h3 className="headline-md">System Notifications & Remarks</h3>
            </div>
            
            {notifications.length === 0 ? (
               <div style={{textAlign: 'center', padding: '4rem 1rem'}}>
                   <MessageSquareWarning size={48} color="var(--outline-variant)" style={{margin: '0 auto 1rem'}}/>
                   <div className="headline-sm" style={{color: 'var(--on-surface-variant)'}}>No active messages</div>
                   <p className="body-md" style={{color: 'var(--on-surface-variant)', marginTop: '0.5rem'}}>You're securely caught up! Evaluator remarks on your requirements will securely appear here.</p>
               </div>
            ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    {/* Items map logic drops here */}
                </div>
            )}
         </div>
      </section>
    </Layout>
  );
};

export default Inbox;
