from PySide6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, 
                               QFrame, QLineEdit, QComboBox, QTableWidget, QTableWidgetItem)
from PySide6.QtCore import Qt
import requests

class ScholarsDirectoryView(QWidget):
    def __init__(self, token: str, on_back_callback):
        super().__init__()
        self.token = token
        self.on_back_callback = on_back_callback
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
        
        logout_btn = QPushButton("Log Out")
        logout_btn.setObjectName("NavButton")
        logout_btn.clicked.connect(self.on_back_callback)
        
        sidebar_layout.addWidget(brand)
        sidebar_layout.addSpacing(48)
        sidebar_layout.addWidget(nav_pending)
        sidebar_layout.addWidget(nav_scholars)
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
        self.search_input.textChanged.connect(self.apply_filters)
        
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
        
        content_layout.addWidget(header)
        content_layout.addSpacing(24)
        content_layout.addLayout(filters_layout)
        content_layout.addSpacing(16)
        content_layout.addWidget(self.table, stretch=1)
        
        main_layout.addWidget(sidebar)
        main_layout.addWidget(content)
        
        self.load_scholars()

    def load_scholars(self):
        try:
            response = requests.get(
                "http://localhost:8000/scholars/",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=10
            )
            if response.status_code == 200:
                self.scholars = response.json()
                self.populate_table(self.scholars)
        except Exception as e:
            print(f"Error loading scholars: {e}")

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
        self.table.setRowCount(0)
        for scholar in scholars_data:
            row = self.table.rowCount()
            self.table.insertRow(row)
            
            name = f"{scholar.get('first_name', '')} {scholar.get('last_name', '')}".strip() or "Unknown"
            self.table.setItem(row, 0, QTableWidgetItem(name))
            self.table.setItem(row, 1, QTableWidgetItem(scholar.get("batch_number") or "-"))
            self.table.setItem(row, 2, QTableWidgetItem(scholar.get("school") or "-"))
            self.table.setItem(row, 3, QTableWidgetItem(scholar.get("course") or "-"))
            self.table.setItem(row, 4, QTableWidgetItem(scholar.get("year_level") or "-"))
            self.table.setItem(row, 5, QTableWidgetItem(scholar.get("status", "").title()))
            self.table.setItem(row, 6, QTableWidgetItem(scholar.get("student_type", "").title()))