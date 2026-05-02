import requests
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QFrame, QListWidget, QListWidgetItem, QDialog, QLineEdit,
    QComboBox, QMessageBox, QSizePolicy, QGraphicsDropShadowEffect
)
from PySide6.QtCore import Qt, QThread, Signal
from PySide6.QtGui import QColor

from services.cache_service import get_cache_service
from services.network_status import get_network_status

def create_ambient_shadow():
    shadow = QGraphicsDropShadowEffect()
    shadow.setBlurRadius(32)
    shadow.setXOffset(0)
    shadow.setYOffset(8)
    shadow.setColor(QColor(23, 29, 24, 15))
    return shadow

API_BASE = "http://localhost:8000"
CACHE_KEY = "bins/list"
CACHE_TTL = 60  # 1 minute


class FetchBinsThread(QThread):
    done = Signal(list)
    error = Signal(str)

    def __init__(self, token):
        super().__init__()
        self.token = token

    def run(self):
        try:
            res = requests.get(
                f"{API_BASE}/submission-bins/",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=10
            )
            res.raise_for_status()
            self.done.emit(res.json())
        except Exception as e:
            self.error.emit(str(e))


class CreateBinDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowFlags(Qt.Dialog | Qt.FramelessWindowHint)
        self.setAttribute(Qt.WA_TranslucentBackground, False)
        self.setMinimumWidth(420)
        self.setStyleSheet("QDialog { background-color: #ffffff; border-radius: 20px; }")

        layout = QVBoxLayout(self)
        layout.setSpacing(12)
        layout.setContentsMargins(36, 36, 36, 36)

        title = QLabel("Create Submission Bin")
        title.setObjectName("ModalTitle")

        subtitle = QLabel("Scholars will see this bin and upload their COR, ROG, and Letter for the specified period.")
        subtitle.setObjectName("ModalSubtitle")
        subtitle.setWordWrap(True)
        layout.addWidget(title)
        layout.addSpacing(4)
        layout.addWidget(subtitle)
        layout.addSpacing(16)

        ay_label = QLabel("Academic Year")
        ay_label.setObjectName("FieldLabel")
        self.ay_input = QLineEdit()
        self.ay_input.setPlaceholderText("e.g. 2025-2026")
        layout.addWidget(ay_label)
        layout.addWidget(self.ay_input)
        layout.addSpacing(8)

        sem_label = QLabel("Semester")
        sem_label.setObjectName("FieldLabel")
        self.sem_combo = QComboBox()
        self.sem_combo.addItems(["1st", "2nd", "summer"])
        layout.addWidget(sem_label)
        layout.addWidget(self.sem_combo)
        layout.addSpacing(24)

        btn_row = QHBoxLayout()
        btn_row.setSpacing(12)

        cancel_btn = QPushButton("Cancel")
        cancel_btn.setObjectName("CancelButton")
        cancel_btn.clicked.connect(self.reject)

        create_btn = QPushButton("Create Bin")
        create_btn.setObjectName("PrimaryButton")
        create_btn.clicked.connect(self.accept)

        btn_row.addWidget(cancel_btn)
        btn_row.addWidget(create_btn)
        layout.addLayout(btn_row)

        self.setGraphicsEffect(create_ambient_shadow())

    def get_values(self):
        return self.ay_input.text().strip(), self.sem_combo.currentText()


