import os
import socket
import threading
import time
from typing import Callable

import requests
from PySide6.QtCore import QObject, Signal, Slot


API_BASE = os.environ.get("API_BASE", "http://localhost:8000")


class NetworkStatus(QObject):
    status_changed = Signal(bool)

    def __init__(self, ping_interval: int = 30):
        super().__init__()
        self._is_online = True
        self._ping_interval = ping_interval
        self._running = False
        self._lock = threading.Lock()
        self._callbacks: list[Callable[[bool], None]] = []

    def start(self):
        if self._running:
            return
        self._running = True
        thread = threading.Thread(target=self._monitor_loop, daemon=True)
        thread.start()

    def stop(self):
        self._running = False

    def is_online(self) -> bool:
        with self._lock:
            return self._is_online

    def check_connection(self) -> bool:
        try:
            socket.create_connection(("8.8.8.8", 53), timeout=3)
            response = requests.get(f"{API_BASE}/health", timeout=5)
            return response.status_code == 200
        except (socket.error, requests.RequestException, OSError):
            return False

    def add_callback(self, callback: Callable[[bool], None]):
        if callback not in self._callbacks:
            self._callbacks.append(callback)

    def remove_callback(self, callback: Callable[[bool], None]):
        if callback in self._callbacks:
            self._callbacks.remove(callback)

    def _monitor_loop(self):
        while self._running:
            was_online = self.is_online()
            now_online = self.check_connection()

            with self._lock:
                self._is_online = now_online

            if was_online != now_online:
                self.status_changed.emit(now_online)
                for cb in self._callbacks:
                    try:
                        cb(now_online)
                    except Exception:
                        pass

            time.sleep(self._ping_interval)


_network_status: NetworkStatus | None = None


def get_network_status() -> NetworkStatus:
    global _network_status
    if _network_status is None:
        _network_status = NetworkStatus()
    return _network_status