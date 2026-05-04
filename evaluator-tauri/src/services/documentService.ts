import { mkdir, writeFile, exists } from '@tauri-apps/plugin-fs';
import { join, documentDir, appCacheDir } from '@tauri-apps/api/path';
import axios from 'axios';
import { getCacheDir } from './settingsStore';

export const DocumentService = {
  async getPreferredCacheBaseDir(): Promise<string> {
    const custom = await getCacheDir();
    if (custom) return custom;
    return await join(await documentDir(), 'ISKOnektado');
  },

  async getFallbackCacheBaseDir(): Promise<string> {
    return await join(await appCacheDir(), 'documents');
  },

  async resolveWritableCacheBaseDir(): Promise<string> {
    const preferred = await this.getPreferredCacheBaseDir();
    try {
      await mkdir(preferred, { recursive: true });
      return preferred;
    } catch (preferredErr) {
      console.warn(`DocumentService: Preferred cache path unavailable (${preferred}). Falling back to app cache.`, preferredErr);
      const fallback = await this.getFallbackCacheBaseDir();
      await mkdir(fallback, { recursive: true });
      return fallback;
    }
  },

  async downloadAndCacheDocument(docId: string, scholarId: string, url: string): Promise<string> {
    const safeDocId = docId.replace(/[^a-zA-Z0-9_-]/g, '');
    const safeScholarId = scholarId.replace(/[^a-zA-Z0-9_-]/g, '');
    const fileName = `${safeDocId}.pdf`;
    const baseDir = await this.resolveWritableCacheBaseDir();
    const scholarDir = await join(baseDir, safeScholarId);
    const cachePath = await join(scholarDir, fileName);
    
    console.log(`DocumentService: Attempting to cache at ${cachePath}`);

    await mkdir(scholarDir, { recursive: true });

    // Check if it already exists
    let hasCached = false;
    try {
      hasCached = await exists(cachePath);
    } catch (existsErr) {
      console.error(`DocumentService: Could not verify existing cache at ${cachePath}. Aborting download to avoid duplicate fetch.`, existsErr);
      throw new Error(`Cache verification failed for ${cachePath}`);
    }

    if (!hasCached) {
      console.log(`DocumentService: Downloading ${url}`);
      // Download binary
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const binaryData = new Uint8Array(response.data);

      // Save to disk
      console.log(`DocumentService: Writing ${binaryData.length} bytes to ${cachePath}`);
      try {
      await writeFile(cachePath, binaryData);
        console.log("DocumentService: Write successful.");
      } catch (writeErr) {
        console.error("DocumentService: Write failed!", writeErr);
        throw writeErr;
      }
    } else {
      console.log(`DocumentService: File already exists at ${cachePath}`);
    }

    return cachePath;
  }
};
