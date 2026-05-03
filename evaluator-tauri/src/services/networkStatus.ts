/**
 * NetworkStatus Service for React/Tauri.
 * Replaces PySide6 QObject monitoring with browser online/offline events
 * and automated API polling.
 */

type StatusCallback = (isOnline: boolean) => void;

class NetworkStatusService {
  private isOnline: boolean = navigator.onLine;
  private callbacks: Set<StatusCallback> = new Set();
  private pingInterval: number;
  private intervalId: number | null = null;

  constructor(pingIntervalSeconds: number = 30) {
    this.pingInterval = pingIntervalSeconds * 1000;
    
    // Listen to browser online/offline events
    window.addEventListener('online', () => this.handleStatusChange(true));
    window.addEventListener('offline', () => this.handleStatusChange(false));
  }

  private async handleStatusChange(status: boolean) {
    if (this.isOnline !== status) {
      this.isOnline = status;
      this.callbacks.forEach(cb => cb(status));
    }
  }

  public async checkApiConnection(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // Assumes API_BASE is configured in env
      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:8000'}/health`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  public start() {
    if (this.intervalId) return;
    
    this.intervalId = window.setInterval(async () => {
      const currentStatus = await this.checkApiConnection();
      this.handleStatusChange(currentStatus);
    }, this.pingInterval);
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  public addCallback(cb: StatusCallback) {
    this.callbacks.add(cb);
  }

  public removeCallback(cb: StatusCallback) {
    this.callbacks.delete(cb);
  }
}

export const NetworkStatus = new NetworkStatusService();
