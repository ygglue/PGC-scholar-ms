from PySide6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, 
                               QFrame, QLineEdit, QComboBox, QTableWidget, QTableWidgetItem,
                               QScrollArea, QGridLayout, QStackedWidget, QSizePolicy,
                               QGraphicsDropShadowEffect, QHeaderView)
from PySide6.QtCore import Qt, QThread, Signal, QTimer, QSize
from PySide6.QtGui import QColor, QPainter, QPixmap, QFont, QIcon, QBrush
import requests
import os

from services.cache_service import get_cache_service
from services.network_status import get_network_status

API_BASE = "http://localhost:8000"
CACHE_KEY = "scholars/list"
CACHE_TTL = 300  # 5 minutes

AVATAR_COLORS = [
    "#fee2e2", "#ffedd5", "#fef3c7", "#dcfce7",
    "#d1fae5", "#ccfbf1", "#cffafe", "#e0f2fe",
    "#dbeafe", "#e0e7ff", "#ede9fe", "#fae8ff"
]

def create_ambient_shadow():
    shadow = QGraphicsDropShadowEffect()
    shadow.setBlurRadius(32)
    shadow.setXOffset(0)
    shadow.setYOffset(8)
    shadow.setColor(QColor(0, 0, 0, 25)) # Pure black with low alpha
    return shadow

def get_initials(first: str, last: str) -> str:
    """Generate initials: Juan + Dela Cruz -> "JDC" """
    parts = []
    if first:
        parts.append(first[0].upper())
    if last:
        last_parts = last.split()
        for lp in last_parts:
            if lp:
                parts.append(lp[0].upper())
    return "".join(parts) if parts else "?"

def get_avatar_color(name: str) -> QColor:
    """Generate consistent color from name hash"""
    if not name:
        return QColor("#E8F5ED")  # Green Pale
    
    hash_val = 0
    for char in name:
        hash_val = ord(char) + ((hash_val << 5) - hash_val)
    
    index = abs(hash_val) % len(AVATAR_COLORS)
    return QColor(AVATAR_COLORS[index])


class FetchScholarDocsThread(QThread):
    done = Signal(dict)
    error = Signal(str)

    def __init__(self, token, scholar_id):
        super().__init__()
        self.token = token
        self.scholar_id = scholar_id

    def run(self):
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            docs_res = requests.get(f"{API_BASE}/documents/scholar/{self.scholar_id}", headers=headers, timeout=10)
            records_res = requests.get(f"{API_BASE}/academic-records/scholar/{self.scholar_id}", headers=headers, timeout=10)
            
            if docs_res.status_code == 200 and records_res.status_code == 200:
                self.done.emit({
                    "documents": docs_res.json(),
                    "records": records_res.json()
                })
            else:
                self.error.emit(f"Error fetching data: Docs({docs_res.status_code}) Records({records_res.status_code})")
        except Exception as e:
            self.error.emit(str(e))

