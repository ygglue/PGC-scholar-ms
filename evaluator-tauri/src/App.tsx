import { useState, useEffect, lazy, Suspense } from "react";
import { Login } from "./components/Login";
import { TitleBar } from "./components/TitleBar";
import { Modal, ModalProps } from "./components/shared/Modal";
import { getToken, removeToken } from "./services/secureStore";
import { syncService } from "./services/syncService";
import { getTheme, saveTheme } from "./services/settingsStore";
import "./index.css";

const Dashboard = lazy(() => import("./components/Dashboard").then(m => ({ default: m.Dashboard })));
const ScholarsDirectory = lazy(() => import("./components/ScholarsDirectory").then(m => ({ default: m.ScholarsDirectory })));
const SubmissionBins = lazy(() => import("./components/SubmissionBins").then(m => ({ default: m.SubmissionBins })));
const BinDocuments = lazy(() => import("./components/BinDocuments").then(m => ({ default: m.BinDocuments })));
const PendingSubmissions = lazy(() => import("./components/PendingSubmissions").then(m => ({ default: m.PendingSubmissions })));
const Announcements = lazy(() => import("./components/Announcements").then(m => ({ default: m.Announcements })));
const Settings = lazy(() => import("./components/Settings").then(m => ({ default: m.Settings })));

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [view, setView] = useState<'dashboard' | 'submissions' | 'directory' | 'bins' | 'announcements' | 'settings'>('dashboard');
  const [selectedBin, setSelectedBin] = useState<any>(null);

  // Global Modal State
  const [modalConfig, setModalConfig] = useState<Omit<ModalProps, 'isOpen'> | null>(null);

  const showModal = (config: Omit<ModalProps, 'isOpen'>) => {
    setModalConfig(config);
  };

  const closeModal = () => {
    setModalConfig(null);
  };

  useEffect(() => {
    const init = async () => {
      const t = await getToken();
      setToken(t);
      if (t) syncService.start();

      const saved = await getTheme();
      setTheme(saved as 'light' | 'dark');
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      setLoading(false);
    };
    init();
    return () => syncService.stop();
  }, []);

  // Sync state with login/logout
  useEffect(() => {
    if (token) {
      syncService.start();
    } else {
      syncService.stop();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-[#F0F2F0] dark:bg-dark-page">
        <TitleBar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[#1A8C3C] text-xl">Initializing secure session...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="h-screen flex flex-col">
        <TitleBar />
        <div className="flex-1">
          <Login onSuccess={(t) => setToken(t)} onShowModal={showModal} />
        </div>
      </div>
    );
  }

  const handleToggleTheme = async () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    await saveTheme(next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const renderContent = () => {
    const commonProps = { onShowModal: showModal };
    if (view === 'settings') return <Settings theme={theme} onToggleTheme={handleToggleTheme} />;
    if (view === 'dashboard') return <Dashboard onNavigate={(v) => {setView(v); setSelectedBin(null);}} {...commonProps} />;
    if (view === 'directory') return <ScholarsDirectory {...commonProps} />;
    if (view === 'announcements') return <Announcements {...commonProps} />;
    if (view === 'bins') {
      if (selectedBin) return <BinDocuments bin={selectedBin} onBack={() => setSelectedBin(null)} {...commonProps} />;
      return <SubmissionBins onOpenBin={(b) => setSelectedBin(b)} {...commonProps} />;
    }
    return <PendingSubmissions {...commonProps} />;
  };

  const SuspendedContent = () => (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-[#A0AEC0] dark:text-dark-text-muted text-sm">Loading...</div>}>
      {renderContent()}
    </Suspense>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TitleBar
        onOpenSettings={() => { setView('settings'); setSelectedBin(null); }}
        onLogout={async () => { await removeToken(); setToken(null); }}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Global Modal */}
        {modalConfig && (
          <Modal 
            isOpen={true} 
            {...modalConfig} 
            onConfirm={() => {
              modalConfig.onConfirm();
              closeModal();
            }}
            onCancel={() => {
              modalConfig.onCancel?.();
              closeModal();
            }}
          />
        )}

      <aside className="w-[280px] bg-[#0F5C27] text-white p-8 flex flex-col shrink-0">
        <h2 className="text-xl font-bold mb-12">PGC-Scholar<br/>Evaluator</h2>
        <nav className="flex flex-col gap-4">
          <button 
            onClick={() => {setView('dashboard'); setSelectedBin(null);}} 
            className={`text-left py-2 transition-all ${view === 'dashboard' ? 'font-bold pl-2 border-l-2 border-white' : 'opacity-70 hover:opacity-100'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => {setView('submissions'); setSelectedBin(null);}} 
            className={`text-left py-2 transition-all ${view === 'submissions' ? 'font-bold pl-2 border-l-2 border-white' : 'opacity-70 hover:opacity-100'}`}
          >
            Pending Submissions
          </button>
          <button 
            onClick={() => {setView('directory'); setSelectedBin(null);}} 
            className={`text-left py-2 transition-all ${view === 'directory' ? 'font-bold pl-2 border-l-2 border-white' : 'opacity-70 hover:opacity-100'}`}
          >
            Scholars Directory
          </button>
          <button 
            onClick={() => {setView('bins'); setSelectedBin(null);}} 
            className={`text-left py-2 transition-all ${view === 'bins' ? 'font-bold pl-2 border-l-2 border-white' : 'opacity-70 hover:opacity-100'}`}
          >
            Submission Bins
          </button>
          <button 
            onClick={() => {setView('announcements'); setSelectedBin(null);}} 
            className={`text-left py-2 transition-all ${view === 'announcements' ? 'font-bold pl-2 border-l-2 border-white' : 'opacity-70 hover:opacity-100'}`}
          >
            Announcements
          </button>
        </nav>
      </aside>

      <main className="flex-1 overflow-hidden bg-[#F0F2F0] dark:bg-dark-page">
        <SuspendedContent />
      </main>
      </div>
    </div>
  );
}

export default App;
