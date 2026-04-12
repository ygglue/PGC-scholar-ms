# Scholar Management System — Skills & Knowledge Reference

This document covers the key technical concepts, patterns, and skills needed to build and maintain this system. Use it as a reference when you're unsure how something works.

---

## Python & uv

### What is uv
`uv` is a fast Python package and project manager written in Rust. It replaces `pip`, `venv`, and `pip-tools` in one tool. It's 10–100x faster than pip and automatically generates a lockfile (`uv.lock`) that pins every dependency precisely — preventing version conflicts like the bcrypt issue encountered in this project.

### Installing uv

```bash
# Windows (PowerShell)
powershell -ExecutionPolicy BypassScope -c "irm https://astral.sh/uv/install.ps1 | iex"

# Mac/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Verify the install:
```bash
uv --version
```

### Setting up a new project with uv

```bash
# Initialize a new project (creates pyproject.toml + .venv automatically)
cd backend
uv init

# Or if the folder already exists and has code
uv init --no-workspace
```

`uv init` creates:
```
backend/
├── pyproject.toml    # project metadata and dependencies (replaces requirements.txt)
├── uv.lock           # exact pinned versions of everything (commit this to git)
└── .venv/            # virtual environment (do NOT commit this)
```

### Installing packages

```bash
# Add a package (installs it AND adds it to pyproject.toml)
uv add fastapi
uv add "uvicorn[standard]"
uv add sqlalchemy alembic psycopg2-binary
uv add "python-jose[cryptography]"
uv add "passlib[bcrypt]"
uv add python-multipart supabase google-auth python-dotenv

# Add a package pinned to a specific version
uv add "bcrypt==3.2.2"
uv add "passlib==1.7.4"

# Add a dev-only package (not included in production)
uv add --dev pytest ruff
```

### Installing from an existing project

```bash
# On a new machine — installs everything from uv.lock exactly
uv sync
```

This replaces `pip install -r requirements.txt`. The lockfile guarantees everyone gets the exact same versions.

### Running commands inside the project

```bash
# Run the FastAPI server
uv run uvicorn app.main:app --reload

# Run alembic
uv run alembic upgrade head
uv run alembic revision --autogenerate -m "add announcements table"

# Run a one-off script
uv run python -c "from dotenv import load_dotenv; load_dotenv(); print('ok')"
```

`uv run` automatically uses the project's virtual environment — no need to activate it first.

### If you prefer to activate the venv manually

```bash
# Activate
.venv\Scripts\activate       # Windows
source .venv/bin/activate    # Mac/Linux

# Then run commands normally
uvicorn app.main:app --reload
alembic upgrade head
```

### Removing a package

```bash
uv remove package-name
```

### Upgrading a package

```bash
# Upgrade to latest
uv lock --upgrade-package package-name

# Upgrade to a specific version
uv add "package-name>=new-version"
```

### Viewing installed packages

```bash
uv pip list
```

### The pyproject.toml file

`uv init` creates this. All dependencies live here instead of `requirements.txt`.

```toml
[project]
name = "scholar-management-system-backend"
version = "0.1.0"
requires-python = ">=3.13"
dependencies = [
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.30.0",
    "sqlalchemy>=2.0.0",
    "alembic>=1.13.0",
    "psycopg2-binary>=2.9.0",
    "python-jose[cryptography]>=3.3.0",
    "passlib==1.7.4",
    "bcrypt==3.2.2",
    "python-multipart>=0.0.9",
    "supabase>=2.0.0",
    "google-auth>=2.0.0",
    "python-dotenv>=1.0.0",
]

[tool.uv]
dev-dependencies = [
    "pytest>=8.0.0",
    "ruff>=0.4.0",
]
```

### What to commit to git

```
# Commit these
pyproject.toml    ← dependency declarations
uv.lock           ← exact pinned versions (this is the lockfile)

