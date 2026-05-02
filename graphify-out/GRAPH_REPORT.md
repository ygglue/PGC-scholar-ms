# Graph Report - C:\Users\Eli\Documents\coding_projects\scholar-ms  (2026-05-03)

## Corpus Check
- 63 files · ~64,556 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 382 nodes · 757 edges · 35 communities detected
- Extraction: 64% EXTRACTED · 36% INFERRED · 0% AMBIGUOUS · INFERRED: 276 edges (avg confidence: 0.69)
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
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]

## God Nodes (most connected - your core abstractions)
1. `User` - 30 edges
2. `MainWindow` - 25 edges
3. `Scholar` - 21 edges
4. `ScholarsDirectoryView` - 21 edges
5. `PendingChange` - 18 edges
6. `CacheService` - 18 edges
7. `SubmissionBinsView` - 16 edges
8. `get_cache_service()` - 15 edges
9. `BinDocumentsView` - 15 edges
10. `Document` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Extract token from Authorization header or cookie.` --uses--> `User`  [INFERRED]
  C:\Users\Eli\Documents\coding_projects\scholar-ms\backend\app\core\dependencies.py → C:\Users\Eli\Documents\coding_projects\scholar-ms\backend\app\models\user.py
- `PendingChange` --calls--> `request_profile_update()`  [INFERRED]
  C:\Users\Eli\Documents\coding_projects\scholar-ms\backend\app\models\pending_change.py → C:\Users\Eli\Documents\coding_projects\scholar-ms\backend\app\routers\scholars.py
- `User` --uses--> `Set httpOnly cookie with the access token.`  [INFERRED]
  C:\Users\Eli\Documents\coding_projects\scholar-ms\backend\app\models\user.py → C:\Users\Eli\Documents\coding_projects\scholar-ms\backend\app\routers\auth.py
- `Scholar` --uses--> `Creates fake scholars for testing purposes.`  [INFERRED]
  C:\Users\Eli\Documents\coding_projects\scholar-ms\backend\app\models\scholar.py → C:\Users\Eli\Documents\coding_projects\scholar-ms\backend\seed.py
- `Scholar` --uses--> `Deletes all fake scholars by email pattern.`  [INFERRED]
  C:\Users\Eli\Documents\coding_projects\scholar-ms\backend\app\models\scholar.py → C:\Users\Eli\Documents\coding_projects\scholar-ms\backend\seed.py

## Communities

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (44): AcademicRecord, AcademicRecordResponse, GradeInput, GradeSubmitRequest, ProspectusGradeResponse, submit_grades(), AnnouncementReceipt, DevLoginRequest (+36 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (17): clear_auth_token(), _get_machine_id(), load_auth_token(), save_auth_token(), _simple_decrypt(), _simple_encrypt(), create_ambient_shadow(), DashboardView (+9 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (16): QFrame, QMainWindow, QWidget, create_ambient_shadow(), FetchScholarDocsThread, FetchScholarsThread, get_avatar_color(), get_initials() (+8 more)

### Community 3 - "Community 3"
Cohesion: 0.12
Nodes (8): CacheService, Loads existing list, replaces/adds items from new_items, and saves.         Use, Returns the latest 'updated_at' timestamp from the cached list., get_current_user(), get_current_user_from_request(), get_token_from_request(), Extract token from Authorization header or cookie., review_change()

### Community 4 - "Community 4"
Cohesion: 0.09
Nodes (9): get_bin_documents(), view_document_evaluator(), view_document_scholar(), remove_scholar_avatar(), request_profile_update(), upload_scholar_avatar(), create_signed_url(), delete_avatar() (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.16
Nodes (6): BinDocumentsView, create_ambient_shadow(), DownloadDocThread, FetchBinDocsThread, ViewDocThread, QThread

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (6): get_cache_service(), QDialog, create_ambient_shadow(), CreateBinDialog, FetchBinsThread, SubmissionBinsView

### Community 7 - "Community 7"
Cohesion: 0.16
Nodes (6): getAvatarColor(), Dashboard(), Layout(), Profile(), ScholarDetailPanel, useApiCache()

### Community 8 - "Community 8"
Cohesion: 0.31
Nodes (8): dev_login(), google_login(), login(), Set httpOnly cookie with the access token., _set_token_cookie(), create_access_token(), verify_google_token(), verify_password()

### Community 9 - "Community 9"
Cohesion: 0.32
Nodes (6): Announcement, create_announcement(), CreateAnnouncementRequest, get_announcements(), Create a new announcement (requires auth), Get announcements for the current scholar.     Returns announcements filtered by

### Community 10 - "Community 10"
Cohesion: 0.32
Nodes (4): QObject, get_sync_service(), SyncService, SyncWorker

### Community 11 - "Community 11"
Cohesion: 0.4
Nodes (4): Run migrations in 'offline' mode.      This configures the context with just a U, Run migrations in 'online' mode.      In this scenario we need to create an Engi, run_migrations_offline(), run_migrations_online()

### Community 12 - "Community 12"
Cohesion: 0.83
Nodes (3): get_evaluator_token(), get_scholar_token(), start_tests()

### Community 13 - "Community 13"
Cohesion: 0.83
Nodes (3): get_evaluator_token(), get_scholar_token(), start_tests()

### Community 14 - "Community 14"
Cohesion: 0.5
Nodes (1): initial schema  Revision ID: 3b9970469f0e Revises:  Create Date: 2026-04-13 04:5

### Community 15 - "Community 15"
Cohesion: 0.5
Nodes (1): add_submission_bins  Revision ID: 5ee10ec12f32 Revises: ab66dfea0e7a Create Date

### Community 16 - "Community 16"
Cohesion: 0.5
Nodes (1): add_avatar_url_to_scholars  Revision ID: ab66dfea0e7a Revises: 3b9970469f0e Crea

### Community 17 - "Community 17"
Cohesion: 0.5
Nodes (1): add_is_approved_to_submission_bins  Revision ID: cd81366cd8dd Revises: 5ee10ec12

### Community 18 - "Community 18"
Cohesion: 0.5
Nodes (1): add_updated_at_and_system_sync  Revision ID: eeb1e72caa3a Revises: cd81366cd8dd

### Community 19 - "Community 19"
Cohesion: 0.67
Nodes (1): main()

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

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (1): Generate initials: Juan + Dela Cruz -> "JDC"

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (1): Generate consistent color from name hash

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (1): # TODO: Implement actual API call via requests

## Knowledge Gaps
- **15 isolated node(s):** `Create a new announcement (requires auth)`, `Run migrations in 'offline' mode.      This configures the context with just a U`, `Run migrations in 'online' mode.      In this scenario we need to create an Engi`, `initial schema  Revision ID: 3b9970469f0e Revises:  Create Date: 2026-04-13 04:5`, `add_submission_bins  Revision ID: 5ee10ec12f32 Revises: ab66dfea0e7a Create Date` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 20`** (2 nodes): `test_supabase_direct.py`, `test_upload()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (2 nodes): `main.py`, `health_check()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (2 nodes): `sync.py`, `get_last_changed()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (2 nodes): `App()`, `App.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (2 nodes): `Inbox.jsx`, `Inbox()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (2 nodes): `Login.jsx`, `Login()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `api.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `Generate initials: Juan + Dela Cruz -> "JDC"`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `Generate consistent color from name hash`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `# TODO: Implement actual API call via requests`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `Community 0` to `Community 8`, `Community 9`, `Community 3`?**
  _High betweenness centrality (0.195) - this node is a cross-community bridge._
- **Why does `LoginView` connect `Community 1` to `Community 2`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `User` (e.g. with `Creates fake scholars for testing purposes.` and `Deletes all fake scholars by email pattern.`) actually correct?**
  _`User` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `MainWindow` (e.g. with `LoginView` and `DashboardView`) actually correct?**
  _`MainWindow` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 19 inferred relationships involving `Scholar` (e.g. with `Creates fake scholars for testing purposes.` and `Deletes all fake scholars by email pattern.`) actually correct?**
  _`Scholar` has 19 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `ScholarsDirectoryView` (e.g. with `MainWindow` and `EvaluatorApp`) actually correct?**
  _`ScholarsDirectoryView` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 16 inferred relationships involving `PendingChange` (e.g. with `Updates the global last_updated_at timestamp in the system_sync table.     We u` and `GradeInput`) actually correct?**
  _`PendingChange` has 16 INFERRED edges - model-reasoned connections that need verification._