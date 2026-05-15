import { useState, useEffect, lazy, Suspense } from "react";
import { LayoutDashboard, ClipboardList, Users, FolderOpen, Megaphone, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Login } from "./components/Login";
import { TitleBar } from "./components/TitleBar";
import { Modal, ModalProps } from "./components/shared/Modal";
import { getToken, removeToken } from "./services/secureStore";
import { syncService } from "./services/syncService";
import { getTheme, saveTheme } from "./services/settingsStore";
import { TabProvider, useTabs, Tab, TabView } from "./contexts/TabContext";
import { TabBar } from "./components/TabBar";
import "./index.css";

const Dashboard = lazy(() => import("./components/Dashboard").then(m => ({ default: m.Dashboard })));
const ScholarsDirectory = lazy(() => import("./components/ScholarsDirectory").then(m => ({ default: m.ScholarsDirectory })));
const SubmissionBins = lazy(() => import("./components/SubmissionBins").then(m => ({ default: m.SubmissionBins })));
const ReviewQueue = lazy(() => import("./components/ReviewQueue").then(m => ({ default: m.ReviewQueue })));
const Announcements = lazy(() => import("./components/Announcements").then(m => ({ default: m.Announcements })));
const Settings = lazy(() => import("./components/Settings").then(m => ({ default: m.Settings })));
const ScholarProfile = lazy(() => import("./components/tabs/ScholarProfile").then(m => ({ default: m.ScholarProfile })));
const BinDocumentsView = lazy(() => import("./components/tabs/BinDocumentsView").then(m => ({ default: m.BinDocumentsView })));

function AppInner() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modalConfig, setModalConfig] = useState<Omit<ModalProps, 'isOpen'> | null>(null);
  const { tabs, activeTabId, openTab, navigateTab } = useTabs();

  const showModal = (config: Omit<ModalProps, 'isOpen'>) => setModalConfig(config);
  const closeModal = () => setModalConfig(null);

  useEffect(() => {
    const init = async () => {
      const t = await getToken();
      setToken(t);
      if (t) syncService.start();
      const saved = await getTheme();
      setTheme(saved as 'light' | 'dark');
      if (saved === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      setLoading(false);
    };
    init();
    return () => syncService.stop();
  }, []);

  useEffect(() => {
    if (token) syncService.start();
    else syncService.stop();
  }, [token]);

  const handleToggleTheme = async () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    await saveTheme(next);
    if (next === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const navItems: { view: TabView; icon: React.ComponentType<any>; label: string }[] = [
    { view: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { view: 'submissions', icon: ClipboardList, label: 'Review Queue' },
    { view: 'directory', icon: Users, label: 'Scholars Directory' },
    { view: 'bins', icon: FolderOpen, label: 'Submission Bins' },
    { view: 'announcements', icon: Megaphone, label: 'Announcements' },
  ];

  const handleNavClick = (e: React.MouseEvent, v: TabView, label: string) => {
    if (e.ctrlKey || e.metaKey) {
      openTab(v, label);
    } else {
      navigateTab(v, label);
    }
  };

  const renderTabContent = (tab: Tab) => {
    const commonProps = { onShowModal: showModal };

    switch (tab.view) {
      case 'dashboard':
        return <Dashboard onNavigate={(v: TabView) => navigateTab(v, v.charAt(0).toUpperCase() + v.slice(1))} {...commonProps} />;
      case 'submissions':
        return <ReviewQueue {...commonProps} />;
      case 'directory':
        return <ScholarsDirectory {...commonProps} />;
      case 'bins':
        return <SubmissionBins {...commonProps} />;
      case 'announcements':
        return <Announcements {...commonProps} />;
      case 'settings':
        return <Settings theme={theme} onToggleTheme={handleToggleTheme} />;
      case 'scholar':
        return <ScholarProfile scholarId={tab.data?.scholarId} />;
      case 'binDocuments':
        return <BinDocumentsView bin={tab.data?.bin} />;
      default:
        return null;
    }
  };

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

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TitleBar
        onOpenSettings={() => navigateTab('settings', 'Settings')}
        onLogout={async () => { await removeToken(); setToken(null); }}
      />

      <div className="flex flex-1 overflow-hidden">
        {modalConfig && (
          <Modal isOpen={true} {...modalConfig} onConfirm={() => { modalConfig.onConfirm(); closeModal(); }}
            onCancel={() => { modalConfig.onCancel?.(); closeModal(); }} />
        )}

        <aside className={`${sidebarOpen ? 'w-[240px]' : 'w-[60px]'} bg-[#0F5C27] dark:bg-dark-card text-white shrink-0 overflow-hidden transition-all duration-200 flex flex-col`}>
          <div className={`${sidebarOpen ? 'w-[240px]' : 'w-[60px]'} bg-[#0F5C27] dark:bg-dark-card text-white shrink-0 overflow-hidden transition-all duration-300 flex flex-col h-full`}>
            <div className="flex flex-col items-center h-full px-2">
              <button onClick={() => setSidebarOpen(o => !o)}
                className={`relative flex items-center w-full px-3 h-9 mt-3 rounded-lg opacity-70 hover:opacity-100 hover:bg-white/5 transition-all ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
                <PanelLeftClose size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-opacity duration-200 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} />
                <PanelLeftOpen size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-opacity duration-200 ${sidebarOpen ? 'opacity-0' : 'opacity-100'}`} />
              </button>
              <div className="h-px bg-white/10 mx-auto my-3 w-8" />
              <nav className="flex flex-col w-full gap-3">
                {navItems.map(({ view, icon: Icon, label }) => (
                  <button key={view} onClick={(e) => handleNavClick(e, view, label)}
                    className={`relative flex items-center w-full h-9 rounded-lg transition-all ${tabs.find(t => t.id === activeTabId)?.view === view ? 'bg-white/15 font-bold' : 'opacity-70 hover:opacity-100 hover:bg-white/5'} ${sidebarOpen ? 'justify-start' : 'justify-center'}`}
                    title={label}>
                    <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2" />
                    <span className={`text-sm whitespace-nowrap pl-10 transition-all duration-200 ${sidebarOpen ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0 overflow-hidden'}`}>
                      {label}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden bg-[#F0F2F0] dark:bg-dark-page">
          <div className="flex-1 relative overflow-hidden">
            {tabs.map(tab => (
              <div key={tab.id} className={`absolute inset-0 ${activeTabId === tab.id ? '' : 'hidden'}`}>
                <Suspense fallback={<div className="flex items-center justify-center h-full text-[#A0AEC0] dark:text-dark-text-muted text-sm">Loading...</div>}>
                  {renderTabContent(tab)}
                </Suspense>
              </div>
            ))}
          </div>
          <TabBar />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <TabProvider>
      <AppInner />
    </TabProvider>
  );
}

export default App;