class ViewToggleButton(QFrame):
    toggled = Signal(str)  # "list" or "card"

    def __init__(self):
        super().__init__()
        self.setObjectName("Panel")
        self.setFixedHeight(40)
        self.setStyleSheet("QFrame#Panel { border-radius: 20px; background-color: #F7F9F7; border: 1px solid #E0E6E0; }")
        
        layout = QHBoxLayout(self)
        layout.setContentsMargins(4, 4, 4, 4)
        layout.setSpacing(0)
        
        # Use assets/icons/
        icon_path = os.path.join(os.path.dirname(__file__), "..", "assets", "icons").replace("\\", "/")
        
        self.list_btn = QPushButton()
        self.list_btn.setIcon(QIcon(f"{icon_path}/list_view.svg"))
        self.list_btn.setObjectName("ViewToggle")
        self.list_btn.setCheckable(True)
        self.list_btn.setFixedSize(40, 32)
        
        self.card_btn = QPushButton()
        self.card_btn.setIcon(QIcon(f"{icon_path}/card_view.svg"))
        self.card_btn.setObjectName("ViewToggle")
        self.card_btn.setCheckable(True)
        self.card_btn.setFixedSize(40, 32)
        
        # Style for toggle buttons
        self.setStyleSheet("""
            QPushButton#ViewToggle {
                background-color: transparent;
                border: none;
                border-radius: 16px;
            }
            QPushButton#ViewToggle:checked {
                background-color: #ffffff;
            }
        """)
        
        self.list_btn.clicked.connect(lambda: self._on_clicked("list"))
        self.card_btn.clicked.connect(lambda: self._on_clicked("card"))
        
        layout.addWidget(self.list_btn)
        layout.addWidget(self.card_btn)
        
        self.card_btn.setChecked(True)
        self.current_view = "card"

    def _on_clicked(self, view_type):
        if view_type == "list":
            self.list_btn.setChecked(True)
            self.card_btn.setChecked(False)
        else:
            self.list_btn.setChecked(False)
            self.card_btn.setChecked(True)
        
        if self.current_view != view_type:
            self.current_view = view_type
            self.toggled.emit(view_type)

    def set_view(self, view_type):
        self._on_clicked(view_type)

class PaginationControl(QWidget):
    page_changed = Signal(int)

    def __init__(self):
        super().__init__()
        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(12)
        
        self.prev_btn = QPushButton("Previous")
        self.prev_btn.setObjectName("GhostButton")
        self.prev_btn.setFixedWidth(100)
        self.prev_btn.clicked.connect(self._on_prev)
        
        self.page_label = QLabel("Page 1 of 1")
        self.page_label.setObjectName("Subtitle")
        self.page_label.setAlignment(Qt.AlignCenter)
        
        self.next_btn = QPushButton("Next")
        self.next_btn.setObjectName("GhostButton")
        self.next_btn.setFixedWidth(100)
        self.next_btn.clicked.connect(self._on_next)
        
        layout.addStretch()
        layout.addWidget(self.prev_btn)
        layout.addWidget(self.page_label)
        layout.addWidget(self.next_btn)
        layout.addStretch()
        
        self.current_page = 1
        self.total_pages = 1

    def set_pagination(self, current, total):
        self.current_page = current
        self.total_pages = total
        self.page_label.setText(f"Page {current} of {max(1, total)}")
        self.prev_btn.setEnabled(current > 1)
        self.next_btn.setEnabled(current < total)

    def _on_prev(self):
        if self.current_page > 1:
            self.page_changed.emit(self.current_page - 1)

    def _on_next(self):
        if self.current_page < self.total_pages:
            self.page_changed.emit(self.current_page + 1)

