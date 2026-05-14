import React, { useState, useEffect, useRef } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';

interface TitleBarProps {
  onOpenSettings?: () => void;
  onLogout?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({ onOpenSettings, onLogout }) => {
  const [maximized, setMaximized] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const w = getCurrentWindow();

  useEffect(() => {
    (async () => {
      try {
        setMaximized(await w.isMaximized());
        const unlisten = await w.onResized(async () => {
          setMaximized(await w.isMaximized());
        });
        return () => unlisten();
      } catch (_) {}
    })();
  }, []);

  useEffect(() => {
    if (!menuPos) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuPos(null);
      }
    };
    const keyClose = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuPos(null);
    };
    window.addEventListener('mousedown', close);
    window.addEventListener('keydown', keyClose);
    return () => {
      window.removeEventListener('mousedown', close);
      window.removeEventListener('keydown', keyClose);
    };
  }, [menuPos]);

  const handleMinimize = async () => {
    setMenuPos(null);
    try { await w.minimize(); } catch (_) {}
  };

  const handleMaximize = async () => {
    setMenuPos(null);
    try { await w.toggleMaximize(); } catch (_) {}
  };

  const handleClose = async () => {
    setMenuPos(null);
    try { await w.close(); } catch (_) {}
  };

  const handleRestore = async () => {
    setMenuPos(null);
    try {
      if (await w.isMaximized()) await w.toggleMaximize();
    } catch (_) {}
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  const Btn: React.FC<{ onClick: () => void; title: string; danger?: boolean; children: React.ReactNode }> = ({ onClick, title, danger, children }) => (
    <button
      onClick={onClick}
      className={`flex items-center justify-center w-7 h-7 rounded-md text-white/60 hover:text-white transition-colors ${danger ? 'hover:bg-red-600' : 'hover:bg-white/10'}`}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <>
      <div
        data-tauri-drag-region
        onDoubleClick={handleMaximize}
        onContextMenu={handleContextMenu}
        className="h-9 bg-[#0F5C27] flex items-center justify-between shrink-0 select-none"
      >
        <div data-tauri-drag-region className="flex items-center gap-2 px-4">
          <span data-tauri-drag-region className="text-[11px] font-semibold text-white/80 tracking-wide">
            PGC-Scholar Evaluator
          </span>
        </div>
        <div className="flex items-center h-full gap-0.5 pr-2">
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 h-7 mr-1 rounded-md border border-white/30 text-[11px] font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="Log out"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          )}
          {onOpenSettings && (
            <Btn onClick={() => onOpenSettings?.()} title="Settings">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </Btn>
          )}
          {(onLogout || onOpenSettings) && <div className="w-px h-5 bg-white/20 mx-2" />}
          <Btn onClick={handleMinimize} title="Minimize">
            <svg width="10" height="10" viewBox="0 0 10 10">
              <rect x="1" y="4.5" width="8" height="1" fill="currentColor" />
            </svg>
          </Btn>
          <Btn onClick={handleMaximize} title={maximized ? 'Restore' : 'Maximize'}>
            {maximized ? (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <rect x="2" y="0.5" width="7" height="7" rx="0.5" fill="none" stroke="currentColor" strokeWidth="0.8" />
                <rect x="0.5" y="2" width="7" height="7" rx="0.5" fill="none" stroke="currentColor" strokeWidth="0.8" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <rect x="0.5" y="0.5" width="9" height="9" rx="0.5" fill="none" stroke="currentColor" strokeWidth="0.8" />
              </svg>
            )}
          </Btn>
          <Btn onClick={handleClose} title="Close" danger>
            <svg width="10" height="10" viewBox="0 0 10 10">
              <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1" />
              <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1" />
            </svg>
          </Btn>
        </div>
      </div>

      {menuPos && (
        <div
          ref={menuRef}
          className="fixed z-[200] w-48 py-1 bg-white dark:bg-dark-card border border-[#E0E6E0] dark:border-dark-border rounded-lg shadow-xl text-sm select-none"
          style={{ left: menuPos.x, top: menuPos.y }}
        >
          <button
            onClick={handleRestore}
            className="w-full text-left px-4 py-1.5 text-[#1A1A1A] dark:text-dark-text hover:bg-[#F7F9F7] dark:hover:bg-dark-surface disabled:opacity-40"
            disabled={!maximized}
          >
            Restore
          </button>
          <button
            onClick={handleMinimize}
            className="w-full text-left px-4 py-1.5 text-[#1A1A1A] dark:text-dark-text hover:bg-[#F7F9F7] dark:hover:bg-dark-surface"
          >
            Minimize
          </button>
          <button
            onClick={handleMaximize}
            className="w-full text-left px-4 py-1.5 text-[#1A1A1A] dark:text-dark-text hover:bg-[#F7F9F7] dark:hover:bg-dark-surface disabled:opacity-40"
            disabled={maximized}
          >
            Maximize
          </button>
          <div className="h-px bg-[#E0E6E0] dark:bg-dark-border my-1" />
          <button
            onClick={handleClose}
            className="w-full text-left px-4 py-1.5 text-[#1A1A1A] dark:text-dark-text hover:bg-[#F7F9F7] dark:hover:bg-dark-surface"
          >
            Close
          </button>
        </div>
      )}
    </>
  );
};
