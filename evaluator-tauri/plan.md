# Migration Plan: Evaluator App (PySide6 to Tauri)

## Objective
Migrate the existing desktop Evaluator App from PySide6 to a modern Tauri application with a React-based frontend, leveraging the existing FastAPI backend API.

## Scope & Impact
- **Frontend:** Completely replace PySide6 views with React (Vite).
- **Backend Communication:** Convert `requests` calls to `axios`/`fetch` using the existing API endpoints.
- **Data Persistence:** Re-implement caching logic (currently in `services/cache_service.py`) for the frontend.
- **UI/UX:** Modernize layouts, leveraging the provided **PalawanPay Design System** (`frontend_templates/palawanpay-design-system.html`).

## Phased Implementation Plan

### Phase 1: Setup & Environment
- [ ] Initialize/Refine Tauri project in `evaluator-tauri/`.
- [ ] Install and configure Tailwind CSS & design system tokens.
- [ ] Setup `axios` base client pointing to the backend.

### Phase 2: Core Service Migration
- [ ] Port `cache_service.py` logic to frontend storage (e.g., `localStorage`/`IndexedDB`).
- [ ] Port `network_status.py` to frontend events.
- [ ] Port `sync_service.py` to handle background data sync.

### Phase 3: View Migration (Iterative)
- [ ] **Auth:** Port `views/login.py` to `Login.jsx` (PalawanPay styling).
- [ ] **Dashboard:** Port `views/dashboard.py` to `Dashboard.jsx`.
- [ ] **Scholars:** Port `views/scholars_directory.py` to `ScholarsDirectory.jsx`.
- [ ] **Submissions:** Port `views/submission_bins.py` and `bin_documents.py` to `SubmissionBins.jsx` and `BinDocuments.jsx`.

### Phase 4: Integration & Testing
- [ ] Implement desktop-specific features (file system access via Tauri).
- [ ] Perform E2E tests against the backend API.
- [ ] Build production executable (.exe).

## Verification
- [ ] Validate feature parity between PySide6 and Tauri.
- [ ] Validate API integration and offline behavior.
- [ ] QA against design system specs.

## Rollback
- Maintain `evaluator-app/` until the Tauri version is fully operational.