class ScholarCard(QFrame):
    clicked = Signal(dict)

    def __init__(self, scholar):
        super().__init__()
        self.scholar = scholar
        self.setObjectName("Panel")
        self.setFixedSize(180, 220)
        self.setCursor(Qt.PointingHandCursor)
        
        layout = QVBoxLayout(self)
        layout.setContentsMargins(16, 20, 16, 20)
        layout.setSpacing(8)
        layout.setAlignment(Qt.AlignCenter)
        
        # Avatar
        first = scholar.get("first_name", "")
        last = scholar.get("last_name", "")
        name = f"{first} {last}".strip() or "Unknown"
        initials = get_initials(first, last)
        color = get_avatar_color(name)
        
        avatar = QLabel()
        avatar.setFixedSize(64, 64)
        pixmap = QPixmap(64, 64)
        pixmap.fill(Qt.transparent)
        painter = QPainter(pixmap)
        painter.setRenderHint(QPainter.Antialiasing)
        painter.setBrush(color)
        painter.setPen(Qt.NoPen)
        painter.drawEllipse(0, 0, 64, 64)
        
        painter.setPen(QColor("#1A1A1A"))
        font = QFont("Plus Jakarta Sans", 18, QFont.Bold)
        painter.setFont(font)
        painter.drawText(pixmap.rect(), Qt.AlignCenter, initials)
        painter.end()
        avatar.setPixmap(pixmap)
        
        # Info
        name_label = QLabel(name)
        name_label.setObjectName("Subtitle")
        name_label.setStyleSheet("font-weight: bold; color: #1A1A1A; font-size: 15px; font-family: 'Plus Jakarta Sans';")
        name_label.setAlignment(Qt.AlignCenter)
        name_label.setWordWrap(True)
        
        school_label = QLabel(scholar.get("school", "-"))
        school_label.setObjectName("Subtitle")
        school_label.setAlignment(Qt.AlignCenter)
        school_label.setStyleSheet("font-size: 12px; color: #4A5568;")
        
        year_label = QLabel(scholar.get("year_level", "-"))
        year_label.setObjectName("Subtitle")
        year_label.setAlignment(Qt.AlignCenter)
        year_label.setStyleSheet("font-size: 12px; color: #4A5568;")
        
        # Status Badge
        status = scholar.get("status", "inactive").lower()
        status_colors = {
            "active": ("#E8F5ED", "#1A8C3C"),
            "graduate": ("#dbeafe", "#1d4ed8"),
            "inactive": ("#f3f4f6", "#4b5563")
        }
        bg, text = status_colors.get(status, ("#f3f4f6", "#4b5563"))
        
        status_badge = QLabel(status.title())
        status_badge.setFixedHeight(24)
        status_badge.setStyleSheet(f"""
            background-color: {bg};
            color: {text};
            border-radius: 12px;
            padding: 0 10px;
            font-size: 11px;
            font-weight: bold;
            font-family: 'Plus Jakarta Sans';
        """)
        status_badge.setAlignment(Qt.AlignCenter)
        
        layout.addWidget(avatar, alignment=Qt.AlignCenter)
        layout.addWidget(name_label)
        layout.addWidget(school_label)
        layout.addWidget(year_label)
        layout.addStretch()
        layout.addWidget(status_badge, alignment=Qt.AlignCenter)

        self.setGraphicsEffect(create_ambient_shadow())

    def mousePressEvent(self, event):
        self.clicked.emit(self.scholar)
        super().mousePressEvent(event)

