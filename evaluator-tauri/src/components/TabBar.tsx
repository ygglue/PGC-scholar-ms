import React, { useRef, useCallback } from 'react';
import { LayoutDashboard, ClipboardList, Users, FolderOpen, Megaphone, Settings, User, Plus, X } from 'lucide-react';
import { useTabs, TabView } from '../contexts/TabContext';

const viewIcons: Record<TabView, React.ReactNode> = {
  dashboard: <LayoutDashboard size={13} />,
  submissions: <ClipboardList size={13} />,
  directory: <Users size={13} />,
  bins: <FolderOpen size={13} />,
  announcements: <Megaphone size={13} />,
  settings: <Settings size={13} />,
  scholar: <User size={13} />,
  binDocuments: <FolderOpen size={13} />,
};

export const TabBar: React.FC = () => {
  const { tabs, activeTabId, setActiveTab, closeTab, openTab, reorderTabs } = useTabs();
  const dragState = useRef<{ idx: number; lastReorderX: number } | null>(null);
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);

  const getIdxFromX = useCallback((clientX: number) => {
    const rects = tabRefs.current.map(ref => ref?.getBoundingClientRect());
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      if (r && clientX < r.left + r.width / 2) return i;
    }
    return rects.length - 1;
  }, []);

  const handlePointerDown = (e: React.PointerEvent, idx: number) => {
    if ((e.target as HTMLElement).closest('button')) return;
    dragState.current = { idx, lastReorderX: e.clientX };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const ds = dragState.current;
    if (!ds) return;

    if (Math.abs(e.clientX - ds.lastReorderX) < 15) return;

    const newIdx = getIdxFromX(e.clientX);
    if (newIdx !== -1 && newIdx !== ds.idx) {
      reorderTabs(ds.idx, newIdx);
      ds.idx = newIdx;
      ds.lastReorderX = e.clientX;
    }
  };

  const handlePointerUp = () => {
    dragState.current = null;
  };

  const isDragging = (idx: number) => dragState.current?.idx === idx;

  return (
    <div className="h-8 bg-[#0F5C27] dark:bg-dark-card flex items-center shrink-0 overflow-hidden select-none touch-none">
      <div className="flex items-center h-full overflow-x-auto scrollbar-none gap-0.5 px-0.5">
        {tabs.map((tab, idx) => {
          const dragging = isDragging(idx);
          return (
            <div
              key={tab.id}
              ref={el => tabRefs.current[idx] = el}
              onPointerDown={(e) => handlePointerDown(e, idx)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onClick={() => setActiveTab(tab.id)}
              className={`group flex items-center gap-1.5 h-[calc(100%-4px)] px-3 cursor-grab active:cursor-grabbing transition-colors text-white/80 hover:text-white hover:bg-white/20 shrink-0 rounded-md ${
                activeTabId === tab.id ? 'bg-white/25 text-white font-semibold' : ''
              } ${dragging ? 'shadow-xl shadow-black/40' : ''}`}
            >
              <span className="shrink-0">{viewIcons[tab.view]}</span>
              <span className="text-[11px] font-medium whitespace-nowrap max-w-[120px] truncate">
                {tab.title.length > 20 ? tab.title.slice(0, 20) + '…' : tab.title}
              </span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20 rounded p-0.5 shrink-0"
                >
                  <X size={10} />
                </button>
              )}
            </div>
          );
        })}
      </div>
      <button
        onClick={() => openTab('dashboard', 'Dashboard')}
        className="flex items-center justify-center h-full w-8 text-white/80 hover:text-white hover:bg-white/20 transition-colors shrink-0 rounded-md mr-0.5"
        title="New tab"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};