class SubmissionBinsView(QWidget):
    def __init__(self, token: str, on_back, on_open_bin):
        super().__init__()
        self.token = token
        self.on_back = on_back
        self.on_open_bin = on_open_bin
        self.bins = []

        self.setObjectName("ContentArea")
        layout = QVBoxLayout(self)
        layout.setContentsMargins(48, 48, 48, 48)
        layout.setSpacing(0)

        # Header row
        header_row = QHBoxLayout()
        back_btn = QPushButton("← Back")
        back_btn.setObjectName("NavButton")
        back_btn.setFixedWidth(100)
        back_btn.clicked.connect(self.on_back)

        title = QLabel("Submission Bins")
        title.setObjectName("Title")

        create_btn = QPushButton("+ Create Bin")
        create_btn.setObjectName("PrimaryButton")
        create_btn.clicked.connect(self.open_create_dialog)

        header_row.addWidget(back_btn)
        header_row.addSpacing(16)
        header_row.addWidget(title)
        header_row.addStretch()
        header_row.addWidget(create_btn)
        layout.addLayout(header_row)
        layout.addSpacing(8)

        subtitle = QLabel("Each bin represents a collection window for a semester. Scholars upload their COR, ROG, and Letter into the active bin.")
        subtitle.setObjectName("Subtitle")
        subtitle.setWordWrap(True)
        layout.addWidget(subtitle)
        layout.addSpacing(28)

        # Status label
        self.status_label = QLabel("Loading bins...")
        self.status_label.setObjectName("Subtitle")
        layout.addWidget(self.status_label)

        # Bins list
        self.list_widget = QListWidget()
        self.list_widget.setObjectName("Panel")
        self.list_widget.setSpacing(4)
        self.list_widget.setGraphicsEffect(create_ambient_shadow())
        layout.addWidget(self.list_widget, stretch=1)

        self.load_bins()

    def load_bins(self):
        cache = get_cache_service()
        network = get_network_status()
        
        if network.is_online():
            self._fetch_from_api()
        elif cache.is_fresh(CACHE_KEY):
            cached = cache.get(CACHE_KEY)
            if cached:
                self.bins = cached
                age = cache.get_age_seconds(CACHE_KEY)
                if self.status_label:
                    self.status_label.setText(f"Offline - showing cached data ({age // 60} min old).")
                self._display_bins(cached)
                return
        
        if cache.is_fresh(CACHE_KEY):
            cached = cache.get(CACHE_KEY)
            if cached:
                self.bins = cached
                age = cache.get_age_seconds(CACHE_KEY)
                if self.status_label:
                    self.status_label.setText(f"Offline - showing cached data ({age // 60} min old).")
                self._display_bins(cached)
                return
        
        if self.status_label:
            self.status_label.setText("No cached data available. Please reconnect to view bins.")
        self.bins = []

    def _fetch_from_api(self):
        if self.status_label:
            self.status_label.setText("Loading bins...")
        self._fetch_thread = FetchBinsThread(self.token)
        self._fetch_thread.done.connect(self.on_bins_loaded)
        self._fetch_thread.error.connect(self.on_fetch_error)
        self._fetch_thread.start()

    def on_bins_loaded(self, bins):
        self.bins = bins
        cache = get_cache_service()
        cache.set(CACHE_KEY, bins, CACHE_TTL)
        
        cached = cache.get(CACHE_KEY)
        if cached:
            age = cache.get_age_seconds(CACHE_KEY)
            if age is not None and age < 60:
                if self.status_label:
                    self.status_label.setText(f"{len(bins)} submission bin(s) found.")
            elif age is not None:
                if self.status_label:
                    self.status_label.setText(f"{len(bins)} submission bin(s) found (cached {age // 60} min ago).")
            else:
                if self.status_label:
                    self.status_label.setText(f"{len(bins)} submission bin(s) found.")
        else:
            if self.status_label:
                self.status_label.setText(f"{len(bins)} submission bin(s) found.")
        
        self._display_bins(bins)

    def _display_bins(self, bins):
        self.list_widget.clear()
        if not bins:
            if self.status_label:
                self.status_label.setText("No submission bins yet. Create one to allow scholars to upload documents.")
            return
        for bin_ in bins:
            item = QListWidgetItem()
            item.setData(Qt.UserRole, bin_)
            self.list_widget.addItem(item)
            row = self._make_bin_row(bin_)
            item.setSizeHint(row.sizeHint())
            self.list_widget.setItemWidget(item, row)

    def _make_bin_row(self, bin_):
        row = QFrame()
        row.setObjectName("BinRow")
        row.setStyleSheet("QFrame#BinRow { border-radius: 12px; padding: 4px; }")
        row.setCursor(Qt.PointingHandCursor)
        row_layout = QHBoxLayout(row)
        row_layout.setContentsMargins(16, 12, 16, 12)

        icon = QLabel("📁")
        icon.setFixedWidth(32)

        info_layout = QVBoxLayout()
        label = QLabel(f"AY {bin_['school_year']} — {bin_['semester']} Semester")
        label.setObjectName("BinLabel")
        label.setStyleSheet("font-weight: bold; font-size: 14px;")
        created = QLabel(f"Created: {bin_['created_at'][:10]}")
        created.setObjectName("Subtitle")
        info_layout.addWidget(label)
        info_layout.addWidget(created)

        view_btn = QPushButton("View Documents →")
        view_btn.setObjectName("GhostButton")
        view_btn.setMinimumWidth(180)
        view_btn.clicked.connect(lambda _, b=bin_: self.on_open_bin(b))

        delete_btn = QPushButton("Delete")
        delete_btn.setObjectName("DangerButton")
        delete_btn.setFixedWidth(80)
        delete_btn.setStyleSheet("QPushButton { color: #b91c1c; background: #fee2e2; border-radius: 8px; padding: 6px 12px; font-weight: bold; } QPushButton:hover { background: #fecaca; }")
        delete_btn.clicked.connect(lambda _, b=bin_: self.confirm_delete(b))

        row_layout.addWidget(icon)
        row_layout.addLayout(info_layout)
        row_layout.addStretch()
        row_layout.addWidget(view_btn)
        row_layout.addSpacing(8)
        row_layout.addWidget(delete_btn)
        return row

    def on_fetch_error(self, err):
        cache = get_cache_service()
        if cache.is_fresh(CACHE_KEY):
            cached = cache.get(CACHE_KEY)
            if cached:
                age = cache.get_age_seconds(CACHE_KEY)
                if self.status_label:
                    self.status_label.setText(f"Offline - showing cached data ({age // 60} min old). Error: {err}")
                self._display_bins(cached)
                return
        
        if self.list_widget.count() == 0:
            if self.status_label:
                self.status_label.setText(f"Error loading bins: {err}")

    def open_create_dialog(self):
        dialog = CreateBinDialog(self)
        if dialog.exec() == QDialog.Accepted:
            school_year, semester = dialog.get_values()
            if not school_year:
                QMessageBox.warning(self, "Validation Error", "Please enter an academic year.")
                return
            self._create_bin(school_year, semester)

    def _create_bin(self, school_year, semester):
        try:
            res = requests.post(
                f"{API_BASE}/submission-bins/",
                json={"school_year": school_year, "semester": semester},
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=10
            )
            if res.status_code == 409:
                QMessageBox.warning(self, "Duplicate", "A bin for this semester already exists.")
                return
            res.raise_for_status()
            QMessageBox.information(self, "Success", f"Bin created for AY {school_year} — {semester} Semester.")
            self.load_bins()
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Failed to create bin:\n{e}")

    def confirm_delete(self, bin_):
        label = f"AY {bin_['school_year']} — {bin_['semester']} Semester"
        reply = QMessageBox.question(
            self, "Confirm Delete",
            f"Delete \"{label}\"?\n\nAll documents in this bin will be unassigned but not deleted.",
            QMessageBox.Yes | QMessageBox.No
        )
        if reply == QMessageBox.Yes:
            self._delete_bin(bin_["id"])

    def _delete_bin(self, bin_id):
        try:
            res = requests.delete(
                f"{API_BASE}/submission-bins/{bin_id}",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=10
            )
            res.raise_for_status()
            QMessageBox.information(self, "Deleted", "Submission bin deleted.")
            self.load_bins()
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Failed to delete bin:\n{e}")
