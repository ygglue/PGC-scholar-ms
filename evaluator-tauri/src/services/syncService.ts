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

  private isSyncing = false;
  private retryCount = 0;
  private readonly MAX_RETRIES = 3;

  constructor() {
    this.handleNetworkChange = this.handleNetworkChange.bind(this);
  }

  start() {
    if (this.syncInterval) return;
    console.log('SyncService: Starting background sync...');
    
    // Listen to network status changes
    NetworkStatus.addCallback(this.handleNetworkChange);
    
    // Sync immediately on start
    this.performSync();

    // Set up periodic sync
    this.syncInterval = setInterval(() => this.performSync(), this.INTERVAL_MS);
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      NetworkStatus.removeCallback(this.handleNetworkChange);
      console.log('SyncService: Stopped.');
    }
  }

  private handleNetworkChange(isOnline: boolean) {
    if (isOnline) {
      console.log('SyncService: Connection restored. Triggering immediate sync.');
      this.performSync();
    }
  }

  private async performSync() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    const isOnline = await NetworkStatus.checkApiConnection();
    if (!isOnline) {
      console.log('SyncService: Offline, skipping sync.');
      this.isSyncing = false;
      return;
    }

    console.log('SyncService: Fetching fresh data...');

    const endpoints = [
      { key: 'scholars/list', path: '/scholars/' },
      { key: 'bins/list', path: '/submission-bins/' },
      { key: 'pending_changes/list', path: '/pending-changes/' }
    ];

    const results = await Promise.allSettled(
      endpoints.map(ep => api.get(ep.path))
    );

    results.forEach((res, index) => {
      if (res.status === 'fulfilled') {
        CacheService.set(endpoints[index].key, res.value.data);
      } else {
        console.error(`SyncService: Failed to sync ${endpoints[index].path}:`, res.reason);
      }
    });

    this.isSyncing = false;
    console.log('SyncService: Sync cycle complete.');
  }
}

export const syncService = new SyncService();
