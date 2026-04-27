import sys
import os
from PySide6.QtWidgets import QApplication, QStackedWidget
from views.login import LoginView
from views.dashboard import DashboardView

class EvaluatorApp(QApplication):
    def __init__(self, sys_argv):
        super().__init__(sys_argv)
        
        # Load fonts if available or rely on system fallback
        # QFontDatabase.addApplicationFont("path/to/PlusJakartaSans.ttf")
        
        # Global Styles based on DESIGN.md
        self.setStyleSheet("""
            QWidget {
                color: #171d18;
                font-family: 'Work Sans', 'Segoe UI', sans-serif;
            }
            QMainWindow {
                background-color: #f5fbf2;
            }
            QLineEdit {
                background-color: #dee4db;
                border: none;
                border-radius: 8px;
                padding: 12px;
                font-size: 14px;
            }
            QLineEdit:focus {
                border: 2px solid #006834;
            }
            QPushButton {
                background-color: #006834;
                color: white;
                border: none;
                border-radius: 20px;
                padding: 12px 24px;
                font-family: 'Plus Jakarta Sans', sans-serif;
                font-weight: bold;
                font-size: 14px;
            }
            QPushButton:hover {
                background-color: #008444;
            }
        """)

        self.stacked_widget = QStackedWidget()
        self.stacked_widget.setWindowTitle("Emerald Scholar - Evaluator Portal")
        self.stacked_widget.resize(1200, 800)
        
        # Initialize Views
        self.login_view = LoginView(self.handle_login_success)
        self.dashboard_view = DashboardView(self.handle_logout)
        
        self.stacked_widget.addWidget(self.login_view)
        self.stacked_widget.addWidget(self.dashboard_view)
        
        self.stacked_widget.setCurrentWidget(self.login_view)
        self.stacked_widget.show()

    def handle_login_success(self, token: str):
        # Store token and switch to dashboard
        self.dashboard_view.initialize_dashboard(token)
        self.stacked_widget.setCurrentWidget(self.dashboard_view)

    def handle_logout(self):
        self.stacked_widget.setCurrentWidget(self.login_view)

if __name__ == "__main__":
    app = EvaluatorApp(sys.argv)
    sys.exit(app.exec())
