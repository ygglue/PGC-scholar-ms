# Graph Report - .  (2026-04-27)

## Corpus Check
- Corpus is ~15,136 words - fits in a single context window. You may not need a graph.

## Summary
- 118 nodes · 163 edges · 24 communities detected
- Extraction: 63% EXTRACTED · 37% INFERRED · 0% AMBIGUOUS · INFERRED: 60 edges (avg confidence: 0.59)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Document Storage & Endpoints|Document Storage & Endpoints]]
- [[_COMMUNITY_Academic Records & Grades|Academic Records & Grades]]
- [[_COMMUNITY_Pending Changes & Auth|Pending Changes & Auth]]
- [[_COMMUNITY_Authentication Security|Authentication Security]]
- [[_COMMUNITY_Scholar Profiles|Scholar Profiles]]
- [[_COMMUNITY_Announcements & Program History|Announcements & Program History]]
- [[_COMMUNITY_Frontend Caching & Views|Frontend Caching & Views]]
- [[_COMMUNITY_Alembic Migrations|Alembic Migrations]]
- [[_COMMUNITY_Document Tests|Document Tests]]
- [[_COMMUNITY_Scholar Tests|Scholar Tests]]
- [[_COMMUNITY_Auth Dependencies|Auth Dependencies]]
- [[_COMMUNITY_Initial DB Schema|Initial DB Schema]]
- [[_COMMUNITY_Backend Entry Point|Backend Entry Point]]
- [[_COMMUNITY_Supabase Upload Tests|Supabase Upload Tests]]
- [[_COMMUNITY_Backend App & Health|Backend App & Health]]
- [[_COMMUNITY_Database Dependency|Database Dependency]]
- [[_COMMUNITY_Frontend App Entry|Frontend App Entry]]
- [[_COMMUNITY_Frontend Layout|Frontend Layout]]
- [[_COMMUNITY_Frontend Inbox|Frontend Inbox]]
- [[_COMMUNITY_Frontend Login|Frontend Login]]
- [[_COMMUNITY_Models Init|Models Init]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Vite Config|Vite Config]]
- [[_COMMUNITY_Frontend Main|Frontend Main]]

## God Nodes (most connected - your core abstractions)
1. `PendingChange` - 14 edges
2. `User` - 14 edges
3. `Scholar` - 12 edges
4. `AcademicRecord` - 9 edges
5. `ProspectusGrade` - 7 edges
6. `GradeInput` - 7 edges
7. `GradeSubmitRequest` - 7 edges
8. `ProspectusGradeResponse` - 7 edges
9. `AcademicRecordResponse` - 7 edges
10. `PendingChangeResponse` - 7 edges

## Surprising Connections (you probably didn't know these)
- `seed()` --calls--> `User`  [INFERRED]
  backend\seed.py → backend\app\models\user.py
- `seed()` --calls--> `Scholar`  [INFERRED]
  backend\seed.py → backend\app\models\scholar.py
- `PendingChangeResponse` --uses--> `AcademicRecord`  [INFERRED]
  backend\app\routers\pending_changes.py → backend\app\models\academic_record.py
- `ReviewRequest` --uses--> `AcademicRecord`  [INFERRED]
  backend\app\routers\pending_changes.py → backend\app\models\academic_record.py
- `PendingChangeResponse` --uses--> `Document`  [INFERRED]
  backend\app\routers\pending_changes.py → backend\app\models\document.py

## Communities

### Community 0 - "Document Storage & Endpoints"
Cohesion: 0.15
Nodes (6): Document, DocumentResponse, upload_document(), view_document_evaluator(), view_document_scholar(), create_signed_url()

### Community 1 - "Academic Records & Grades"
Cohesion: 0.24
Nodes (8): AcademicRecord, AcademicRecordResponse, GradeInput, GradeSubmitRequest, ProspectusGradeResponse, submit_grades(), ProspectusGrade, Scholar

