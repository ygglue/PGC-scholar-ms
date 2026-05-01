# PGC Scholar Management System

A comprehensive ecosystem for managing scholarship applications, evaluations, and academic records. This system facilitates secure communication and document exchange between scholars and evaluators.

## 🏗 System Architecture

The system is split into three core components sharing a single backend API and Supabase database:

1. **Backend API (FastAPI)**: A Python-based RESTful API handling authentication, business logic, and database operations.
2. **Evaluator App (PySide6)**: A Windows desktop application designed for internal evaluators to review documents, manage scholar profiles, and process applications.
3. **Scholar Web App (React PWA)**: A mobile-friendly Progressive Web App for scholars to upload requirements, view their status, and access announcements offline.

---

## 🚀 Quick Setup Guide

### Prerequisites
- **Python 3.10+** (for Backend and Evaluator App)
- **Node.js 18+** (for Scholar Web App)
- **uv** (recommended Python package manager)

### 1. Backend Setup (FastAPI)
The backend uses FastAPI and connects to a Supabase PostgreSQL instance.

```bash
cd backend

# Create and activate a virtual environment
uv venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
uv pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials, JWT secret, and Google Client ID

# Run the backend server
uvicorn app.main:app --reload
```
*The API docs will be available at `http://localhost:8000/docs`.*

### 2. Evaluator Desktop App Setup (PySide6)
The evaluator app is a desktop application built with Qt6.

```bash
cd evaluator-app

# Ensure your virtual environment is activated
# Install dependencies
uv pip install -r requirements.txt

# Run the desktop application
python main.py
```

### 3. Scholar Web App Setup (React + Vite)
The scholar portal is a React PWA built with Vite.

```bash
cd scholar-web

# Install NPM dependencies
npm install

# Start the Vite development server
npm run dev
```
*The web app will be available at `http://localhost:5173`.*

---


## 🔐 Authentication
- **Scholars** log in via Google OAuth 2.0.
- **Evaluators** log in using internal accounts with email and bcrypt-hashed passwords.
