import React, { createContext, useContext, useState, useCallback } from 'react';

export type TabView = 'dashboard' | 'submissions' | 'directory' | 'bins' | 'announcements' | 'settings' | 'scholar' | 'binDocuments';

export interface Tab {
  id: string;
  view: TabView;
  title: string;
  data?: any;
}

interface TabContextValue {
  tabs: Tab[];
  activeTabId: string;
  openTab: (view: TabView, title: string, data?: any) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  reorderTabs: (from: number, to: number) => void;
  navigateTab: (view: TabView, title: string, data?: any) => void;
}

const TabContext = createContext<TabContextValue | null>(null);

let tabCounter = 1;
const generateId = () => `tab-${tabCounter++}`;

export const TabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tabs, setTabs] = useState<Tab[]>([{ id: 'tab-0', view: 'dashboard', title: 'Dashboard' }]);
  const [activeTabId, setActiveTabId] = useState('tab-0');

  const openTab = useCallback((view: TabView, title: string, data?: any) => {
    const id = generateId();
    setTabs(prev => [...prev, { id, view, title, data }]);
    setActiveTabId(id);
  }, []);

  const closeTab = useCallback((id: string) => {
    setTabs(prev => {
      if (prev.length <= 1) return prev;
      const idx = prev.findIndex(t => t.id === id);
      const next = prev.filter(t => t.id !== id);
      if (activeTabId === id) {
        const newIdx = Math.min(idx, next.length - 1);
        setActiveTabId(next[newIdx].id);
      }
      return next;
    });
  }, [activeTabId]);

  const setActiveTab = useCallback((id: string) => {
    setActiveTabId(id);
  }, []);

  const reorderTabs = useCallback((from: number, to: number) => {
    setTabs(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  const navigateTab = useCallback((view: TabView, title: string, data?: any) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, view, title, data } : t));
  }, [activeTabId]);

  return (
    <TabContext.Provider value={{ tabs, activeTabId, openTab, closeTab, setActiveTab, reorderTabs, navigateTab }}>
      {children}
    </TabContext.Provider>
  );
};

export const useTabs = () => {
  const ctx = useContext(TabContext);
  if (!ctx) throw new Error('useTabs must be used within TabProvider');
  return ctx;
};
