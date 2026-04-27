import sys
import os
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QHBoxLayout, QVBoxLayout,
    QFrame, QLabel, QPushButton, QGraphicsDropShadowEffect,
    QLineEdit, QRadioButton, QCheckBox, QComboBox, QProgressBar,
    QTextEdit, QGridLayout, QScrollArea
)
from PySide6.QtGui import QColor
from PySide6.QtCore import Qt

def create_ambient_shadow():
    shadow = QGraphicsDropShadowEffect()
    shadow.setBlurRadius(32)
    shadow.setXOffset(0)
    shadow.setYOffset(8)
    # 4% opacity of #171d18 -> ~10 alpha
    shadow.setColor(QColor(23, 29, 24, 10))
    return shadow

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Evaluator App - Elements Gallery")
        self.resize(1200, 800)
        self.setObjectName("MainWindow")

        central_widget = QWidget()
        central_widget.setObjectName("MainWindow")
        self.setCentralWidget(central_widget)

        main_layout = QHBoxLayout(central_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # 1. Sidebar
        self.sidebar = QFrame()
        self.sidebar.setObjectName("Sidebar")
        self.sidebar.setFixedWidth(280)
        sidebar_layout = QVBoxLayout(self.sidebar)
        sidebar_layout.setContentsMargins(24, 32, 24, 24)
        sidebar_layout.setSpacing(12)

        brand_logo = QLabel("PGC-Scholar\nEvaluator")
        brand_logo.setObjectName("BrandLogo")
        sidebar_layout.addWidget(brand_logo)
        sidebar_layout.addSpacing(32)

        nav_gallery = QPushButton("UI Gallery")
        nav_gallery.setObjectName("NavButton")
        nav_gallery.setProperty("active", "true")
        
        sidebar_layout.addWidget(nav_gallery)
        sidebar_layout.addStretch()

        main_layout.addWidget(self.sidebar)

        # 2. Content Area (Scrollable)
        self.scroll_area = QScrollArea()
        self.scroll_area.setWidgetResizable(True)
        self.scroll_area.setFrameShape(QFrame.NoFrame)
        self.scroll_area.setObjectName("ContentArea")
        
        self.content_widget = QWidget()
        self.content_widget.setObjectName("ContentArea")
        content_layout = QVBoxLayout(self.content_widget)
        content_layout.setContentsMargins(32, 32, 32, 32)
        content_layout.setSpacing(24)

        # Gallery Panel
        gallery_panel = QFrame()
        gallery_panel.setObjectName("Panel")
        gallery_panel.setGraphicsEffect(create_ambient_shadow())
        gallery_layout = QVBoxLayout(gallery_panel)
        gallery_layout.setContentsMargins(32, 32, 32, 32)
        gallery_layout.setSpacing(32)

        title = QLabel("UI Components Gallery")
        title.setObjectName("Title")
        gallery_layout.addWidget(title)

        grid = QGridLayout()
        grid.setSpacing(32)

        # Row 0: Buttons
        lbl_btns = QLabel("Buttons")
        lbl_btns.setObjectName("Subtitle")
        grid.addWidget(lbl_btns, 0, 0)
        btn_layout = QHBoxLayout()
        btn_layout.setSpacing(16)
        btn1 = QPushButton("Primary Action")
        btn2 = QPushButton("Secondary Action")
        btn2.setObjectName("SecondaryButton")
        btn3 = QPushButton("Ghost Action")
        btn3.setObjectName("GhostButton")
        btn_layout.addWidget(btn1)
        btn_layout.addWidget(btn2)
        btn_layout.addWidget(btn3)
        btn_layout.addStretch()
        grid.addLayout(btn_layout, 0, 1)

        # Row 1: Text Inputs
        lbl_inputs = QLabel("Text Inputs")
        lbl_inputs.setObjectName("Subtitle")
        grid.addWidget(lbl_inputs, 1, 0)
        input_layout = QHBoxLayout()
        input_layout.setSpacing(16)
        line_edit = QLineEdit()
        line_edit.setPlaceholderText("Enter data...")
        combo = QComboBox()
        combo.addItems(["Option 1", "Option 2", "Option 3"])
        input_layout.addWidget(line_edit)
        input_layout.addWidget(combo)
        grid.addLayout(input_layout, 1, 1)

        # Row 2: Text Area
        lbl_area = QLabel("Text Area")
        lbl_area.setObjectName("Subtitle")
        grid.addWidget(lbl_area, 2, 0)
        text_edit = QTextEdit()
        text_edit.setPlaceholderText("Enter multi-line text here. Notice the ghost border on focus...")
        text_edit.setFixedHeight(80)
        grid.addWidget(text_edit, 2, 1)

        # Row 3: Checks and Radios
        lbl_toggles = QLabel("Toggles")
        lbl_toggles.setObjectName("Subtitle")
        grid.addWidget(lbl_toggles, 3, 0)
        toggle_layout = QHBoxLayout()
        toggle_layout.setSpacing(24)
        
        radio1 = QRadioButton("Radio 1")
        radio1.setChecked(True)
        radio2 = QRadioButton("Radio 2")
        check1 = QCheckBox("Checkbox 1")
        check1.setChecked(True)
        check2 = QCheckBox("Checkbox 2")
        
        toggle_layout.addWidget(radio1)
        toggle_layout.addWidget(radio2)
        toggle_layout.addWidget(check1)
        toggle_layout.addWidget(check2)
        toggle_layout.addStretch()
        grid.addLayout(toggle_layout, 3, 1)

        # Row 4: Progress
        lbl_progress = QLabel("Achievement\nTracker")
        lbl_progress.setObjectName("Subtitle")
        grid.addWidget(lbl_progress, 4, 0)
        progress = QProgressBar()
        progress.setValue(65)
        progress.setFixedHeight(12)
        grid.addWidget(progress, 4, 1)

        gallery_layout.addLayout(grid)
        gallery_layout.addStretch()

        content_layout.addWidget(gallery_panel)
        content_layout.addStretch()

        self.scroll_area.setWidget(self.content_widget)
        main_layout.addWidget(self.scroll_area)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    
    # Absolute path to stylesheet
    qss_path = os.path.join(os.path.dirname(__file__), "evaluator_theme.qss")
    try:
        with open(qss_path, "r") as f:
            app.setStyleSheet(f.read())
    except Exception as e:
        print(f"Could not load stylesheet: {e}")

    window = MainWindow()
    window.show()
    sys.exit(app.exec())
