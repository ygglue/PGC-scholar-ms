import api from './apiService';
import { CacheService } from './cacheService';
import { NetworkStatus } from './networkStatus';

/**
 * SyncService
 * Periodically fetches fresh data from the backend to update local caches.
 */
class SyncService {
  private syncInterval: number | null = null;
  private readonly INTERVAL_MS = 60000; // 1 minute sync

  start() {
    if (this.syncInterval) return;
    console.log('SyncService: Starting background sync...');
    
    // Sync immediately on start
    this.performSync();

    // Set up periodic sync
    this.syncInterval = setInterval(() => this.performSync(), this.INTERVAL_MS);
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('SyncService: Stopped.');
    }
  }

  private async performSync() {
    const isOnline = await NetworkStatus.checkApiConnection();
    if (!isOnline) {
      console.log('SyncService: Offline, skipping sync.');
      return;
    }

    console.log('SyncService: Fetching fresh data...');

    try {
      // Sync list views
      const [scholars, bins, changes] = await Promise.all([
        api.get('/scholars/'),
        api.get('/submission-bins/'),
        api.get('/pending-changes/')
      ]);

      // Update persistent caches
      CacheService.set('scholars/list', scholars.data);
      CacheService.set('bins/list', bins.data);
      CacheService.set('pending_changes/list', changes.data);

      console.log('SyncService: Sync successful.');
    } catch (err) {
      console.error('SyncService: Error during sync:', err);
    }
  }
}

export const syncService = new SyncService();
