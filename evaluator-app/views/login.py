from PySide6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, 
                               QLabel, QLineEdit, QPushButton, QFrame, QGraphicsDropShadowEffect)
from PySide6.QtCore import Qt
from PySide6.QtGui import QColor
import requests

class LoginView(QWidget):
    def __init__(self, on_success_callback):
        super().__init__()
        self.on_success_callback = on_success_callback
        
        main_layout = QVBoxLayout(self)
        main_layout.setAlignment(Qt.AlignCenter)
        
        card = QFrame()
        card.setObjectName("Panel")
        card.setFixedSize(450, 500)
        
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
        
        if not email or not password:
            self.error_label.setText("Please enter email and password")
            self.error_label.show()
            return
        
        try:
            response = requests.post(
                "http://localhost:8000/auth/login",
                data={"username": email, "password": password},
                timeout=10
            )
            if response.status_code == 200:
                data = response.json()
                token = data.get("access_token")
                if token:
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