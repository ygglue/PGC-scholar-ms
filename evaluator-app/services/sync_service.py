import requests
from PySide6.QtCore import QObject, Signal, QThread
from datetime import datetime, timezone
from services.cache_service import get_cache_service, GLOBAL_SYNC_KEY, PERMANENT_TTL
from services.network_status import get_network_status

API_BASE = "http://localhost:8000"

class SyncWorker(QThread):
    finished = Signal(bool, str) # success, message
    progress = Signal(str)

    def __init__(self, token):
        super().__init__()
        self.token = token
        self.cache = get_cache_service()
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def run(self):
        try:
            if not get_network_status().is_online():
                self.finished.emit(False, "Offline - sync skipped")
                return

            self.progress.emit("Checking for updates...")
            
            # 1. Get Global Last Changed
            res = requests.get(f"{API_BASE}/sync/last-changed", headers=self.headers, timeout=10)
            if res.status_code != 200:
                self.finished.emit(False, f"Sync check failed: {res.status_code}")
                return
            
            server_last_changed = res.json().get("last_updated_at")
            if not server_last_changed:
                self.finished.emit(True, "System state is empty")
                return

            local_sync_info = self.cache.get(GLOBAL_SYNC_KEY) or {}
            local_last_changed = local_sync_info.get("last_updated_at")

            if local_last_changed == server_last_changed:
                self.finished.emit(True, "All data is up to date")
                return

            # 2. Sync each resource
            sync_tasks = [
                ("scholars", "/scholars", "scholars/list"),
                ("submission bins", "/submission-bins", "submission_bins/list"),
                ("academic records", "/academic-records", "academic_records/list"),
                ("documents", "/documents", "documents/list"),
                ("pending changes", "/pending-changes", "pending_changes/list")
            ]

            for label, endpoint, cache_key in sync_tasks:
                if self.isInterruptionRequested():
                    return

                self.progress.emit(f"Syncing {label}...")
                last_updated = self.cache.get_last_updated_at(cache_key)
                
                params = {}
                if last_updated:
                    params["updated_since"] = last_updated
                
                # For pending changes, we want all statuses during sync
                if cache_key == "pending_changes/list":
                    params["status"] = "all"

                res = requests.get(f"{API_BASE}{endpoint}", headers=self.headers, params=params, timeout=15)
                if res.status_code == 200:
                    delta = res.json()
                    if delta:
                        self.cache.merge_data(cache_key, delta)
                elif res.status_code == 401:
                    self.finished.emit(False, f"Session expired during {label} sync")
                    return
                else:
                    # Log error but continue other tasks
                    print(f"Failed to sync {label}: {res.status_code}")

            # 3. Update local global sync timestamp
            self.cache.set(GLOBAL_SYNC_KEY, {"last_updated_at": server_last_changed}, PERMANENT_TTL)
            
            self.finished.emit(True, "Synchronization complete")

        except Exception as e:
            self.finished.emit(False, f"Sync error: {str(e)}")

class SyncService(QObject):
    sync_finished = Signal(bool, str)
    sync_progress = Signal(str)
    session_expired = Signal()

    def __init__(self):
        super().__init__()
        self._worker = None

    def start_sync(self, token):
        # If already running, request interruption and start new one
        if self._worker and self._worker.isRunning():
            self._worker.requestInterruption()
            self._worker.wait()
        
        self._worker = SyncWorker(token)
        self._worker.finished.connect(self.sync_finished.emit)
        self._worker.progress.connect(self.sync_progress.emit)
        # Connect session expiration
        self._worker.finished.connect(lambda success, msg: self.session_expired.emit() if "Session expired" in msg else None)
        self._worker.start()

    def cancel_sync(self):
        if self._worker and self._worker.isRunning():
            self._worker.requestInterruption()
            self._worker.wait()

_sync_service = None

def get_sync_service():
    global _sync_service
    if _sync_service is None:
        _sync_service = SyncService()
    return _sync_service
