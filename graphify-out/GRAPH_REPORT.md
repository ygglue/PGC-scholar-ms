# Graph Report - C:\Users\Eli\Documents\coding_projects\scholar-ms  (2026-04-27)

## Corpus Check
- 43 files · ~32,787 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 140 nodes · 188 edges · 28 communities detected
- Extraction: 65% EXTRACTED · 35% INFERRED · 0% AMBIGUOUS · INFERRED: 66 edges (avg confidence: 0.6)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]

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
- `PendingChange` --calls--> `request_profile_update()`  [INFERRED]
  backend\app\models\pending_change.py → backend\app\routers\scholars.py
- `seed()` --calls--> `User`  [INFERRED]
  backend\seed.py → backend\app\models\user.py
- `seed()` --calls--> `Scholar`  [INFERRED]
  backend\seed.py → backend\app\models\scholar.py
- `User` --uses--> `GoogleLoginRequest`  [INFERRED]
  backend\app\models\user.py → backend\app\routers\auth.py
- `User` --uses--> `DevLoginRequest`  [INFERRED]
  backend\app\models\user.py → backend\app\routers\auth.py

## Communities

### Community 0 - "Community 0"
Cohesion: 0.18
Nodes (19): AcademicRecord, AcademicRecordResponse, GradeInput, GradeSubmitRequest, ProspectusGradeResponse, submit_grades(), Base, BaseModel (+11 more)

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (9): DashboardView, LoginView, # TODO: Implement actual API call via requests, EvaluatorApp, QApplication, QMainWindow, QWidget, create_ambient_shadow() (+1 more)

### Community 2 - "Community 2"
Cohesion: 0.21
Nodes (10): dev_login(), DevLoginRequest, google_login(), GoogleLoginRequest, login(), create_access_token(), get_password_hash(), verify_google_token() (+2 more)

### Community 3 - "Community 3"
Cohesion: 0.2
Nodes (3): view_document_evaluator(), view_document_scholar(), create_signed_url()

### Community 4 - "Community 4"
Cohesion: 0.29
Nodes (3): Dashboard(), Profile(), useApiCache()

### Community 5 - "Community 5"
Cohesion: 0.33
Nodes (1): request_profile_update()

### Community 6 - "Community 6"
Cohesion: 0.4
Nodes (4): Run migrations in 'offline' mode.      This configures the context with just a U, Run migrations in 'online' mode.      In this scenario we need to create an Engi, run_migrations_offline(), run_migrations_online()

### Community 7 - "Community 7"
Cohesion: 0.83
Nodes (3): get_evaluator_token(), get_scholar_token(), start_tests()

### Community 8 - "Community 8"
Cohesion: 0.83
Nodes (3): get_evaluator_token(), get_scholar_token(), start_tests()

### Community 9 - "Community 9"
Cohesion: 0.5
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 0.5
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 0.5
Nodes (1): initial schema  Revision ID: 3b9970469f0e Revises:  Create Date: 2026-04-13 04:5

### Community 12 - "Community 12"
Cohesion: 0.67
Nodes (1): main()

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (1): Announcement

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (1): AnnouncementReceipt

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (1): ProgramHistory

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **4 isolated node(s):** `Run migrations in 'offline' mode.      This configures the context with just a U`, `Run migrations in 'online' mode.      In this scenario we need to create an Engi`, `initial schema  Revision ID: 3b9970469f0e Revises:  Create Date: 2026-04-13 04:5`, `# TODO: Implement actual API call via requests`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 13`** (2 nodes): `test_supabase_direct.py`, `test_upload()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (2 nodes): `main.py`, `health_check()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (2 nodes): `database.py`, `get_db()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (2 nodes): `Announcement`, `announcement.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (2 nodes): `AnnouncementReceipt`, `announcement_receipt.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (2 nodes): `program_history.py`, `ProgramHistory`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (2 nodes): `App()`, `App.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (2 nodes): `Layout()`, `Layout.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (2 nodes): `Inbox()`, `Inbox.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (2 nodes): `Login()`, `Login.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `Community 0` to `Community 2`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `DocumentResponse` connect `Community 0` to `Community 3`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `PendingChange` connect `Community 0` to `Community 5`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `PendingChange` (e.g. with `submit_grades()` and `upload_document()`) actually correct?**
  _`PendingChange` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `User` (e.g. with `seed()` and `GradeInput`) actually correct?**
  _`User` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 10 inferred relationships involving `Scholar` (e.g. with `seed()` and `GradeInput`) actually correct?**
  _`Scholar` has 10 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `AcademicRecord` (e.g. with `submit_grades()` and `GradeInput`) actually correct?**
  _`AcademicRecord` has 7 INFERRED edges - model-reasoned connections that need verification._