import { load } from '@tauri-apps/plugin-store';

const STORE_PATH = 'auth.bin';

export const saveToken = async (token: string) => {
  const store = await load(STORE_PATH);
  await store.set('auth_token', token);
  await store.save();
};

export const getToken = async (): Promise<string | null> => {
  const store = await load(STORE_PATH);
  const token = await store.get<string>('auth_token');
  return token || null;
};

export const removeToken = async () => {
  const store = await load(STORE_PATH);
  await store.delete('auth_token');
  await store.save();
};
