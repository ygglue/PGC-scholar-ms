from PySide6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, 
                               QFrame, QLineEdit, QComboBox, QTableWidget, QTableWidgetItem)
from PySide6.QtCore import Qt, QThread, Signal, QTimer
import requests

from services.cache_service import get_cache_service
from services.network_status import get_network_status

API_BASE = "http://localhost:8000"
CACHE_KEY = "scholars/list"
CACHE_TTL = 300  # 5 minutes


class FetchScholarsThread(QThread):
    done = Signal(list)
    error = Signal(str)

    def __init__(self, token):
        super().__init__()
        self.token = token

    def run(self):
        try:
            res = requests.get(
                f"{API_BASE}/scholars/",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=10
            )
            if res.status_code == 200:
                self.done.emit(res.json())
            else:
                self.error.emit(f"Error: {res.status_code}")
        except Exception as e:
            self.error.emit(str(e))

class ScholarsDirectoryView(QWidget):
    def __init__(self, token: str, on_back_callback, on_show_submission_bins=None):
        super().__init__()
        self.token = token
        self.on_back_callback = on_back_callback
        self.on_show_submission_bins = on_show_submission_bins
        self.scholars = []
        
        self.setObjectName("ContentArea")
        
        main_layout = QHBoxLayout(self)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)
        
        sidebar = QFrame()
        sidebar.setObjectName("Sidebar")
        sidebar.setFixedWidth(280)
        sidebar_layout = QVBoxLayout(sidebar)
        sidebar_layout.setContentsMargins(24, 40, 24, 40)
        
        brand = QLabel("PGC-Scholar\nEvaluator")
        brand.setObjectName("BrandLogo")
        
        nav_pending = QPushButton("Pending Documents")
        nav_pending.setObjectName("NavButton")
        nav_pending.clicked.connect(self.on_back_callback)

        nav_scholars = QPushButton("Scholars Directory")
        nav_scholars.setObjectName("NavButton")
        nav_scholars.setProperty("active", "true")

        nav_bins = QPushButton("Submission Bins")
        nav_bins.setObjectName("NavButton")
        if self.on_show_submission_bins:
            nav_bins.clicked.connect(self.on_show_submission_bins)

        logout_btn = QPushButton("Log Out")
        logout_btn.setObjectName("NavButton")
        logout_btn.clicked.connect(self.on_back_callback)

        sidebar_layout.addWidget(brand)
        sidebar_layout.addSpacing(48)
        sidebar_layout.addWidget(nav_pending)
        sidebar_layout.addWidget(nav_scholars)
        sidebar_layout.addWidget(nav_bins)
        sidebar_layout.addStretch()
        sidebar_layout.addWidget(logout_btn)
        
        content = QFrame()
        content.setObjectName("ContentArea")
        content_layout = QVBoxLayout(content)
        content_layout.setContentsMargins(48, 48, 48, 48)
        
        header = QLabel("Scholars Directory")
        header.setObjectName("Title")
        
        filters_layout = QHBoxLayout()
        filters_layout.setSpacing(12)
        
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("Search by name...")
        self._search_timer = QTimer()
        self._search_timer.setSingleShot(True)
        self._search_timer.timeout.connect(self.apply_filters)
        self.search_input.textChanged.connect(lambda _: self._search_timer.start(200))
        
        self.status_filter = QComboBox()
        self.status_filter.addItems(["All Status", "active", "inactive", "graduate"])
        self.status_filter.currentTextChanged.connect(self.apply_filters)
        
        self.school_filter = QComboBox()
        self.school_filter.addItems(["All Schools", "State University", "National College", "Polytechnic Institute", "University of the Philippines", "City College"])
        self.school_filter.currentTextChanged.connect(self.apply_filters)
        
        self.batch_filter = QComboBox()
        self.batch_filter.addItems(["All Batches", "Batch 1", "Batch 2", "Batch 3", "Batch 4", "Batch 5"])
        self.batch_filter.currentTextChanged.connect(self.apply_filters)
        
        filters_layout.addWidget(self.search_input)
        filters_layout.addWidget(self.status_filter)
        filters_layout.addWidget(self.school_filter)
        filters_layout.addWidget(self.batch_filter)
        filters_layout.addStretch()
        
        self.table = QTableWidget()
        self.table.setObjectName("Panel")
        self.table.setColumnCount(7)
        self.table.setHorizontalHeaderLabels(["Name", "Batch", "School", "Course", "Year", "Status", "Student Type"])
        self.table.horizontalHeader().setStretchLastSection(True)
        self.table.setSelectionBehavior(QTableWidget.SelectRows)
        self.table.setEditTriggers(QTableWidget.NoEditTriggers)
        
        self._status_container = QVBoxLayout()
        self._status_container.setSpacing(4)
        
        content_layout.addWidget(header)
        content_layout.addSpacing(24)
        content_layout.addLayout(filters_layout)
        content_layout.addSpacing(16)
        content_layout.addLayout(self._status_container)
        content_layout.addWidget(self.table, stretch=1)
        
        main_layout.addWidget(sidebar)
        main_layout.addWidget(content)
        
        self._status_label = None
        self._fetch_thread = None
        self._is_offline = False
        
        get_network_status().add_callback(self._on_network_change)
        self._is_offline = not get_network_status().is_online()
        
        self.load_scholars()

    def _on_network_change(self, is_online: bool):
        self._is_offline = not is_online
        if is_online:
            self.load_scholars()

    def load_scholars(self):
        cache = get_cache_service()
        network = get_network_status()
        
        if network.is_online():
            self._fetch_from_api()
        elif cache.is_fresh(CACHE_KEY):
            cached = cache.get(CACHE_KEY)
            if cached:
                self.scholars = cached
                age = cache.get_age_seconds(CACHE_KEY)
                if self._status_label:
                    self._status_label.setText(f"Showing cached data ({age // 60} min old).")
                self.populate_table(cached)
                return
        
        if cache.is_fresh(CACHE_KEY):
            cached = cache.get(CACHE_KEY)
            if cached:
                self.scholars = cached
                age = cache.get_age_seconds(CACHE_KEY)
                if self._status_label:
                    self._status_label.setText(f"Offline - showing cached data ({age // 60} min old).")
                self.populate_table(cached)
                return
        
        if self._status_label:
            self._status_label.setText("No cached data available. Please reconnect to view scholars.")
        self.scholars = []
        self.populate_table([])

    def on_scholars_loaded(self, scholars_data):
        self.scholars = scholars_data
        cache = get_cache_service()
        cache.set(CACHE_KEY, scholars_data, CACHE_TTL)
        
        cached = cache.get(CACHE_KEY)
        if cached:
            age = cache.get_age_seconds(CACHE_KEY)
            if age is not None and age < 60:
                if self._status_label:
                    self._status_label.setText(f"{len(scholars_data)} scholar(s) found.")
            elif age is not None:
                if self._status_label:
                    self._status_label.setText(f"{len(scholars_data)} scholar(s) found (cached {age // 60} min ago).")
            else:
                if self._status_label:
                    self._status_label.setText(f"{len(scholars_data)} scholar(s) found.")
        else:
            if self._status_label:
                self._status_label.setText(f"{len(scholars_data)} scholar(s) found.")
        
        self.populate_table(scholars_data)

    def on_fetch_error(self, err):
        cache = get_cache_service()
        if cache.is_fresh(CACHE_KEY):
            cached = cache.get(CACHE_KEY)
            if cached:
                self.scholars = cached
                age = cache.get_age_seconds(CACHE_KEY)
                if self._status_label:
                    self._status_label.setText(f"Offline - showing cached data ({age // 60} min old). Error: {err}")
                self.populate_table(cached)
                return
        
        if self._status_label:
            self._status_label.setText(f"Error loading scholars: {err}")

    def _fetch_from_api(self):
        self._status_label = QLabel("Loading scholars...")
        self._status_label.setObjectName("Subtitle")
        self._status_label.setStyleSheet("padding: 8px;")
        self._status_container.addWidget(self._status_label)
        
        self._fetch_thread = FetchScholarsThread(self.token)
        self._fetch_thread.done.connect(self.on_scholars_loaded)
        self._fetch_thread.error.connect(self.on_fetch_error)
        self._fetch_thread.start()

    def apply_filters(self):
        search = self.search_input.text().lower() if self.search_input.text() else ""
        status = self.status_filter.currentText() if self.status_filter.currentText() != "All Status" else None
        school = self.school_filter.currentText() if self.school_filter.currentText() != "All Schools" else None
        batch = self.batch_filter.currentText() if self.batch_filter.currentText() != "All Batches" else None
        
        filtered = []
        for scholar in self.scholars:
            if search and search not in (scholar.get("first_name", "") or "").lower() and search not in (scholar.get("last_name", "") or "").lower():
                continue
            if status and scholar.get("status") != status:
                continue
            if school and scholar.get("school") != school:
                continue
            if batch and scholar.get("batch_number") != batch:
                continue
            filtered.append(scholar)
        
        self.populate_table(filtered)

    def populate_table(self, scholars_data):
        row_count = len(scholars_data)
        self.table.setRowCount(row_count)
        for row, scholar in enumerate(scholars_data):
            name = f"{scholar.get('first_name', '')} {scholar.get('last_name', '')}".strip() or "Unknown"
            self.table.setItem(row, 0, QTableWidgetItem(name))
            self.table.setItem(row, 1, QTableWidgetItem(scholar.get("batch_number") or "-"))
            self.table.setItem(row, 2, QTableWidgetItem(scholar.get("school") or "-"))
            self.table.setItem(row, 3, QTableWidgetItem(scholar.get("course") or "-"))
            self.table.setItem(row, 4, QTableWidgetItem(scholar.get("year_level") or "-"))
            self.table.setItem(row, 5, QTableWidgetItem(scholar.get("status", "").title()))
            self.table.setItem(row, 6, QTableWidgetItem(scholar.get("student_type", "").title()))