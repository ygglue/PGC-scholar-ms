import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import apiClient, { API_BASE } from '../config/api';
import '../index.css';

const Login = () => {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [navigate]);

  const checkAuth = async () => {
    try {
      await apiClient.get(`${API_BASE}/scholars/me`);
      navigate('/');
    } catch (err) {
      setCheckingAuth(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await apiClient.post(`${API_BASE}/auth/google`, {
        id_token: credentialResponse.credential
      });
      navigate('/');
    } catch (err) {
      alert("Login failed! Ensure your backend is running and scholar account exists.");
    }
  };

  const handleDevLogin = async () => {
    try {
      await apiClient.post(`${API_BASE}/auth/dev-login`, {
        email: "scholar@test.com"
      });
      navigate('/');
    } catch (err) {
      alert("Dev Login failed! Backend may not be running. Make sure VITE_API_URL is set if accessing from another device.");
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
        <p className="text-on-surface-variant">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-[420px] bg-surface-container-lowest rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.04)] p-10 flex flex-col gap-10">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-[#008444] rounded-[20px] mx-auto flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">PGC-Scholar</h1>
          <p className="text-sm text-on-surface-variant mt-2">Sign in to access your scholar portal</p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex justify-center relative z-10">
            <GoogleLogin 
              onSuccess={handleGoogleSuccess}
              onError={() => alert('Google Sign In was unsuccessful')}
              shape="pill"
              theme="filled_black"
              size="large"
              text="continue_with"
            />
          </div>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-outline-variant/30"></div>
            <span className="flex-shrink-0 mx-4 text-xs text-on-surface-variant uppercase tracking-wider">or</span>
            <div className="flex-grow border-t border-outline-variant/30"></div>
          </div>

          <button 
            onClick={handleDevLogin}
            className="w-full relative z-0 bg-surface-container-highest hover:bg-surface-container-high text-on-surface font-semibold py-4 px-6 rounded-full transition-all active:scale-[0.98] min-h-[52px]"
          >
            Access Sandbox Environment
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;