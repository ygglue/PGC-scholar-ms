import os
import webbrowser
from pathlib import Path
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QFrame, QScrollArea, QMessageBox
)
from PySide6.QtCore import Qt, QThread, Signal

from services.cache_service import get_cache_service
from services.network_status import get_network_status


API_BASE = os.environ.get("API_BASE", "http://localhost:8000")

DOC_TYPE_LABELS = {
    "COR": "Certificate of Registration",
    "ROG": "Report of Grades",
    "explanation_letter": "Personal Letter",
    "completion_form": "Completion Form",
    "other": "Other",
}


class FetchBinDocsThread(QThread):
    done = Signal(list)
    error = Signal(str)

    def __init__(self, token, bin_id):
        super().__init__()
        self.token = token
        self.bin_id = bin_id

    def run(self):
        try:
            res = requests.get(
                f"{API_BASE}/documents/bin/{self.bin_id}",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=10
            )
            res.raise_for_status()
            self.done.emit(res.json())
        except Exception as e:
            self.error.emit(str(e))


class ViewDocThread(QThread):
    done = Signal(str, str)
    error = Signal(str)

    def __init__(self, token, doc_id):
        super().__init__()
        self.token = token
        self.doc_id = doc_id

    def run(self):
        try:
            res = requests.get(
                f"{API_BASE}/documents/{self.doc_id}/view-evaluator",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=10
            )
            res.raise_for_status()
            data = res.json()
            self.done.emit(data["url"], data["file_name"])
        except Exception as e:
            self.error.emit(str(e))


class DownloadDocThread(QThread):
    done = Signal(Path)
    error = Signal(str)

    def __init__(self, token, doc_id):
        super().__init__()
        self.token = token
        self.doc_id = doc_id

    def run(self):
        try:
            res = requests.get(
                f"{API_BASE}/documents/{self.doc_id}/view-evaluator",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=10
            )
            res.raise_for_status()
            data = res.json()
            url = data["url"]
            
            cache = get_cache_service()
            path = cache.download_document(url, self.doc_id)
            
            if path:
                self.done.emit(path)
            else:
                self.error.emit("Failed to download document")
        except Exception as e:
            self.error.emit(str(e))


