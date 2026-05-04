import React, { useState, useEffect } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { getCacheDir, saveCacheDir } from '../services/settingsStore';

export const Settings: React.FC = () => {
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
      <h1 className="text-2xl font-serif text-[#1A1A1A] mb-8">Settings</h1>
      
      <div className="bg-white p-6 rounded-2xl border border-[#E0E6E0] shadow-sm max-w-2xl">
        <h2 className="font-semibold text-[#1A1A1A] mb-4">Cache Location</h2>
        <p className="text-sm text-[#4A5568] mb-6">
          Choose where downloaded documents should be saved.
        </p>
        
        <div className="flex gap-4 items-center">
          <input 
            readOnly
            value={cacheDir || 'Default: ~/Documents/ISKOnektado'}
            className="flex-1 p-3 rounded-xl border border-[#E0E6E0] bg-[#F7F9F7] text-sm text-[#4A5568]"
          />
          <button 
            onClick={handleSelectDir}
            className="px-6 py-3 bg-[#1A8C3C] text-white rounded-xl font-semibold text-sm hover:bg-[#0F5C27]"
          >
            Change
          </button>
        </div>
      </div>
    </div>
  );
};
