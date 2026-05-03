from PySide6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, 
                               QLabel, QPushButton, QFrame, QListWidget,
                               QGraphicsDropShadowEffect)
from PySide6.QtCore import Qt
from PySide6.QtGui import QColor

def create_ambient_shadow():
    shadow = QGraphicsDropShadowEffect()
    shadow.setBlurRadius(32)
    shadow.setXOffset(0)
    shadow.setYOffset(8)
    shadow.setColor(QColor(23, 29, 24, 15))
    return shadow

class DashboardView(QWidget):
    def __init__(self, on_show_scholars_directory, on_show_submission_bins, on_logout_callback):
        super().__init__()
        self.on_show_scholars_directory = on_show_scholars_directory
        self.on_show_submission_bins = on_show_submission_bins
        self.on_logout_callback = on_logout_callback
        self.token = None
        
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
        nav_pending.setProperty("active", "true")
        
        nav_scholars = QPushButton("Scholars Directory")
        nav_scholars.setObjectName("NavButton")
        nav_scholars.clicked.connect(self.on_show_scholars_directory)

        nav_bins = QPushButton("Submission Bins")
        nav_bins.setObjectName("NavButton")
        nav_bins.clicked.connect(self.on_show_submission_bins)

        logout_btn = QPushButton("Log Out")
        logout_btn.setObjectName("NavButton")
        logout_btn.clicked.connect(self.on_logout_callback)
        
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
        
        header = QLabel("Pending Submissions")
        header.setObjectName("Title")
        
        dashboard_body = QHBoxLayout()
        dashboard_body.setSpacing(32)
        
        self.list_widget = QListWidget()
        self.list_widget.setObjectName("Panel")
        self.list_widget.setGraphicsEffect(create_ambient_shadow())
        
        detail_panel = QFrame()
        detail_panel.setObjectName("Panel")
        detail_panel.setFixedWidth(350)
        detail_panel.setGraphicsEffect(create_ambient_shadow())
        detail_layout = QVBoxLayout(detail_panel)
        detail_layout.setContentsMargins(32, 32, 32, 32)
        
        detail_title = QLabel("Select an item")
        detail_title.setObjectName("Title")
        
        detail_desc = QLabel("Review details will appear here once you select a pending submission from the queue.")
        detail_desc.setObjectName("Subtitle")
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