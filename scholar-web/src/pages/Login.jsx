import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import '../index.css';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/');
    }
  }, [navigate]);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('http://localhost:8000/auth/google', {
        id_token: credentialResponse.credential
      });
      localStorage.setItem('token', res.data.access_token);
      navigate('/');
    } catch (err) {
      alert("Login failed! Ensure your backend is running and scholar account exists.");
    }
  };

  const handleDevLogin = async () => {
    try {
      const res = await axios.post('http://localhost:8000/auth/dev-login', {
        email: "scholar@test.com"
      });
      localStorage.setItem('token', res.data.access_token);
      navigate('/');
      window.location.reload();
    } catch (err) {
      alert("Dev Login failed!");
    }
  };

  return (
    <div style={styles.container}>
      {/* Level 2 depth for the card mapping to DESIGN.md tone standards */}
      <div className="surface-lowest" style={styles.card}>
        <div style={styles.header}>
          <h1 className="headline-lg" style={{color: 'var(--primary)'}}>The Academic Luminary</h1>
          <p className="label-md" style={{marginTop: '0.5rem', color: 'var(--on-surface-variant)'}}>Authenticating your secure portal access.</p>
        </div>

        <div style={styles.loginBox}>
          <div style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
             <GoogleLogin 
               onSuccess={handleGoogleSuccess}
               onError={() => alert('Google Sign In was unsuccessful')}
               shape="pill"
               theme="filled_black"
               size="large"
               text="continue_with"
             />
          </div>
          
          <div style={styles.divider}>
            <span className="label-md" style={{background: 'var(--surface-lowest)', padding: '0 15px', position: 'relative', zIndex: 1}}>Or configure directly</span>
            <hr style={{borderTop: '1px solid var(--outline-variant)', width: '100%', position: 'absolute', top: '10px', zIndex: 0, borderBottom: 'none'}} />
          </div>

          <button className="btn-secondary" onClick={handleDevLogin} style={{ width: '100%' }}>
            Access Environment Sandbox
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100%',
    background: 'var(--background)'
  },
  card: {
    width: '100%',
    maxWidth: '430px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem',
  },
  header: {
    textAlign: 'center',
  },
  loginBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    alignItems: 'center'
  },
  divider: {
    width: '100%',
    textAlign: 'center',
    position: 'relative',
    marginTop: '0.5rem'
  }
};

export default Login;
