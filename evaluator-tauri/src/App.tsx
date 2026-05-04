import { useState, useEffect } from "react";
import { Login } from "./components/Login";
import { ScholarsDirectory } from "./components/ScholarsDirectory";
import { SubmissionBins } from "./components/SubmissionBins";
import { BinDocuments } from "./components/BinDocuments";
import { PendingSubmissions } from "./components/PendingSubmissions";
import { Announcements } from "./components/Announcements";
import { Settings } from "./components/Settings";
import { Modal, ModalProps } from "./components/shared/Modal";
import { getToken, removeToken } from "./services/secureStore";
import { syncService } from "./services/syncService";
import "./index.css";

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'submissions' | 'directory' | 'bins' | 'announcements' | 'settings'>('submissions');
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
    const initAuth = async () => {
      const t = await getToken();
      setToken(t);
      if (t) syncService.start();
      setLoading(false);
    };
    initAuth();
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
      <div className="min-h-screen flex items-center justify-center bg-[#F0F2F0]">
        <p className="text-[#1A8C3C] font-serif text-xl">Initializing secure session...</p>
      </div>
    );
  }

  if (!token) {
    return <Login onSuccess={(t) => setToken(t)} onShowModal={showModal} />;
  }

  const renderContent = () => {
    const commonProps = { onShowModal: showModal };
    if (view === 'settings') return <Settings />;
    if (view === 'directory') return <ScholarsDirectory {...commonProps} />;
    if (view === 'announcements') return <Announcements {...commonProps} />;
    if (view === 'bins') {
      if (selectedBin) return <BinDocuments bin={selectedBin} onBack={() => setSelectedBin(null)} {...commonProps} />;
      return <SubmissionBins onOpenBin={(b) => setSelectedBin(b)} {...commonProps} />;
    }
    return <PendingSubmissions {...commonProps} />;
  };

  return (
    <div className="flex h-screen overflow-hidden">
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
        <h2 className="font-serif text-xl mb-12">PGC-Scholar<br/>Evaluator</h2>
        <nav className="flex flex-col gap-4">
          <button onClick={() => {setView('submissions'); setSelectedBin(null);}} className="text-left py-2">Pending Submissions</button>
          <button onClick={() => {setView('directory'); setSelectedBin(null);}} className="text-left py-2">Scholars Directory</button>
          <button onClick={() => {setView('bins'); setSelectedBin(null);}} className="text-left py-2">Submission Bins</button>
          <button onClick={() => {setView('announcements'); setSelectedBin(null);}} className="text-left py-2">Announcements</button>
          <button onClick={() => {setView('settings'); setSelectedBin(null);}} className="text-left py-2">Settings</button>
        </nav>
        <button 
          className="mt-auto text-left py-2 text-white/70 hover:text-white"
          onClick={async () => {
            await removeToken();
            setToken(null);
          }}
        >
          Log Out
        </button>
      </aside>

      <main className="flex-1 h-screen overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