class BinDocumentsView(QWidget):
    def __init__(self, token: str, bin_: dict, on_back):
        super().__init__()
        self.token = token
        self.bin_ = bin_
        self.on_back = on_back
        self._threads = []

        self.setObjectName("ContentArea")
        outer = QVBoxLayout(self)
        outer.setContentsMargins(48, 48, 48, 48)
        outer.setSpacing(0)

        # Header
        header_row = QHBoxLayout()
        back_btn = QPushButton("← Back to Bins")
        back_btn.setObjectName("NavButton")
        back_btn.setFixedWidth(160)
        back_btn.clicked.connect(self.on_back)

        label = f"AY {bin_['school_year']} — {bin_['semester']} Semester"
        title = QLabel(label)
        title.setObjectName("Title")

        refresh_btn = QPushButton("Refresh")
        refresh_btn.setObjectName("GhostButton")
        refresh_btn.setMinimumWidth(100)
        refresh_btn.clicked.connect(self.load_documents)

        header_row.addWidget(back_btn)
        header_row.addSpacing(16)
        header_row.addWidget(title)
        header_row.addStretch()
        header_row.addWidget(refresh_btn)
        outer.addLayout(header_row)
        outer.addSpacing(8)

        subtitle = QLabel("All documents submitted to this bin, grouped by scholar.")
        subtitle.setObjectName("Subtitle")
        outer.addWidget(subtitle)
        outer.addSpacing(24)

        self.status_label = QLabel("Loading documents...")
        self.status_label.setObjectName("Subtitle")
        outer.addWidget(self.status_label)
        outer.addSpacing(8)

        # Scrollable content area
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setObjectName("ContentArea")
        scroll.setFrameShape(QFrame.NoFrame)

        self.content_widget = QWidget()
        self.content_widget.setObjectName("ContentArea")
        self.content_layout = QVBoxLayout(self.content_widget)
        self.content_layout.setContentsMargins(0, 0, 0, 0)
        self.content_layout.setSpacing(16)
        self.content_layout.addStretch()

        scroll.setWidget(self.content_widget)
        outer.addWidget(scroll, stretch=1)

        self.load_documents()

    def load_documents(self):
        cache = get_cache_service()
        network = get_network_status()
        bin_id = self.bin_["id"]
        cache_key = f"documents/bin_{bin_id}"
        
        while self.content_layout.count() > 1:
            item = self.content_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()
        
        if network.is_online():
            self._fetch_from_api()
        elif cache.is_fresh(cache_key):
            cached = cache.get(cache_key)
            if cached:
                age = cache.get_age_seconds(cache_key)
                if self.status_label:
                    self.status_label.setText(f"Offline - showing cached data ({age // 60} min old).")
                self._display_docs(cached)
                return
        
        if cache.is_fresh(cache_key):
            cached = cache.get(cache_key)
            if cached:
                age = cache.get_age_seconds(cache_key)
                if self.status_label:
                    self.status_label.setText(f"Offline - showing cached data ({age // 60} min old).")
                self._display_docs(cached)
                return
        
        if self.status_label:
            self.status_label.setText("No cached data available. Please reconnect to view documents.")
        self._display_docs([])

    def _fetch_from_api(self):
        if self.status_label:
            self.status_label.setText("Loading documents...")
        t = FetchBinDocsThread(self.token, self.bin_["id"])
        t.done.connect(self.on_docs_loaded)
        t.error.connect(lambda e: self.status_label.setText(f"Error: {e}") if self.status_label else None)
        t.start()
        self._threads.append(t)

    def on_docs_loaded(self, docs):
        cache = get_cache_service()
        cache_key = f"documents/bin_{self.bin_['id']}"
        cache.set(cache_key, docs, 60)
        
        cached = cache.get(cache_key)
        if cached:
            age = cache.get_age_seconds(cache_key)
            if age is not None and age < 60:
                if self.status_label:
                    self.status_label.setText(f"{len(docs)} document(s) submitted.")
            elif age is not None:
                if self.status_label:
                    self.status_label.setText(f"{len(docs)} document(s) submitted (cached {age // 60} min ago).")
            else:
                if self.status_label:
                    self.status_label.setText(f"{len(docs)} document(s) submitted.")
        else:
            if self.status_label:
                self.status_label.setText(f"{len(docs)} document(s) submitted.")
        
        self._display_docs(docs)

    def _display_docs(self, docs):
        if not docs:
            if self.status_label:
                self.status_label.setText("No documents submitted to this bin yet.")
            return

        by_scholar = {}
        for doc in docs:
            sid = doc["scholar_id"]
            if sid not in by_scholar:
                by_scholar[sid] = []
            by_scholar[sid].append(doc)

        insert_pos = 0
        for scholar_id, scholar_docs in by_scholar.items():
            group = self._make_scholar_group(scholar_id, scholar_docs)
            self.content_layout.insertWidget(insert_pos, group)
            insert_pos += 1

    def _make_scholar_group(self, scholar_id: str, docs: list) -> QFrame:
        frame = QFrame()
        frame.setObjectName("Panel")
        layout = QVBoxLayout(frame)
        layout.setContentsMargins(24, 20, 24, 20)
        layout.setSpacing(12)

        scholar_label = QLabel(f"Scholar ID: {scholar_id[:8]}...")
        scholar_label.setObjectName("Subtitle")
        layout.addWidget(scholar_label)

        for doc in docs:
            layout.addWidget(self._make_doc_row(doc))

        return frame

    def _make_doc_row(self, doc: dict) -> QFrame:
        row = QFrame()
        row.setStyleSheet("QFrame { background-color: #f0f5ec; border-radius: 12px; }")
        row_layout = QHBoxLayout(row)
        row_layout.setContentsMargins(16, 12, 16, 12)

        doc_type = DOC_TYPE_LABELS.get(doc["doc_type"], doc["doc_type"])
        file_name = doc["file_name"]
        date = doc["uploaded_at"][:10]
        is_verified = doc["is_verified"]

        info = QVBoxLayout()
        type_label = QLabel(doc_type)
        type_label.setStyleSheet("font-weight: bold; font-size: 13px; color: #171d18;")
        file_label = QLabel(f"{file_name} · {date}")
        file_label.setStyleSheet("font-size: 12px; color: rgba(23,29,24,0.6);")
        info.addWidget(type_label)
        info.addWidget(file_label)

        status_label = QLabel("✓ Verified" if is_verified else "Pending")
        status_label.setStyleSheet(
            "font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 8px; "
            + ("background-color: #c8f0d8; color: #006834;" if is_verified else "background-color: #dee4db; color: #555;")
        )

        view_btn = QPushButton("View")
        view_btn.setObjectName("GhostButton")
        view_btn.setMinimumWidth(80)
        view_btn.clicked.connect(lambda _, d=doc: self.view_document(d["id"]))

        row_layout.addLayout(info)
        row_layout.addStretch()
        row_layout.addWidget(status_label)
        row_layout.addSpacing(8)
        row_layout.addWidget(view_btn)

        return row

    def view_document(self, doc_id: str):
        cache = get_cache_service()
        
        cached_path = cache.get_cached_document(doc_id)
        if cached_path and cached_path.exists():
            self._open_file(cached_path)
            return
        
        if not get_network_status().is_online():
            QMessageBox.warning(
                self, "Offline",
                "Cannot view document while offline. Please reconnect to view."
            )
            return
        
        if self.status_label:
            self.status_label.setText("Loading document...")
        
        t = ViewDocThread(self.token, doc_id)
        t.done.connect(lambda url, fn: self._download_and_open(url, doc_id))
        t.error.connect(lambda e: (
            self.status_label.setText(f"Error: {e}") if self.status_label else None,
            QMessageBox.warning(self, "Error", f"Could not open document:\n{e}")
        ))
        t.start()
        self._threads.append(t)

    def _download_and_open(self, url: str, doc_id: str):
        if self.status_label:
            self.status_label.setText("Downloading document...")
        
        t2 = DownloadDocThread(self.token, doc_id)
        t2.done.connect(self._open_file)
        t2.error.connect(lambda e: (
            self.status_label.setText(f"Error downloading: {e}") if self.status_label else None,
            QMessageBox.warning(self, "Error", f"Could not download document:\n{e}")
        ))
        t2.start()
        self._threads.append(t2)

    def _open_file(self, path: Path):
        if self.status_label:
            self.status_label.setText("Opening document...")
        try:
            webbrowser.open(str(path.absolute()))
        except Exception as e:
            QMessageBox.warning(self, "Error", f"Could not open file:\n{e}")
