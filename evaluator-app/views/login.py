from PySide6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, 
                               QLabel, QLineEdit, QPushButton, QFrame, QGraphicsDropShadowEffect)
from PySide6.QtCore import Qt
from PySide6.QtGui import QColor

class LoginView(QWidget):
    def __init__(self, on_success_callback):
        super().__init__()
        self.on_success_callback = on_success_callback
        
        self.setStyleSheet("background-color: #f5fbf2;")
        main_layout = QVBoxLayout(self)
        main_layout.setAlignment(Qt.AlignCenter)
        
        # Login Card (Level 2: surface_container_lowest)
        card = QFrame()
        card.setStyleSheet("""
            QFrame {
                background-color: #ffffff;
                border-radius: 16px;
            }
        """)
        card.setFixedSize(450, 500)
        
        # Add ambient shadow
        shadow = QGraphicsDropShadowEffect(self)
        shadow.setBlurRadius(32)
        shadow.setColor(QColor(23, 29, 24, 10)) # 4% opacity of on_surface (#171d18)
        shadow.setOffset(0, 8)
        card.setGraphicsEffect(shadow)
        
        card_layout = QVBoxLayout(card)
        card_layout.setContentsMargins(40, 40, 40, 40)
        card_layout.setSpacing(20)
        
        # Title
        title = QLabel("Evaluator Portal")
        title.setStyleSheet("color: #006834; font-size: 32px; font-weight: bold; font-family: 'Plus Jakarta Sans', sans-serif;")
        title.setAlignment(Qt.AlignCenter)
        
        subtitle = QLabel("Sign in to manage scholars")
        subtitle.setStyleSheet("color: #555555; font-size: 14px; margin-bottom: 20px;")
        subtitle.setAlignment(Qt.AlignCenter)
        
        # Inputs
        self.email_input = QLineEdit()
        self.email_input.setPlaceholderText("Evaluator Email")
        
        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("Password")
        self.password_input.setEchoMode(QLineEdit.Password)
        
        self.error_label = QLabel()
        self.error_label.setStyleSheet("color: #ba1a1a; font-size: 12px;")
        self.error_label.hide()
        
        # Login Button
        self.login_btn = QPushButton("Sign In")
        self.login_btn.setCursor(Qt.PointingHandCursor)
        self.login_btn.clicked.connect(self.attempt_login)
        
        card_layout.addWidget(title)
        card_layout.addWidget(subtitle)
        card_layout.addWidget(self.email_input)
        card_layout.addWidget(self.password_input)
        card_layout.addWidget(self.error_label)
        card_layout.addWidget(self.login_btn)
        card_layout.addStretch()
        
        main_layout.addWidget(card)

    def attempt_login(self):
        email = self.email_input.text()
        password = self.password_input.text()
        
        # Dummy authentication for now
        # TODO: Implement actual API call via requests
        if email and password:
            self.error_label.hide()
            self.on_success_callback("dummy_jwt_token")
        else:
            self.error_label.setText("Please enter valid credentials")
            self.error_label.show()