### Community 2 - "Pending Changes & Auth"
Cohesion: 0.24
Nodes (6): DevLoginRequest, GoogleLoginRequest, BaseModel, PendingChangeResponse, ReviewRequest, User

### Community 3 - "Authentication Security"
Cohesion: 0.24
Nodes (8): dev_login(), google_login(), login(), create_access_token(), get_password_hash(), verify_google_token(), verify_password(), seed()

### Community 4 - "Scholar Profiles"
Cohesion: 0.24
Nodes (4): PendingChange, request_profile_update(), ScholarResponse, ScholarUpdate

### Community 5 - "Announcements & Program History"
Cohesion: 0.29
Nodes (4): Announcement, AnnouncementReceipt, Base, ProgramHistory

### Community 6 - "Frontend Caching & Views"
Cohesion: 0.29
Nodes (3): Dashboard(), Profile(), useApiCache()

### Community 7 - "Alembic Migrations"
Cohesion: 0.4
Nodes (4): Run migrations in 'offline' mode.      This configures the context with just a U, Run migrations in 'online' mode.      In this scenario we need to create an Engi, run_migrations_offline(), run_migrations_online()

### Community 8 - "Document Tests"
Cohesion: 0.83
Nodes (3): get_evaluator_token(), get_scholar_token(), start_tests()

### Community 9 - "Scholar Tests"
Cohesion: 0.83
Nodes (3): get_evaluator_token(), get_scholar_token(), start_tests()

### Community 10 - "Auth Dependencies"
Cohesion: 0.5
Nodes (0): 

### Community 11 - "Initial DB Schema"
Cohesion: 0.5
Nodes (1): initial schema  Revision ID: 3b9970469f0e Revises:  Create Date: 2026-04-13 04:5

### Community 12 - "Backend Entry Point"
Cohesion: 0.67
Nodes (1): main()

### Community 13 - "Supabase Upload Tests"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Backend App & Health"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Database Dependency"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Frontend App Entry"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Frontend Layout"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Frontend Inbox"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Frontend Login"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Models Init"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "ESLint Config"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Vite Config"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Frontend Main"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **3 isolated node(s):** `Run migrations in 'offline' mode.      This configures the context with just a U`, `Run migrations in 'online' mode.      In this scenario we need to create an Engi`, `initial schema  Revision ID: 3b9970469f0e Revises:  Create Date: 2026-04-13 04:5`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Supabase Upload Tests`** (2 nodes): `test_supabase_direct.py`, `test_upload()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backend App & Health`** (2 nodes): `main.py`, `health_check()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Database Dependency`** (2 nodes): `database.py`, `get_db()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend App Entry`** (2 nodes): `App()`, `App.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Layout`** (2 nodes): `Layout()`, `Layout.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Inbox`** (2 nodes): `Inbox()`, `Inbox.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Login`** (2 nodes): `Login()`, `Login.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Models Init`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ESLint Config`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vite Config`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Frontend Main`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `Pending Changes & Auth` to `Document Storage & Endpoints`, `Academic Records & Grades`, `Authentication Security`, `Scholar Profiles`, `Announcements & Program History`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Why does `DocumentResponse` connect `Document Storage & Endpoints` to `Academic Records & Grades`, `Pending Changes & Auth`, `Scholar Profiles`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Why does `PendingChange` connect `Scholar Profiles` to `Document Storage & Endpoints`, `Academic Records & Grades`, `Pending Changes & Auth`, `Announcements & Program History`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `PendingChange` (e.g. with `GradeInput` and `GradeSubmitRequest`) actually correct?**
  _`PendingChange` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `User` (e.g. with `GradeInput` and `GradeSubmitRequest`) actually correct?**
  _`User` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 10 inferred relationships involving `Scholar` (e.g. with `GradeInput` and `GradeSubmitRequest`) actually correct?**
  _`Scholar` has 10 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `AcademicRecord` (e.g. with `GradeInput` and `GradeSubmitRequest`) actually correct?**
  _`AcademicRecord` has 7 INFERRED edges - model-reasoned connections that need verification._