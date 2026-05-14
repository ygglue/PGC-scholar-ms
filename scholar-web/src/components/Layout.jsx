import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApiCache } from "../hooks/useApiCache";
import { API_BASE } from "../config/api";
import { getAvatarColor } from "../utils/colors";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: profile } = useApiCache("profile", `${API_BASE}/scholars/me`);
  const [dark, setDark] = useState(
    () => localStorage.getItem("scholar-theme") === "dark",
  );
  const [hasUnreadInbox, setHasUnreadInbox] = useState(() => {
    const saved = localStorage.getItem("inbox-unread");
    return saved ? parseInt(saved) > 0 : false;
  });

  useEffect(() => {
    const handler = (e) => {
      const unread = e.detail.unread > 0;
      setHasUnreadInbox(unread);
      localStorage.setItem("inbox-unread", e.detail.unread);
    };
    window.addEventListener("inbox-update", handler);
    return () => window.removeEventListener("inbox-update", handler);
  }, []);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("scholar-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="min-h-screen pb-32 transition-colors duration-300">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 shadow-sm bg-surface-container-lowest/90 backdrop-blur-xl border-b border-outline transition-colors">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-primary font-headline">
              PGC-ISKOnektado
            </h1>
          </div>
          <button
            onClick={() => setDark((d) => !d)}
            className="w-9 h-9 rounded-full bg-surface-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            title="Toggle theme"
          >
            <span className="material-symbols-outlined text-lg">
              {dark ? "light_mode" : "dark_mode"}
            </span>
          </button>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-5xl mx-auto space-y-8">{children}</main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-surface-container-lowest/90 backdrop-blur-2xl shadow-xl border-t border-outline transition-colors rounded-t-[32px]">
        <button
          onClick={() => navigate("/")}
          className={`flex flex-col items-center justify-center rounded-full px-6 py-2 transition-all ${location.pathname === "/" ? "text-primary" : "text-on-surface-muted hover:text-primary"}`}
        >
          <span className="material-symbols-outlined">home</span>
          <span className="font-label text-[10px] uppercase tracking-widest font-bold mt-0.5">
            Home
          </span>
        </button>
        <button
          onClick={() => navigate("/inbox")}
          className={`relative flex flex-col items-center justify-center rounded-full px-6 py-2 transition-all ${location.pathname === "/inbox" ? "text-primary" : "text-on-surface-muted hover:text-primary"}`}
        >
          <div className="relative inline-flex">
            {hasUnreadInbox && (
              <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-gold shadow-sm shadow-gold/50" />
            )}
            <span className="material-symbols-outlined">mail</span>
          </div>
          <span className="font-label text-[10px] uppercase tracking-widest font-bold mt-0.5">
            Inbox
          </span>
        </button>
        <button
          onClick={() => navigate("/profile")}
          className={`flex flex-col items-center justify-center rounded-full px-6 py-2 transition-all ${location.pathname === "/profile" ? "text-primary" : "text-on-surface-muted hover:text-primary"}`}
        >
          <span className="material-symbols-outlined">person</span>
          <span className="font-label text-[10px] uppercase tracking-widest font-bold mt-0.5">
            Profile
          </span>
        </button>
      </nav>
    </div>
  );
};

export default Layout;
