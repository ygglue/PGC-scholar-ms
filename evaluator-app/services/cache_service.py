import os
import json
import hashlib
import shutil
import requests
import base64
from pathlib import Path
from datetime import datetime, timezone
from typing import Callable


CACHE_DIR = Path(os.environ.get("APPDATA", os.path.expanduser("~"))) / "PGC-ISKOnektado" / "evaluator-cache"
AUTH_KEY = "auth/session"
GLOBAL_SYNC_KEY = "system/sync"
PERMANENT_TTL = -1


class CacheService:
    def __init__(self, base_dir: Path | None = None):
        self._base_dir = base_dir or CACHE_DIR
        self._base_dir.mkdir(parents=True, exist_ok=True)

    def get(self, key: str) -> dict | None:
        data_file = self._get_data_path(key)
        meta_file = self._get_meta_path(key)

        if not data_file.exists() or not meta_file.exists():
            return None

        try:
            with open(data_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            return None

    def set(self, key: str, data: dict | list, ttl_seconds: int = PERMANENT_TTL):
        data_file = self._get_data_path(key)
        meta_file = self._get_meta_path(key)

        data_file.parent.mkdir(parents=True, exist_ok=True)

        try:
            with open(data_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, default=str) # use str for datetime

            meta = {
                "key": key,
                "fetched_at": datetime.now(timezone.utc).isoformat(),
                "ttl_seconds": ttl_seconds,
            }
            with open(meta_file, "w", encoding="utf-8") as f:
                json.dump(meta, f)
        except OSError as e:
            print(f"Cache write error for {key}: {e}")

    def merge_data(self, key: str, new_items: list, id_field: str = "id"):
        """
        Loads existing list, replaces/adds items from new_items, and saves.
        Useful for delta syncing.
        """
        existing = self.get(key)
        if not isinstance(existing, list):
            existing = []

        # Create a map for faster replacement
        items_map = {str(item[id_field]): item for item in existing}
        
        for item in new_items:
            items_map[str(item[id_field])] = item
            
        merged = list(items_map.values())
        self.set(key, merged, PERMANENT_TTL)
        return merged

    def get_last_updated_at(self, key: str) -> str | None:
        """
        Returns the latest 'updated_at' timestamp from the cached list.
        """
        data = self.get(key)
        if not isinstance(data, list) or not data:
            return None
        
        latest = None
        for item in data:
            ua = item.get("updated_at")
            if ua:
                if latest is None or ua > latest:
                    latest = ua
        return latest

    def is_fresh(self, key: str) -> bool:
        meta_file = self._get_meta_path(key)
        if not meta_file.exists():
            return False

        try:
            with open(meta_file, "r", encoding="utf-8") as f:
                meta = json.load(f)

            fetched = datetime.fromisoformat(meta["fetched_at"])
            ttl = meta.get("ttl_seconds", 0)
            if ttl <= 0:
                return True

            # Handle timezone-aware and timezone-naive comparisons
            now = datetime.now(timezone.utc)
            if fetched.tzinfo is None:
                fetched = fetched.replace(tzinfo=timezone.utc)
            
            age = now - fetched
            age_seconds = age.total_seconds()
            return 0 <= age_seconds < ttl
        except (json.JSONDecodeError, OSError, ValueError, TypeError):
            return False

    def get_age_seconds(self, key: str) -> int | None:
        meta_file = self._get_meta_path(key)
        if not meta_file.exists():
            return None

        try:
            with open(meta_file, "r", encoding="utf-8") as f:
                meta = json.load(f)

            fetched = datetime.fromisoformat(meta["fetched_at"])
            
            # Handle timezone-aware and timezone-naive comparisons
            now = datetime.now(timezone.utc)
            if fetched.tzinfo is None:
                fetched = fetched.replace(tzinfo=timezone.utc)
            
            age = now - fetched
            return int(age.total_seconds())
        except (json.JSONDecodeError, OSError, ValueError, TypeError):
            return None

    def purge(self, key: str):
        data_file = self._get_data_path(key)
        meta_file = self._get_meta_path(key)

        for f in (data_file, meta_file):
            if f.exists():
                try:
                    f.unlink()
                except OSError:
                    pass

    def clear_all(self):
        if self._base_dir.exists():
            try:
                shutil.rmtree(self._base_dir)
            except OSError as e:
                print(f"Cache clear error: {e}")
        self._base_dir.mkdir(parents=True, exist_ok=True)

    def get_cache_size(self) -> int:
        total = 0
        if self._base_dir.exists():
            for path in self._base_dir.rglob("*"):
                if path.is_file():
                    total += path.stat().st_size
        return total

    def get_cache_size_human(self) -> str:
        size = self.get_cache_size()
        for unit in ["B", "KB", "MB", "GB"]:
            if size < 1024:
                return f"{size:.1f} {unit}"
            size /= 1024
        return f"{size:.1f} TB"

    def get_data_path(self, key: str) -> Path:
        return self._get_data_path(key)

    def _get_data_path(self, key: str) -> Path:
        sanitized = key.replace("/", os.sep).replace(":", "_")
        return self._base_dir / sanitized / "data.json"

    def _get_meta_path(self, key: str) -> Path:
        sanitized = key.replace("/", os.sep).replace(":", "_")
        return self._base_dir / sanitized / "meta.json"

    def download_document(self, url: str, doc_id: str) -> Path | None:
        cache_dir = self._base_dir / "viewed_docs"
        cache_dir.mkdir(parents=True, exist_ok=True)

        ext = self._guess_extension(url)
        file_path = cache_dir / f"{doc_id}{ext}"

        if file_path.exists():
            return file_path

        try:
            response = requests.get(url, timeout=30, stream=True)
            response.raise_for_status()

            with open(file_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)

            return file_path
        except Exception as e:
            print(f"Document download error: {e}")
            if file_path.exists():
                try:
                    file_path.unlink()
                except OSError:
                    pass
            return None

    def get_cached_document(self, doc_id: str) -> Path | None:
        cache_dir = self._base_dir / "viewed_docs"
        if not cache_dir.exists():
            return None

        for ext in ["", ".pdf", ".jpg", ".jpeg", ".png"]:
            path = cache_dir / f"{doc_id}{ext}"
            if path.exists():
                return path

        for file in cache_dir.iterdir():
            if file.stem == doc_id:
                return file

        return None

    def _guess_extension(self, url: str) -> str:
        url_lower = url.lower()
        if ".pdf" in url_lower:
            return ".pdf"
        elif ".jpg" in url_lower:
            return ".jpg"
        elif ".jpeg" in url_lower:
            return ".jpeg"
        elif ".png" in url_lower:
            return ".png"
        return ""


_cache_service: CacheService | None = None


def get_cache_service() -> CacheService:
    global _cache_service
    if _cache_service is None:
        _cache_service = CacheService()
    return _cache_service


def _get_machine_id() -> str:
    try:
        return hashlib.sha256(
            (os.environ.get("COMPUTERNAME", "") + os.environ.get("USERNAME", "")).encode()
        ).hexdigest()[:32]
    except Exception:
        return "default"


def _simple_encrypt(data: str) -> str:
    key = _get_machine_id()
    result = []
    for i, char in enumerate(data):
        result.append(chr(ord(char) ^ ord(key[i % len(key)])))
    return base64.b64encode("".join(result).encode()).decode()


def _simple_decrypt(encrypted: str) -> str:
    key = _get_machine_id()
    data = base64.b64decode(encrypted.encode()).decode()
    result = []
    for i, char in enumerate(data):
        result.append(chr(ord(char) ^ ord(key[i % len(key)])))
    return "".join(result)


def save_auth_token(token: str):
    data_file = CACHE_DIR / AUTH_KEY / "data.json"
    data_file.parent.mkdir(parents=True, exist_ok=True)
    
    encrypted = _simple_encrypt(token)
    session_data = {
        "token": encrypted,
        "saved_at": datetime.now(timezone.utc).isoformat(),
    }
    with open(data_file, "w") as f:
        json.dump(session_data, f)


def load_auth_token() -> str | None:
    data_file = CACHE_DIR / AUTH_KEY / "data.json"
    if not data_file.exists():
        return None
    
    try:
        with open(data_file, "r") as f:
            session_data = json.load(f)
        
        encrypted = session_data.get("token")
        if encrypted:
            return _simple_decrypt(encrypted)
    except Exception:
        pass
    return None


def clear_auth_token():
    data_file = CACHE_DIR / AUTH_KEY / "data.json"
    if data_file.exists():
        try:
            data_file.unlink()
        except OSError:
            pass