# Never commit these
.venv/            ← add to .gitignore
```

### Pinning problem packages

For packages with known compatibility issues like bcrypt + passlib, pin them as exact versions in `pyproject.toml`. `uv.lock` then enforces them on every machine — eliminating the version mismatch problem entirely:

```bash
uv add "bcrypt==3.2.2" "passlib==1.7.4"
```

### uv vs pip quick reference

| Task | pip | uv |
|---|---|---|
| Create venv | `python -m venv venv` | `uv init` (automatic) |
| Activate venv | `venv\Scripts\activate` | not needed with `uv run` |
| Install package | `pip install fastapi` | `uv add fastapi` |
| Install all deps | `pip install -r requirements.txt` | `uv sync` |
| Run a command | activate first, then run | `uv run command` |
| Freeze versions | `pip freeze > requirements.txt` | automatic via `uv.lock` |
| Remove package | `pip uninstall package` | `uv remove package` |

### f-strings
```python
name = "Eli"
print(f"Hello, {name}")           # Hello, Eli
print(f"2 + 2 = {2 + 2}")        # 2 + 2 = 4
```

### Type hints
FastAPI uses type hints for automatic validation. Always add them to function parameters.

```python
def get_scholar(scholar_id: uuid.UUID, name: str, active: bool = True):
    ...
```

---

## FastAPI

### How routes work
```python
from fastapi import APIRouter

router = APIRouter(prefix="/scholars", tags=["scholars"])

@router.get("/")           # GET /scholars/
@router.post("/")          # POST /scholars/
@router.get("/{id}")       # GET /scholars/some-uuid
@router.patch("/{id}")     # PATCH /scholars/some-uuid
@router.delete("/{id}")    # DELETE /scholars/some-uuid
```

### Dependency injection
FastAPI's `Depends()` is how you reuse logic across endpoints — like getting the current user or a database session.

```python
from fastapi import Depends

# This runs before your endpoint and passes its return value in
def get_current_user(token: str = Depends(oauth2_scheme)):
    return verify_token(token)

@router.get("/me")
def get_profile(user=Depends(get_current_user)):
    # user is already verified here
    return user
```

### Pydantic models (request validation)
Pydantic models define the shape of request bodies. FastAPI validates them automatically.

```python
from pydantic import BaseModel
from typing import Optional

class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    # Optional fields don't need to be sent
    # None = not provided by the client
```

### Raising HTTP errors
```python
from fastapi import HTTPException

raise HTTPException(status_code=404, detail="Scholar not found")
raise HTTPException(status_code=403, detail="Evaluators only")
raise HTTPException(status_code=409, detail="Already has a pending update")
```

### File uploads
```python
from fastapi import UploadFile, File, Form

@router.post("/upload")
async def upload(
    file: UploadFile = File(...),
    doc_type: str = Form(...),
):
    file_bytes = await file.read()
    print(file.filename, file.content_type, len(file_bytes))
```

### Running the dev server
```bash
uv run uvicorn app.main:app --reload
```

---

## SQLAlchemy

### What it does
SQLAlchemy maps Python classes to database tables. You write Python, it writes SQL.

### Defining a model
```python
from sqlalchemy import Column, String, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, nullable=False, unique=True)
    is_active = Column(Boolean, default=True)
```

### Querying
```python
# Get all
scholars = db.query(Scholar).all()

# Filter
active = db.query(Scholar).filter(Scholar.status == "active").all()

# Get one
scholar = db.query(Scholar).filter(Scholar.id == some_id).first()

# Multiple filters
results = db.query(Scholar).filter(
    Scholar.school == "UST",
    Scholar.batch_number == "Batch 5"
).all()
```

### Creating a record
```python
new_scholar = Scholar(
    id=uuid.uuid4(),
    first_name="Juan",
    last_name="Dela Cruz"
)
db.add(new_scholar)
db.commit()
```

### Updating a record
```python
scholar = db.query(Scholar).filter(Scholar.id == scholar_id).first()
scholar.first_name = "John"
db.commit()
```

### Relationships
```python
# One-to-many: one scholar has many academic records
class Scholar(Base):
    academic_records = relationship("AcademicRecord", back_populates="scholar")

class AcademicRecord(Base):
    scholar_id = Column(UUID, ForeignKey("scholars.id"))
    scholar = relationship("Scholar", back_populates="academic_records")

