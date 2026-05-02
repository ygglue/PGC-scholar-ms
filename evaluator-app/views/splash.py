from PySide6.QtWidgets import QWidget, QVBoxLayout, QLabel
from PySide6.QtCore import Qt

class SplashView(QWidget):
    def __init__(self):
        super().__init__()
        self.setObjectName("SplashView")
        self.setStyleSheet("QWidget#SplashView { background-color: #F0F2F0; }")
        
        layout = QVBoxLayout(self)
        layout.setAlignment(Qt.AlignCenter)
        
        logo = QLabel("PGC-Scholar\nEvaluator")
        logo.setStyleSheet("font-size: 32px; font-weight: bold; color: #1A8C3C; font-family: 'Plus Jakarta Sans';")
        logo.setAlignment(Qt.AlignCenter)
        
        status = QLabel("Preparing your session...")
        status.setStyleSheet("font-size: 14px; color: #4A5568; font-family: 'Plus Jakarta Sans'; margin-top: 16px;")
        status.setAlignment(Qt.AlignCenter)
        
        layout.addWidget(logo)
        layout.addWidget(status)
