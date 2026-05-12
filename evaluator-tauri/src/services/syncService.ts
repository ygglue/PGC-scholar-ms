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
  private resourceTimestamps: Record<string, string | null> = {
    'scholars': null,
    'submission_bins': null,
    'pending_changes': null
  };

  private isSyncing = false;

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
      this.isSyncing = false;
      return;
    }

    try {
      const endpoints = [
        { key: 'scholars/list', resource: 'scholars', path: '/scholars/' },
        { key: 'bins/list', resource: 'submission_bins', path: '/submission-bins/' },
        { key: 'pending_changes/list', resource: 'pending_changes', path: '/pending-changes/' }
      ];

      for (const ep of endpoints) {
        const res = await api.get(`/sync/last-changed?resource=${ep.resource}`);
        const remoteTimestamp = res.data.last_updated_at;

        // If local is null (initial load) or remote timestamp is different, fetch data.
        if (this.resourceTimestamps[ep.resource] !== null && remoteTimestamp === this.resourceTimestamps[ep.resource]) {
          console.log(`SyncService: No changes for ${ep.resource}.`);
          continue; // No changes for this resource
        }

        console.log(`SyncService: Fetching fresh data for ${ep.resource}.`);
        
        // Fetch fresh data
        const dataRes = await api.get(ep.path);
        CacheService.set(ep.key, dataRes.data);
        this.resourceTimestamps[ep.resource] = remoteTimestamp;
      }

    } catch (err) {
      console.error('SyncService: Error during sync:', err);
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncService = new SyncService();