# Access:
scholar = db.query(Scholar).first()
scholar.academic_records  # list of AcademicRecord objects
```

### db.flush() vs db.commit()
- `db.flush()` — sends SQL to the database but doesn't finalize. Use when you need the generated ID of a new record before creating related records.
- `db.commit()` — finalizes everything. Use at the end when all records are ready.

---

## Alembic (database migrations)

### What it does
Alembic tracks changes to your SQLAlchemy models and generates SQL to update the live database.

### Common commands

```bash
# Generate a new migration after changing a model
uv run alembic revision --autogenerate -m "description of change"

# Apply pending migrations to the database
uv run alembic upgrade head

# Undo the last migration
uv run alembic downgrade -1

# See migration history
uv run alembic history
```

### Rules
- Never edit an existing migration file after it has been run
- Always run from inside the `backend/` folder
- Always import new models in `migrations/env.py` before running autogenerate
- New columns added to existing tables should always be `nullable=True` or have a `default`

---

## JWT (JSON Web Tokens)

### What they are
JWTs are signed strings that prove who you are. The server creates them at login and the client sends them with every request.

### Structure
```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLWlkIiwicm9sZSI6InNjaG9sYXIifQ.signature
header                 payload                                              signature
```

### Creating a token
```python
from jose import jwt
from datetime import datetime, timedelta

token = jwt.encode(
    {"sub": str(user.id), "role": user.role, "exp": datetime.utcnow() + timedelta(hours=8)},
    SECRET_KEY,
    algorithm="HS256"
)
```

### Verifying a token
```python
payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
user_id = payload["sub"]
role = payload["role"]
```

### How to send a token in requests
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

---

## bcrypt (password hashing)

### Why you never store plain passwords
If your database is ever compromised, plain passwords expose every user. Hashed passwords are one-way — you can verify a password against a hash but you cannot reverse the hash back to the password.

### Usage
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"])

# Hash a password (on account creation)
hashed = pwd_context.hash("user-password")

# Verify a password (on login)
is_valid = pwd_context.verify("user-password", hashed)
```

### Important
`bcrypt` must be pinned to `3.2.2` and `passlib` to `1.7.4`. With uv, add them as exact pins so `uv.lock` enforces them everywhere:

```bash
uv add "bcrypt==3.2.2" "passlib==1.7.4"
```

---

## Google OAuth

### How it works in this system
1. Scholar clicks "Sign in with Google" in the browser
2. Google shows a consent screen and returns a **Google ID token** (a JWT signed by Google)
3. Scholar web app sends that token to your backend
4. Backend verifies it using Google's public keys
5. Backend extracts the email and checks if it's a registered scholar
6. Backend issues its own JWT

### Verifying a Google token
```python
from google.oauth2 import id_token
from google.auth.transport import requests as grequests
import os

info = id_token.verify_oauth2_token(
    google_id_token,
    grequests.Request(),
    os.getenv("GOOGLE_CLIENT_ID")
)
email = info["email"]
```

### Getting a Google Client ID
1. Go to console.cloud.google.com
2. Create a project
3. APIs & Services → Credentials → Create OAuth 2.0 Client ID
4. Add `http://localhost:5173` as an authorized JavaScript origin
5. Copy the Client ID into your `.env` as `GOOGLE_CLIENT_ID`

---

## Supabase Storage

### Uploading a file
```python
from supabase import create_client

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

supabase.storage.from_("scholar-documents").upload(
    path="scholars/uuid/COR/file.pdf",
    file=file_bytes,
    file_options={"content-type": "application/pdf"}
)
```

### Generating a signed URL
```python
result = supabase.storage.from_("scholar-documents").create_signed_url(
    path="scholars/uuid/COR/file.pdf",
    expires_in=120  # seconds
)
url = result["signedURL"]
```

### Deleting a file
```python
supabase.storage.from_("scholar-documents").remove(["scholars/uuid/COR/file.pdf"])
```

### Why use the service role key
The service role key bypasses Supabase's row-level security, which is needed to generate signed URLs server-side. Never expose the service role key to the browser — it only lives in your backend `.env`.

---