class ScholarDetailPanel(QFrame):
    closed = Signal()

    def __init__(self):
        super().__init__()
        self.setObjectName("Panel")
        self.setFixedWidth(380)
        self.setStyleSheet("QFrame#Panel { border-left: 1px solid #E0E6E0; border-radius: 0; background-color: #ffffff; }")
        
        self.layout = QVBoxLayout(self)
        self.layout.setContentsMargins(0, 0, 0, 0)
        self.layout.setSpacing(0)
        
        # Top Bar with Close Button
        self.top_bar = QFrame()
        self.top_bar.setFixedHeight(64)
        self.top_bar_layout = QHBoxLayout(self.top_bar)
        self.top_bar_layout.setContentsMargins(24, 0, 12, 0)
        
        self.top_title = QLabel("Scholar Details")
        self.top_title.setStyleSheet("font-weight: bold; font-size: 16px; color: #1A1A1A; font-family: 'Plus Jakarta Sans';")
        
        self.close_btn = QPushButton("✕")
        self.close_btn.setFixedSize(32, 32)
        self.close_btn.setStyleSheet("""
            QPushButton { 
                border: none; 
                background: transparent; 
                color: #8A9BAA; 
                font-size: 18px; 
                border-radius: 16px;
            }
            QPushButton:hover { background-color: #F2F4F2; color: #1A1A1A; }
        """)
        self.close_btn.setCursor(Qt.PointingHandCursor)
        self.close_btn.clicked.connect(self.closed.emit)
        
        self.top_bar_layout.addWidget(self.top_title)
        self.top_bar_layout.addStretch()
        self.top_bar_layout.addWidget(self.close_btn)
        
        self.layout.addWidget(self.top_bar)
        
        # Scroll Area for Content
        self.scroll = QScrollArea()
        self.scroll.setWidgetResizable(True)
        self.scroll.setFrameShape(QFrame.NoFrame)
        self.scroll.setStyleSheet("QScrollArea { background-color: transparent; }")
        
        self.scroll_content = QWidget()
        self.scroll_content.setObjectName("ScrollContent")
        self.scroll_content.setStyleSheet("QWidget#ScrollContent { background-color: #ffffff; }")
        self.scroll_layout = QVBoxLayout(self.scroll_content)
        self.scroll_layout.setContentsMargins(24, 0, 24, 40)
        self.scroll_layout.setSpacing(32)
        
        self.scroll.setWidget(self.scroll_content)
        self.layout.addWidget(self.scroll)

    def _clear_layout(self, layout):
        if layout is not None:
            while layout.count():
                item = layout.takeAt(0)
                widget = item.widget()
                if widget is not None:
                    widget.setParent(None)
                    widget.deleteLater()
                else:
                    self._clear_layout(item.layout())

    def _fetch_avatar(self, url, avatar_label):
        try:
            # We use a simple blocking fetch here as it's small, 
            # or we could use QNetworkAccessManager for full async
            res = requests.get(url, timeout=5)
            if res.status_code == 200:
                pixmap = QPixmap()
                pixmap.loadFromData(res.content)
                # Clip to circle
                masked = QPixmap(64, 64)
                masked.fill(Qt.transparent)
                painter = QPainter(masked)
                painter.setRenderHint(QPainter.Antialiasing)
                painter.setBrush(QBrush(pixmap.scaled(64, 64, Qt.KeepAspectRatioByExpanding, Qt.SmoothTransformation)))
                painter.setPen(Qt.NoPen)
                painter.drawEllipse(0, 0, 64, 64)
                painter.end()
                avatar_label.setPixmap(masked)
        except Exception as e:
            print(f"Failed to load avatar: {e}")

    def set_scholar(self, scholar):
        # Reset scroll position
        self.scroll.verticalScrollBar().setValue(0)
        
        # Clear previous content completely
        self._clear_layout(self.scroll_layout)
            
        # Header
        first = scholar.get("first_name", "")
        last = scholar.get("last_name", "")
        name = f"{first} {last}".strip() or "Unknown"
        avatar_url = scholar.get("avatar_url")
        
        header = QHBoxLayout()
        header.setSpacing(16)
        
        avatar_label = QLabel()
        avatar_label.setFixedSize(64, 64)

        if avatar_url:
            # Placeholder while loading
            avatar_label.setText("...")
            # Threaded fetch
            QTimer.singleShot(0, lambda: self._fetch_avatar(avatar_url, avatar_label))
        else:
            initials = get_initials(first, last)
            color = get_avatar_color(name)
            pixmap = QPixmap(64, 64)
            pixmap.fill(Qt.transparent)
            painter = QPainter(pixmap)
            painter.setRenderHint(QPainter.Antialiasing)
            painter.setBrush(color)
            painter.setPen(Qt.NoPen)
            painter.drawEllipse(0, 0, 64, 64)
            painter.setPen(QColor("#1A1A1A"))
            painter.setFont(QFont("Plus Jakarta Sans", 18, QFont.Bold))
            painter.drawText(pixmap.rect(), Qt.AlignCenter, initials)
            painter.end()
            avatar_label.setPixmap(pixmap)
        
        header_text = QVBoxLayout()
        name_label = QLabel(name)
        name_label.setObjectName("Title")
        name_label.setStyleSheet("font-size: 22px; font-family: 'Plus Jakarta Sans';")
        name_label.setWordWrap(True)
        
        status = scholar.get("status", "inactive").lower()
        status_colors = {
            "active": ("#E8F5ED", "#1A8C3C"),
            "graduate": ("#dbeafe", "#1d4ed8"),
            "inactive": ("#f3f4f6", "#4b5563")
        }
        bg, text = status_colors.get(status, ("#f3f4f6", "#4b5563"))
        
        status_badge = QLabel(status.title())
        status_badge.setFixedHeight(22)
        status_badge.setStyleSheet(f"background-color: {bg}; color: {text}; border-radius: 11px; padding: 0 10px; font-size: 11px; font-weight: bold; font-family: 'Plus Jakarta Sans';")
        status_badge.setSizePolicy(QSizePolicy.Fixed, QSizePolicy.Fixed)
        
        header_text.addWidget(name_label)
        header_text.addWidget(status_badge)
        
        header.addWidget(avatar_label)
        header.addLayout(header_text)
        header.addLayout(QVBoxLayout()) # dummy to keep structure consistent if needed
        header.addStretch()
        
        self.scroll_layout.addLayout(header)
        
        # Sections
        self._add_section("PERSONAL INFORMATION", [
            ("Date of Birth", scholar.get("date_of_birth") or "-"),
            ("Place of Birth", scholar.get("place_of_birth") or "-"),
            ("Sex", scholar.get("sex") or "-"),
            ("Civil Status", scholar.get("civil_status") or "-"),
            ("Religion", scholar.get("religion") or "-"),
            ("Address", scholar.get("address") or "-"),
            ("Contact", scholar.get("contact_number") or "-"),
        ])
        
        self._add_section("ACADEMIC INFORMATION", [
            ("School", scholar.get("school") or "-"),
            ("Course", scholar.get("course") or "-"),
            ("Year Level", scholar.get("year_level") or "-"),
            ("Batch", scholar.get("batch_number") or "-"),
            ("Student Type", (scholar.get("student_type") or "-").title()),
            ("Date Enrolled", scholar.get("date_enrolled") or "-"),
        ])
        
        # Docs Section
        self.docs_container = QVBoxLayout()
        self.docs_container.setSpacing(12)
        
        docs_header = QLabel("SUBMITTED DOCUMENTS")
        docs_header.setStyleSheet("font-weight: bold; color: #1A8C3C; font-size: 11px; letter-spacing: 1.2px; font-family: 'Plus Jakarta Sans';")
        
        self.docs_status = QLabel("Loading documents...")
        self.docs_status.setObjectName("Subtitle")
        self.docs_status.setStyleSheet("color: #8A9BAA; font-size: 13px;")
        
        self.scroll_layout.addWidget(docs_header)
        self.scroll_layout.addWidget(self.docs_status)
        self.scroll_layout.addLayout(self.docs_container)
        self.scroll_layout.addStretch()

    def _add_section(self, title, fields):
        container = QVBoxLayout()
        container.setSpacing(16)
        
        header = QLabel(title)
        header.setStyleSheet("font-weight: bold; color: #1A8C3C; font-size: 11px; letter-spacing: 1.2px; font-family: 'Plus Jakarta Sans';")
        container.addWidget(header)
        
        grid = QGridLayout()
        grid.setSpacing(10)
        grid.setContentsMargins(0, 0, 0, 0)
        for row, (label, value) in enumerate(fields):
            lbl = QLabel(f"{label}")
            lbl.setStyleSheet("color: #4A5568; font-size: 12px; font-family: 'Plus Jakarta Sans';")
            val = QLabel(str(value))
            val.setStyleSheet("color: #1A1A1A; font-size: 14px; font-weight: 500; font-family: 'Plus Jakarta Sans';")
            val.setWordWrap(True)
            grid.addWidget(lbl, row, 0)
            grid.addWidget(val, row, 1)
        
        container.addLayout(grid)
        self.scroll_layout.addLayout(container)

    def set_documents(self, data):
        # Clear previous docs safely
        self._clear_layout(self.docs_container)
        
        docs = data.get("documents", [])
        records = data.get("records", [])
        
        if not docs:
            self.docs_status.setText("No documents submitted.")
            self.docs_status.show()
            return
            
        self.docs_status.hide()
        
        # Group documents by academic record (bin)
        records_map = {str(r["id"]): r for r in records}
        grouped = {} # (school_year, semester) -> list of docs
        
        for doc in docs:
            rec_id = doc.get("academic_record_id")
            if rec_id and rec_id in records_map:
                rec = records_map[rec_id]
                key = (rec["school_year"], rec["semester"])
            else:
                key = ("Other", "Documents")
            
            if key not in grouped:
                grouped[key] = []
            grouped[key].append(doc)
            
        # Sort keys: latest first
        sorted_keys = sorted(grouped.keys(), reverse=True)
        
        for key in sorted_keys:
            year, sem = key
            header = QLabel(f"▼ {year} — {sem}")
            header.setStyleSheet("font-weight: bold; font-size: 13px; color: #1A1A1A; margin-top: 8px; font-family: 'Plus Jakarta Sans';")
            self.docs_container.addWidget(header)
            
            flow = QHBoxLayout()
            flow.setSpacing(8)
            for doc in grouped[key]:
                chip = QPushButton(f"📄 {doc.get('doc_type')}")
                chip.setObjectName("GhostButton")
                chip.setStyleSheet("""
                    QPushButton {
                        padding: 6px 12px; 
                        font-size: 11px; 
                        border-radius: 8px;
                        background-color: #F7F9F7;
                        border: 1px solid #E0E6E0;
                        color: #1A8C3C;
                        font-weight: 600;
                    }
                    QPushButton:hover { background-color: #E8F5ED; }
                """)
                flow.addWidget(chip)
            flow.addStretch()
            self.docs_container.addLayout(flow)

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
        self.filtered_scholars = []
        self.current_page = 1
        self.view_type = "card"

        self.setObjectName("ContentArea")

        main_layout = QHBoxLayout(self)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # Sidebar
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

        # Content Section
        content_container = QFrame()
        content_container.setObjectName("ContentArea")
        content_container_layout = QHBoxLayout(content_container)
        content_container_layout.setContentsMargins(0, 0, 0, 0)
        content_container_layout.setSpacing(0)

        content = QFrame()
        content_layout = QVBoxLayout(content)
        content_layout.setContentsMargins(48, 48, 48, 48)

        # Header Row
        header_row = QHBoxLayout()
        header = QLabel("Scholars Directory")
        header.setObjectName("Title")

        self.view_toggle = ViewToggleButton()
        self.view_toggle.toggled.connect(self._on_view_toggled)

        header_row.addWidget(header)
        header_row.addStretch()
        header_row.addWidget(self.view_toggle)

        # Filters
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

        # Status Label Container
        self._status_container = QVBoxLayout()
        self._status_container.setSpacing(4)

        # View Switcher (Stacked Widget)
        self.view_stack = QStackedWidget()

        # List View (Table)
        self.table = QTableWidget()
        self.table.setObjectName("Panel")
        self.table.setColumnCount(7)
        self.table.setHorizontalHeaderLabels(["Name", "Batch", "School", "Course", "Year", "Status", "Student Type"])
        self.table.horizontalHeader().setStretchLastSection(True)
        self.table.setSelectionBehavior(QTableWidget.SelectRows)
        self.table.setEditTriggers(QTableWidget.NoEditTriggers)
        self.table.itemClicked.connect(self._on_row_clicked)

        # Card View (Grid)
        self.card_scroll = QScrollArea()
        self.card_scroll.setWidgetResizable(True)
        self.card_scroll.setFrameShape(QFrame.NoFrame)
        self.card_scroll.setObjectName("ContentArea")

        self.card_container = QWidget()
        self.card_container.setObjectName("ContentArea")
        self.card_grid = QGridLayout(self.card_container)
        self.card_grid.setContentsMargins(0, 0, 0, 0)
        self.card_grid.setSpacing(24)
        self.card_scroll.setWidget(self.card_container)

        self.view_stack.addWidget(self.card_scroll) # Index 0: Card
        self.view_stack.addWidget(self.table)       # Index 1: List

        # Pagination
        self.pagination = PaginationControl()
        self.pagination.page_changed.connect(self._on_page_changed)

        content_layout.addLayout(header_row)
        content_layout.addSpacing(24)
        content_layout.addLayout(filters_layout)
        content_layout.addSpacing(16)
        content_layout.addLayout(self._status_container)
        content_layout.addWidget(self.view_stack, stretch=1)
        content_layout.addWidget(self.pagination)

        # Detail Panel
        self.detail_panel = ScholarDetailPanel()
        self.detail_panel.closed.connect(self.detail_panel.hide)
        self.detail_panel.hide() # Collapsed initially

        content_container_layout.addWidget(content, stretch=1)
        content_container_layout.addWidget(self.detail_panel)

        main_layout.addWidget(sidebar)
        main_layout.addWidget(content_container)

        self._status_label = None
        self._fetch_thread = None
        self._docs_thread = None
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
                self._set_status_text(f"Showing cached data ({age // 60} min old).")
                self.apply_filters()
                return

        if cache.is_fresh(CACHE_KEY):
            cached = cache.get(CACHE_KEY)
            if cached:
                self.scholars = cached
                age = cache.get_age_seconds(CACHE_KEY)
                self._set_status_text(f"Offline - showing cached data ({age // 60} min old).")
                self.apply_filters()
                return

        self._set_status_text("No cached data available. Please reconnect to view scholars.")
        self.scholars = []
        self.apply_filters()

    def _set_status_text(self, text):
        if not self._status_label:
            self._status_label = QLabel(text)
            self._status_label.setObjectName("Subtitle")
            self._status_label.setStyleSheet("padding: 8px;")
            self._status_container.addWidget(self._status_label)
        else:
            self._status_label.setText(text)

    def _on_view_toggled(self, view_type):
        self.view_type = view_type
        if view_type == "card":
            self.view_stack.setCurrentIndex(0)
        else:
            self.view_stack.setCurrentIndex(1)
        self.current_page = 1
        self.update_display()

    def _on_page_changed(self, page):
        self.current_page = page
        self.update_display()

    def _on_scholar_clicked(self, scholar):
        self.detail_panel.set_scholar(scholar)
        self.detail_panel.show()
        
        # On-demand fetching
        if self._docs_thread and self._docs_thread.isRunning():
            self._docs_thread.terminate()

        self._docs_thread = FetchScholarDocsThread(self.token, scholar["id"])
        self._docs_thread.done.connect(self.detail_panel.set_documents)
        self._docs_thread.error.connect(lambda err: self.detail_panel.docs_status.setText(f"Error: {err}"))
        self._docs_thread.start()

    def _on_row_clicked(self, item):
        row = item.row()
        scholar = self.get_page_data()[row]
        self._on_scholar_clicked(scholar)

    def on_scholars_loaded(self, scholars_data):
        # Requirement: Sort A-Z by name
        scholars_data.sort(key=lambda s: (f"{s.get('first_name', '')} {s.get('last_name', '')}".strip().lower()))

        self.scholars = scholars_data
        cache = get_cache_service()
        cache.set(CACHE_KEY, scholars_data, CACHE_TTL)

        age = cache.get_age_seconds(CACHE_KEY)
        status_msg = f"{len(scholars_data)} scholar(s) found."
        if age and age >= 60:
            status_msg += f" (cached {age // 60} min ago)"

        self._set_status_text(status_msg)
        self.apply_filters()

    def on_fetch_error(self, err):
        if "401" in err:
            clear_auth_token()
            self._set_status_text("Session expired. Please log in again.")
            return

        cache = get_cache_service()
        if cache.is_fresh(CACHE_KEY):
            cached = cache.get(CACHE_KEY)
            if cached:
                self.scholars = cached
                age = cache.get_age_seconds(CACHE_KEY)
                self._set_status_text(f"Offline - showing cached data ({age // 60} min old). Error: {err}")
                self.apply_filters()
                return

        self._set_status_text(f"Error loading scholars: {err}")

    def _fetch_from_api(self):
        self._set_status_text("Loading scholars...")
        self._fetch_thread = FetchScholarsThread(self.token)
        self._fetch_thread.done.connect(self.on_scholars_loaded)
        self._fetch_thread.error.connect(self.on_fetch_error)
        self._fetch_thread.start()

    def apply_filters(self):
        search = self.search_input.text().lower() if self.search_input.text() else ""
        status = self.status_filter.currentText() if self.status_filter.currentText() != "All Status" else None
        school = self.school_filter.currentText() if self.school_filter.currentText() != "All Schools" else None
        batch = self.batch_filter.currentText() if self.batch_filter.currentText() != "All Batches" else None

        self.filtered_scholars = []
        for scholar in self.scholars:
            name = f"{scholar.get('first_name', '')} {scholar.get('last_name', '')}".lower()
            if search and search not in name:
                continue
            if status and scholar.get("status") != status:
                continue
            if school and scholar.get("school") != school:
                continue
            if batch and scholar.get("batch_number") != batch:
                continue
            self.filtered_scholars.append(scholar)

        self.current_page = 1
        self.update_display()

    def update_display(self):
        per_page = 20 if self.view_type == "card" else 50
        total_pages = (len(self.filtered_scholars) + per_page - 1) // per_page
        self.pagination.set_pagination(self.current_page, total_pages)

        page_data = self.get_page_data()

        if self.view_type == "card":
            self.populate_cards(page_data)
        else:
            self.populate_table(page_data)

    def get_page_data(self):
        per_page = 20 if self.view_type == "card" else 50
        start = (self.current_page - 1) * per_page
        end = start + per_page
        return self.filtered_scholars[start:end]

    def populate_cards(self, page_data):
        # Clear previous cards
        for i in reversed(range(self.card_grid.count())):
            item = self.card_grid.itemAt(i)
            if item.widget():
                item.widget().deleteLater()

        columns = 4 # Adjust based on width if needed
        for i, scholar in enumerate(page_data):
            card = ScholarCard(scholar)
            card.clicked.connect(self._on_scholar_clicked)
            self.card_grid.addWidget(card, i // columns, i % columns)

        # Add stretch to keep cards at top
        if len(page_data) < columns:
            self.card_grid.setColumnStretch(columns-1, 1)

    def populate_table(self, page_data):
        self.table.setRowCount(len(page_data))
        # Increase row height
        self.table.verticalHeader().setDefaultSectionSize(40)
        
        for row, scholar in enumerate(page_data):
            name = f"{scholar.get('first_name', '')} {scholar.get('last_name', '')}".strip() or "Unknown"
            self.table.setItem(row, 0, QTableWidgetItem(name))
            self.table.setItem(row, 1, QTableWidgetItem(scholar.get("batch_number") or "-"))
            self.table.setItem(row, 2, QTableWidgetItem(scholar.get("school") or "-"))
            self.table.setItem(row, 3, QTableWidgetItem(scholar.get("course") or "-"))
            self.table.setItem(row, 4, QTableWidgetItem(scholar.get("year_level") or "-"))
            self.table.setItem(row, 5, QTableWidgetItem(scholar.get("status", "").title()))
            self.table.setItem(row, 6, QTableWidgetItem(scholar.get("student_type", "").title()))
        
        # Adjust column widths to contents after items are added
        self.table.resizeColumnsToContents()
        
        # Ensure the Name column (0) gets extra space if needed, 
        # but let's allow it to grow by stretching it.
        self.table.horizontalHeader().setSectionResizeMode(0, QHeaderView.Stretch)
        for i in range(1, 7):
            self.table.horizontalHeader().setSectionResizeMode(i, QHeaderView.ResizeToContents)