from PySide6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, 
                               QLabel, QPushButton, QFrame, QListWidget, QSplitter)
from PySide6.QtCore import Qt

class DashboardView(QWidget):
    def __init__(self, on_logout_callback):
        super().__init__()
        self.on_logout_callback = on_logout_callback
        self.token = None
        
        self.setStyleSheet("background-color: #f5fbf2;")
        
        main_layout = QHBoxLayout(self)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)
        
        # Sidebar (Level 1: surface_container_low)
        sidebar = QFrame()
        sidebar.setStyleSheet("""
            QFrame {
                background-color: #f0f5ec;
            }
        """)
        sidebar.setFixedWidth(280)
        sidebar_layout = QVBoxLayout(sidebar)
        sidebar_layout.setContentsMargins(24, 40, 24, 40)
        
        brand = QLabel("PGC-Scholar\nEvaluator")
        brand.setStyleSheet("font-family: 'Plus Jakarta Sans', sans-serif; font-size: 24px; font-weight: bold; color: #006834;")
        
        nav_pending = QPushButton("Pending Documents")
        nav_pending.setStyleSheet("""
            QPushButton {
                background-color: #ffffff; 
                color: #006834; 
                border-radius: 12px; 
                text-align: left; 
                padding: 16px;
                font-weight: bold;
                font-family: 'Plus Jakarta Sans', sans-serif;
            }
        """)
        nav_pending.setCursor(Qt.PointingHandCursor)
        
        logout_btn = QPushButton("Log Out")
        logout_btn.setStyleSheet("""
            QPushButton {
                background-color: transparent; 
                color: #ba1a1a; 
                text-align: left; 
                padding: 16px;
                font-weight: bold;
                font-family: 'Plus Jakarta Sans', sans-serif;
            }
            QPushButton:hover {
                background-color: #ffdad6;
                border-radius: 12px;
            }
        """)
        logout_btn.setCursor(Qt.PointingHandCursor)
        logout_btn.clicked.connect(self.on_logout_callback)
        
        sidebar_layout.addWidget(brand)
        sidebar_layout.addSpacing(48)
        sidebar_layout.addWidget(nav_pending)
        sidebar_layout.addStretch()
        sidebar_layout.addWidget(logout_btn)
        
        # Main Content Area
        content = QFrame()
        content_layout = QVBoxLayout(content)
        content_layout.setContentsMargins(48, 48, 48, 48)
        
        header = QLabel("Pending Submissions")
        header.setStyleSheet("font-family: 'Plus Jakarta Sans', sans-serif; font-size: 32px; font-weight: bold; color: #171d18;")
        
        # Dashboard Content (Asymmetrical Layout)
        dashboard_body = QHBoxLayout()
        dashboard_body.setSpacing(32)
        
        # Main List Panel (Wider)
        self.list_widget = QListWidget()
        self.list_widget.setStyleSheet("""
            QListWidget {
                background-color: #ffffff;
                border-radius: 16px;
                padding: 16px;
                border: none;
                outline: none;
            }
            QListWidget::item {
                padding: 24px;
                border-bottom: 2px solid #f0f5ec;
                color: #171d18;
                font-family: 'Work Sans', sans-serif;
                font-size: 15px;
            }
            QListWidget::item:selected {
                background-color: #e2e3e0;
                color: #006834;
                border-radius: 12px;
            }
        """)
        self.list_widget.addItem("Juan Dela Cruz - Certificate of Registration")
        self.list_widget.addItem("Maria Clara - Report of Grades")
        self.list_widget.addItem("Andres Bonifacio - Profile Update Request")
        
        # Detail Panel (Narrower)
        detail_panel = QFrame()
        detail_panel.setStyleSheet("background-color: #ffffff; border-radius: 16px;")
        detail_panel.setFixedWidth(350)
        detail_layout = QVBoxLayout(detail_panel)
        detail_layout.setContentsMargins(32, 32, 32, 32)
        
        detail_title = QLabel("Select an item")
        detail_title.setStyleSheet("color: #171d18; font-weight: bold; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 18px;")
        
        detail_desc = QLabel("Review details will appear here once you select a pending submission from the queue.")
        detail_desc.setStyleSheet("color: #3f493f; font-family: 'Work Sans', sans-serif; font-size: 14px;")
        detail_desc.setWordWrap(True)
        
        detail_layout.addWidget(detail_title)
        detail_layout.addSpacing(16)
        detail_layout.addWidget(detail_desc)
        detail_layout.addStretch()
        
        dashboard_body.addWidget(self.list_widget, stretch=2)
        dashboard_body.addWidget(detail_panel, stretch=1)
        
        content_layout.addWidget(header)
        content_layout.addSpacing(32)
        content_layout.addLayout(dashboard_body)
        
        main_layout.addWidget(sidebar)
        main_layout.addWidget(content)

    def initialize_dashboard(self, token: str):
        self.token = token
        # Fetch pending changes here
        pass