## PySide6 (evaluator desktop app)

### Setting up the evaluator app with uv

```bash
cd evaluator-app
uv init
uv add PySide6 requests python-dotenv
```

### Running the evaluator app
```bash
uv run python main.py
```

### Basic window
```python
import sys
from PySide6.QtWidgets import QApplication, QMainWindow, QLabel

app = QApplication(sys.argv)
window = QMainWindow()
window.setWindowTitle("Scholar Management System")
window.resize(1200, 800)
label = QLabel("Welcome, Evaluator", window)
window.show()
sys.exit(app.exec())
```

### Making API calls from the desktop app
```python
import requests

def login(email: str, password: str) -> str:
    res = requests.post("http://localhost:8000/auth/login", data={
        "username": email,
        "password": password
    })
    return res.json()["access_token"]

def get_scholars(token: str) -> list:
    res = requests.get(
        "http://localhost:8000/scholars/",
        headers={"Authorization": f"Bearer {token}"}
    )
    return res.json()
```

### Difference from PyQt6
The APIs are nearly identical. The only practical differences are the import names (`PySide6` vs `PyQt6`) and the license. Use `PySide6` — it's LGPL and safe for commercial use.

---

## React (scholar web app)

### Making API calls
```javascript
import axios from 'axios'

const API = 'http://localhost:8000'

// GET request
const response = await axios.get(`${API}/scholars/me`, {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})

// POST request
const response = await axios.post(`${API}/academic-records/me/submit`, {
  school_year: "2024-2025",
  semester: "1st",
}, {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})
```

### Protected routes
```jsx
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" />
  return children
}

// Usage
<Route path="/dashboard" element={
  <ProtectedRoute><Dashboard /></ProtectedRoute>
} />
```

### PWA offline caching
The `@vitejs/plugin-pwa` handles the service worker. In `vite.config.js`:
```javascript
import { VitePWA } from '@vitejs/plugin-pwa'

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [{
          urlPattern: /^https:\/\/your-api\.com\/scholars\/me/,
          handler: 'CacheFirst',
          options: { cacheName: 'scholar-profile' }
        }]
      }
    })
  ]
}
```

---

## Git basics

### Daily workflow
```bash
# Check what changed
git status

# Stage changes
git add .

# Commit with a message
git commit -m "add document upload endpoint"

# Push to GitHub
git push
```

### Good commit message format
```
verb + what you did (under 72 characters)

add grade submission endpoint
fix bcrypt version conflict
update scholar model with missing fields
remove dev-login endpoint before deploy
```

### What to put in .gitignore
```
.env
.venv/
__pycache__/
*.pyc
node_modules/
dist/
.DS_Store
```

Note: `uv.lock` should be committed — do not add it to `.gitignore`.

---

## Common errors and fixes

| Error | Cause | Fix |
|---|---|---|
| `ValueError: password cannot be longer than 72 bytes` | bcrypt version mismatch | `uv add "bcrypt==3.2.2" "passlib==1.7.4"` |
| `ImportError: cannot import name 'router'` | File is empty or router variable missing | Check the file has `router = APIRouter(...)` |
| `No 'script_location' key found` | Alembic not finding `alembic.ini` | Run alembic from inside `backend/` folder |
| `could not translate host name` | IPv6 database URL on IPv4 network | Use Supabase session pooler URL instead |
| `One or more mappers failed to initialize` | SQLAlchemy can't find a related model | Import all models in `app/models/__init__.py` |
| `badly formed hexadecimal UUID string` | Empty string passed to `uuid.UUID()` | Wrap in try/except or check `if value and value.strip()` |
| `detail: Not authenticated` | No token sent with request | Add `Authorization: Bearer <token>` header |
| `detail: Scholars only` | Evaluator token used on scholar endpoint | Use a scholar token for that endpoint |
| `detail: Evaluators only` | Scholar token used on evaluator endpoint | Use an evaluator token for that endpoint |
| `uv: command not found` | uv not installed or not in PATH | Re-run the uv install script and restart terminal |
| `No solution found for package` | Conflicting version constraints | Check `pyproject.toml` for conflicting pins and resolve manually |
