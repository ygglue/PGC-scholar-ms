import { useNavigate, useLocation } from 'react-router-dom';
import { useApiCache } from '../hooks/useApiCache';
import { API_BASE } from '../config/api';
import { getAvatarColor } from '../utils/colors';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: profile } = useApiCache('profile', `${API_BASE}/scholars/me`);

  return (
    <div className="bg-surface-container-low text-on-surface min-h-screen pb-32">
      {/* Top App Bar */}
      <header className="bg-emerald-50/70 dark:bg-emerald-950/70 backdrop-blur-xl fixed top-0 w-full z-50 shadow-sm">
        <div className="flex justify-between items-center px-6 py-4 w-full">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-emerald-800 dark:text-emerald-200 font-headline">PGC-ISKOnektado</h1>
          </div>
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
               <img src={profile.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-primary/20" />
            ) : profile ? (
               <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold font-headline ${getAvatarColor(profile.id)}`}>
                 {profile.first_name?.[0]}{profile.last_name?.[0]}
               </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-4xl mx-auto space-y-8">
        {children}
      </main>

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-white/80 dark:bg-emerald-900/80 backdrop-blur-2xl shadow-xl rounded-t-[32px]">
        {/* Home */}
        <button 
           onClick={() => navigate('/')}
           className={`flex flex-col items-center justify-center rounded-full px-6 py-2 transition-all ${location.pathname === '/' ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-50 active-nav' : 'text-emerald-800/50 dark:text-emerald-200/50 hover:bg-emerald-50 dark:hover:bg-emerald-800/50'}`}>
          <span className="material-symbols-outlined">home</span>
          <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest font-bold mt-0.5">Home</span>
        </button>
        {/* Inbox */}
        <button 
           onClick={() => navigate('/inbox')}
           className={`flex flex-col items-center justify-center rounded-full px-6 py-2 transition-all ${location.pathname === '/inbox' ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-50 active-nav' : 'text-emerald-800/50 dark:text-emerald-200/50 hover:bg-emerald-50 dark:hover:bg-emerald-800/50'}`}>
          <span className="material-symbols-outlined">mail</span>
          <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest font-bold mt-0.5">Inbox</span>
        </button>
        {/* Profile */}
        <button 
           onClick={() => navigate('/profile')}
           className={`flex flex-col items-center justify-center rounded-full px-6 py-2 transition-all ${location.pathname === '/profile' ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-50 active-nav' : 'text-emerald-800/50 dark:text-emerald-200/50 hover:bg-emerald-50 dark:hover:bg-emerald-800/50'}`}>
          <span className="material-symbols-outlined">person</span>
          <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest font-bold mt-0.5">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
