import React, { useState, useEffect } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { getCacheDir, saveCacheDir } from '../services/settingsStore';

interface SettingsProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ theme, onToggleTheme }) => {
  const [cacheDir, setCacheDir] = useState<string>('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const dir = await getCacheDir();
    setCacheDir(dir || '');
  };

  const handleSelectDir = async () => {
    console.log("HandleSelectDir clicked");
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        defaultPath: cacheDir || undefined,
      });
      
      console.log("Dialog selection result:", selected);
      
      if (selected && typeof selected === 'string') {
        await saveCacheDir(selected);
        setCacheDir(selected);
      }
    } catch (error) {
      console.error("Dialog error:", error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl text-[#1A1A1A] dark:text-dark-text mb-8">Settings</h1>
      
      <div className="space-y-6 max-w-2xl">
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-[#E0E6E0] dark:border-dark-border shadow-sm">
          <h2 className="font-semibold text-[#1A1A1A] dark:text-dark-text mb-4">Cache Location</h2>
          <p className="text-sm text-[#4A5568] dark:text-dark-text-sec mb-6">
            Choose where downloaded documents should be saved.
          </p>
          
          <div className="flex gap-4 items-center">
            <input 
              readOnly
              value={cacheDir || 'Default: ~/Documents/ISKOnektado'}
              className="flex-1 p-3 rounded-xl border border-[#E0E6E0] dark:border-dark-border bg-[#F7F9F7] dark:bg-dark-surface text-sm text-[#4A5568] dark:text-dark-text-sec"
            />
            <button 
              onClick={handleSelectDir}
              className="px-6 py-3 bg-[#1A8C3C] text-white rounded-xl font-semibold text-sm hover:bg-[#0F5C27]"
            >
              Change
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-[#E0E6E0] dark:border-dark-border shadow-sm">
          <h2 className="font-semibold text-[#1A1A1A] dark:text-dark-text mb-4">Appearance</h2>
          <p className="text-sm text-[#4A5568] dark:text-dark-text-sec mb-6">
            Toggle between light and dark mode.
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#1A1A1A] dark:text-dark-text font-medium">Dark Mode</span>
            <button
              onClick={onToggleTheme}
              className={`relative w-14 h-7 rounded-full transition-colors ${theme === 'dark' ? 'bg-[#1A8C3C]' : 'bg-gray-300'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
