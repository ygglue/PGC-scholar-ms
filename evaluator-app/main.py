import sys
import os
import ctypes
from PySide6.QtWidgets import (QApplication, QStackedWidget, QWidget, QHBoxLayout, QVBoxLayout, QLabel, QPushButton, QFrame, QMessageBox, QSizePolicy)
from PySide6.QtCore import Qt, QPoint, QTimer
from PySide6.QtGui import QScreen, QWindow, QIcon
from views.login import LoginView
from views.dashboard import DashboardView
from views.scholars_directory import ScholarsDirectoryView
from views.submission_bins import SubmissionBinsView
from views.bin_documents import BinDocumentsView
from views.splash import SplashView
from services.cache_service import get_cache_service, clear_auth_token, save_auth_token, load_auth_token
from services.network_status import get_network_status
from services.sync_service import get_sync_service

def set_windows_titlebar_color(hwnd, color_hex):
    try:
        r = int(color_hex[1:3], 16)
        g = int(color_hex[3:5], 16)
        b = int(color_hex[5:7], 16)
        color_ref = (b << 16) | (g << 8) | r
        DWMWA_CAPTION_COLOR = 35
        ctypes.windll.dwmapi.DwmSetWindowAttribute(
            hwnd,
            DWMWA_CAPTION_COLOR,
            ctypes.byref(ctypes.c_int(color_ref)),
            ctypes.sizeof(ctypes.c_int)
        )
    except Exception as e:
        print(f"Could not set titlebar color: {e}")

class MainWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Evaluator Portal")
        self.resize(1200, 800)
        
        # (Translucent/Frameless temporarily disabled for debugging)
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)
        
        self.offline_banner = QFrame()
        self.offline_banner.setObjectName("OfflineBanner")
        self.offline_banner.setFixedHeight(36)
        self.offline_banner.setStyleSheet("QFrame#OfflineBanner { background-color: #fef3c7; border-bottom: 1px solid #fcd34d; }")
        self.offline_banner.setVisible(False)
        banner_layout = QHBoxLayout(self.offline_banner)
        banner_layout.setContentsMargins(16, 0, 16, 0)
        
        banner_icon = QLabel("⚠")
        banner_icon.setStyleSheet("font-size: 14px;")
        banner_text = QLabel("Offline — view only mode")
        banner_text.setStyleSheet("color: #92400e; font-weight: 500; font-size: 13px;")
        
        banner_layout.addWidget(banner_icon)
        banner_layout.addSpacing(8)
        banner_layout.addWidget(banner_text)
        banner_layout.addStretch()
        
        main_layout.addWidget(self.offline_banner)
        
        self.content_container = QFrame()
        self.content_container.setObjectName("ContentContainer")
        self.content_layout = QVBoxLayout(self.content_container)
        self.content_layout.setContentsMargins(0, 0, 0, 0)
        self.content_layout.setSpacing(0)
        
        network = get_network_status()
        network.add_callback(self._on_network_change)
        network.start()
        
        main_layout.addWidget(self.content_container)
        
        self.stacked_widget = QStackedWidget(self.content_container)
        self.stacked_widget.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        self.content_layout.addWidget(self.stacked_widget)
        
        self.dashboard_view = DashboardView(
            self.handle_show_scholars_directory,
            self.handle_show_submission_bins,
            self.handle_logout
        )
        self.login_view = LoginView(self.handle_login_success)
        self.splash_view = SplashView()
        self.scholars_directory_view = None
        self.submission_bins_view = None
        self.bin_documents_view = None

        self.stacked_widget.addWidget(self.dashboard_view)
        self.stacked_widget.addWidget(self.login_view)
        self.stacked_widget.addWidget(self.splash_view)

        self.stacked_widget.setCurrentWidget(self.splash_view)

        # Sync Service Setup
        self.sync = get_sync_service()
        self.sync.sync_finished.connect(self._on_sync_finished)
        self.sync.sync_progress.connect(self._on_sync_progress)
        self.sync.session_expired.connect(self.handle_logout)

        self.sync_timer = QTimer(self)
        self.sync_timer.timeout.connect(self._trigger_background_sync)
        self.sync_timer.setInterval(300000) # 5 minutes

        # Check session after initialization
        QTimer.singleShot(500, self.check_session)

    def check_session(self):
        print("DEBUG: Checking session...")
        token = load_auth_token()
        if token:
            print("DEBUG: Token found, attempting login...")
            self.handle_login_success(token)
        else:
            print("DEBUG: No token, showing login...")
            self.stacked_widget.setCurrentWidget(self.login_view)
        
        print("DEBUG: Showing window...")
        self.show()
        self.stacked_widget.show()
        self.stacked_widget.currentWidget().show()

    def _on_sync_progress(self, msg):
        self.offline_banner.show()
        # Find the text label and update it
        for child in self.offline_banner.findChildren(QLabel):
            if "Syncing" in child.text() or "view only" in child.text():
                child.setText(f"Syncing: {msg}")
                child.setStyleSheet("color: #065f46; font-weight: 500; font-size: 13px;") # Greenish
        self.offline_banner.setStyleSheet("QFrame#OfflineBanner { background-color: #d1fae5; border-bottom: 1px solid #6ee7b7; }")

    def _on_sync_finished(self, success, msg):
        if not get_network_status().is_online():
            self._update_banner_offline()
        else:
            self.offline_banner.hide()

    def _update_banner_offline(self):
        self.offline_banner.show()
        for child in self.offline_banner.findChildren(QLabel):
            if "Syncing" in child.text() or "view only" in child.text():
                child.setText("Offline — view only mode")
                child.setStyleSheet("color: #92400e; font-weight: 500; font-size: 13px;")
        self.offline_banner.setStyleSheet("QFrame#OfflineBanner { background-color: #fef3c7; border-bottom: 1px solid #fcd34d; }")

    def _trigger_background_sync(self):
        # Only sync if logged in (not on login screen)
        if self.stacked_widget.currentWidget() == self.login_view:
            return

        token = load_auth_token()
        if token and get_network_status().is_online():
            self.sync.start_sync(token)

    def handle_login_success(self, token: str):
        print("DEBUG: handle_login_success called")
        save_auth_token(token)
        print("DEBUG: Token saved")
        self.dashboard_view.initialize_dashboard(token)
        print("DEBUG: Dashboard initialized")
        self.stacked_widget.setCurrentWidget(self.dashboard_view)
        print(f"DEBUG: Current widget is {self.stacked_widget.currentWidget()}")
        # Trigger immediate sync
        self.sync.start_sync(token)
        self.sync_timer.start()
        self.show()

    def handle_show_scholars_directory(self):
        if not self.scholars_directory_view:
            self.scholars_directory_view = ScholarsDirectoryView(
                self.dashboard_view.token,
                self.handle_back_to_dashboard,
                self.handle_show_submission_bins
            )
            self.stacked_widget.addWidget(self.scholars_directory_view)
        self.stacked_widget.setCurrentWidget(self.scholars_directory_view)

    def handle_show_submission_bins(self):
        if not self.submission_bins_view:
            self.submission_bins_view = SubmissionBinsView(
                self.dashboard_view.token,
                self.handle_back_to_dashboard,
                self.handle_open_bin
            )
            self.stacked_widget.addWidget(self.submission_bins_view)
        else:
            self.submission_bins_view.load_bins()
        self.stacked_widget.setCurrentWidget(self.submission_bins_view)

    def handle_open_bin(self, bin_: dict):
        # Always recreate so documents are fresh
        if self.bin_documents_view:
            self.stacked_widget.removeWidget(self.bin_documents_view)
            self.bin_documents_view.deleteLater()
        self.bin_documents_view = BinDocumentsView(
            self.dashboard_view.token,
            bin_,
            self.handle_back_to_bins
        )
        self.stacked_widget.addWidget(self.bin_documents_view)
        self.stacked_widget.setCurrentWidget(self.bin_documents_view)

    def handle_back_to_bins(self):
        if self.submission_bins_view:
            self.submission_bins_view.load_bins()
        self.stacked_widget.setCurrentWidget(self.submission_bins_view)

    def handle_back_to_dashboard(self):
        self.stacked_widget.setCurrentWidget(self.dashboard_view)

    def _on_network_change(self, is_online: bool):
        if not is_online:
            self._update_banner_offline()
        else:
            self.offline_banner.hide()
            # Sync when coming back online, but ONLY if logged in
            if self.stacked_widget.currentWidget() != self.login_view:
                token = load_auth_token()
                if token:
                    self.sync.start_sync(token)

    def clear_cache(self):
        reply = QMessageBox.question(
            self, "Clear Cache",
            "This will delete all cached data and sign you out. You will need to sign in again. Continue?",
            QMessageBox.Yes | QMessageBox.No
        )
        if reply == QMessageBox.Yes:
            cache = get_cache_service()
            clear_auth_token()
            cache.clear_all()
            self.stacked_widget.setCurrentWidget(self.login_view)
            QMessageBox.information(self, "Cache Cleared", "All cached data has been deleted. Please sign in again.")

    def handle_logout(self):
        clear_auth_token()
        self.stacked_widget.setCurrentWidget(self.login_view)

    def quit_app(self):
        self.close()
        import sys
        sys.exit(0)


class EvaluatorApp(QApplication):
    def __init__(self, sys_argv):
        super().__init__(sys_argv)
        
        theme_path = os.path.join(os.path.dirname(__file__), "evaluator_theme.qss")
        if os.path.exists(theme_path):
            with open(theme_path, "r") as f:
                qss = f.read()
                # Resolve relative asset paths to absolute paths
                assets_dir = os.path.join(os.path.dirname(__file__), "assets").replace('\\', '/')
                qss = qss.replace("url(assets/", f"url({assets_dir}/")
                self.setStyleSheet(qss)
        
        self.main_window = MainWindow()

    def quit(self):
        self.main_window.close()
        return super().quit()


if __name__ == "__main__":
    app = EvaluatorApp(sys.argv)
    sys.exit(app.exec())