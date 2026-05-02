from PySide6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, 
                               QLabel, QLineEdit, QPushButton, QFrame, QGraphicsDropShadowEffect)
from PySide6.QtCore import Qt, QTimer, QThread, Signal
from PySide6.QtGui import QColor
import requests

from services.cache_service import get_cache_service, load_auth_token, save_auth_token, clear_auth_token
from services.network_status import get_network_status


API_BASE = "http://localhost:8000"


class AutoLoginThread(QThread):
    done = Signal(str, bool)
    error = Signal(str)

    def __init__(self, token):
        super().__init__()
        self.token = token

    def run(self):
        try:
            response = requests.get(
                f"{API_BASE}/scholars/me",
                headers={"Authorization": f"Bearer {self.token}"},
                timeout=5
            )
            if response.status_code == 200:
                self.done.emit(self.token, True)
            elif response.status_code == 401:
                self.error.emit("Session expired")
            else:
                self.error.emit(f"Error: {response.status_code}")
        except requests.RequestException as e:
            self.error.emit(str(e))


class LoginView(QWidget):
    def __init__(self, on_success_callback):
        super().__init__()
        self.on_success_callback = on_success_callback
        
        main_layout = QVBoxLayout(self)
        main_layout.setAlignment(Qt.AlignCenter)
        
        card = QFrame()
        card.setObjectName("Panel")
        card.setFixedSize(450, 520)
        
        shadow = QGraphicsDropShadowEffect(self)
        shadow.setBlurRadius(32)
        shadow.setColor(QColor(23, 29, 24, 25))
        shadow.setOffset(0, 8)
        card.setGraphicsEffect(shadow)
        
        card_layout = QVBoxLayout(card)
        card_layout.setContentsMargins(40, 40, 40, 40)
        card_layout.setSpacing(20)
        
        title = QLabel("Evaluator Portal")
        title.setObjectName("Title")
        
        subtitle = QLabel("Sign in to manage scholars")
        subtitle.setObjectName("Subtitle")
        
        self.email_input = QLineEdit()
        self.email_input.setPlaceholderText("Evaluator Email")
        
        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("Password")
        self.password_input.setEchoMode(QLineEdit.Password)
        
        self.error_label = QLabel()
        self.error_label.setStyleSheet("color: #ba1a1a; font-size: 12px;")
        self.error_label.hide()
        
        self.login_btn = QPushButton("Sign In")
        self.login_btn.setCursor(Qt.PointingHandCursor)
        self.login_btn.clicked.connect(self.attempt_login)
        
        self.status_label = QLabel()
        self.status_label.setStyleSheet("color: #006834; font-size: 12px;")
        self.status_label.hide()
        
        card_layout.addWidget(title)
        card_layout.addWidget(subtitle)
        card_layout.addWidget(self.status_label)
        card_layout.addWidget(self.email_input)
        card_layout.addWidget(self.password_input)
        card_layout.addWidget(self.error_label)
        card_layout.addWidget(self.login_btn)
        card_layout.addStretch()
        
        cache_link = QPushButton("Clear Cache")
        cache_link.setObjectName("GhostButton")
        cache_link.setCursor(Qt.PointingHandCursor)
        cache_link.clicked.connect(self._clear_cache)
        
        cache_layout = QHBoxLayout()
        cache_layout.addStretch()
        cache_layout.addWidget(cache_link)
        card_layout.addLayout(cache_layout)
        
        main_layout.addWidget(card)
        
        self._auto_login_thread = None
        QTimer.singleShot(100, self._try_auto_login)

    def _try_auto_login(self):
        cached_token = load_auth_token()
        if not cached_token:
            return
        
        network = get_network_status()
        
        try:
            is_online = network.is_online()
        except Exception:
            is_online = False
        
        if is_online:
            if self.status_label:
                self.status_label.setText("Checking saved session...")
                self.status_label.show()
            
            self._auto_login_thread = AutoLoginThread(cached_token)
            self._auto_login_thread.done.connect(self._on_auto_login_success)
            self._auto_login_thread.error.connect(self._on_auto_login_error)
            self._auto_login_thread.start()
        else:
            if cached_token:
                if self.status_label:
                    self.status_label.setText("Working offline with saved session...")
                    self.status_label.show()
                self.on_success_callback(cached_token)

    def _on_auto_login_success(self, token, valid: bool):
        self.on_success_callback(token)

    def _on_auto_login_error(self, err):
        cached_token = load_auth_token()
        if cached_token:
            if self.status_label:
                self.status_label.setText("Working offline with saved session...")
                self.status_label.show()
            self.on_success_callback(cached_token)
        else:
            if self.status_label:
                self.status_label.setText("Saved session expired. Please sign in again.")
                self.status_label.show()
    
    def close(self):
        if self._auto_login_thread and self._auto_login_thread.isRunning():
            self._auto_login_thread.quit()
            self._auto_login_thread.wait()
        super().close()

    def attempt_login(self):
        email = self.email_input.text()
        password = self.password_input.text()
        
        if not email or not password:
            self.error_label.setText("Please enter email and password")
            self.error_label.show()
            return
        
        try:
            response = requests.post(
                f"{API_BASE}/auth/login",
                data={"username": email, "password": password},
                timeout=10
            )
            if response.status_code == 200:
                data = response.json()
                token = data.get("access_token")
                if token:
                    save_auth_token(token)
                    self.on_success_callback(token)
                else:
                    self.error_label.setText("Invalid credentials")
                    self.error_label.show()
            else:
                self.error_label.setText("Invalid credentials")
                self.error_label.show()
        except Exception as e:
            self.error_label.setText("Cannot connect to server")
            self.error_label.show()

    def _clear_cache(self):
        from PySide6.QtWidgets import QMessageBox
        reply = QMessageBox.question(
            self, "Clear Cache",
            "This will delete all cached data including your saved session. Continue?",
            QMessageBox.Yes | QMessageBox.No
        )
        if reply == QMessageBox.Yes:
            cache = get_cache_service()
            clear_auth_token()
            cache.clear_all()
            QMessageBox.information(self, "Cache Cleared", "All cached data has been deleted.")