import { load } from '@tauri-apps/plugin-store';

const STORE_PATH = 'settings.bin';

export const getCacheDir = async (): Promise<string | null> => {
  const store = await load(STORE_PATH);
  return await store.get<string>('cache_dir') || null;
};

export const saveCacheDir = async (path: string) => {
  const store = await load(STORE_PATH);
  await store.set('cache_dir', path);
  await store.save();
};

export const getViewPreference = async (): Promise<string | null> => {
  const store = await load(STORE_PATH);
  return await store.get<string>('view_pref') || null;
};

export const saveViewPreference = async (pref: string) => {
  const store = await load(STORE_PATH);
  await store.set('view_pref', pref);
  await store.save();
};
