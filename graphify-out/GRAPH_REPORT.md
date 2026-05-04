# Graph Report - C:\Users\Eli\Documents\coding_projects\scholar-ms  (2026-05-05)

## Corpus Check
- 88 files · ~78,764 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 454 nodes · 856 edges · 49 communities detected
- Extraction: 63% EXTRACTED · 37% INFERRED · 0% AMBIGUOUS · INFERRED: 318 edges (avg confidence: 0.7)
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
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]

## God Nodes (most connected - your core abstractions)
1. `User` - 30 edges
2. `MainWindow` - 25 edges
3. `Scholar` - 23 edges
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
- `User` --uses--> `Set httpOnly cookie with the access token.`  [INFERRED]
  C:\Users\Eli\Documents\coding_projects\scholar-ms\backend\app\models\user.py → C:\Users\Eli\Documents\coding_projects\scholar-ms\backend\app\routers\auth.py
- `seed()` --calls--> `User`  [INFERRED]
  C:\Users\Eli\Documents\coding_projects\scholar-ms\backend\seed.py → C:\Users\Eli\Documents\coding_projects\scholar-ms\backend\app\models\user.py
- `seed()` --calls--> `Scholar`  [INFERRED]
  C:\Users\Eli\Documents\coding_projects\scholar-ms\backend\seed.py → C:\Users\Eli\Documents\coding_projects\scholar-ms\backend\app\models\scholar.py
- `seed_fake_scholars()` --calls--> `User`  [INFERRED]
  C:\Users\Eli\Documents\coding_projects\scholar-ms\backend\seed.py → C:\Users\Eli\Documents\coding_projects\scholar-ms\backend\app\models\user.py

## Communities

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (49): AcademicRecord, AcademicRecordResponse, GradeInput, GradeSubmitRequest, ProspectusGradeResponse, submit_grades(), Announcement, AnnouncementReceipt (+41 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (20): clear_auth_token(), _get_machine_id(), load_auth_token(), save_auth_token(), _simple_decrypt(), _simple_encrypt(), create_ambient_shadow(), DashboardView (+12 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (13): Layout(), QWidget, create_ambient_shadow(), FetchScholarDocsThread, get_avatar_color(), get_initials(), PaginationControl, Generate initials: Juan + Dela Cruz -> "JDC" (+5 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (10): handleView(), loadDocuments(), CacheService, get_cache_service(), Loads existing list, replaces/adds items from new_items, and saves.         Use, Returns the latest 'updated_at' timestamp from the cached list., loadPendingChanges(), loadScholars() (+2 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (8): BinDocumentsView, create_ambient_shadow(), DownloadDocThread, FetchBinDocsThread, ViewDocThread, QFrame, QThread, FetchScholarsThread

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (16): dev_login(), google_login(), login(), Set httpOnly cookie with the access token., _set_token_cookie(), get_db(), create_access_token(), get_password_hash() (+8 more)

### Community 6 - "Community 6"
Cohesion: 0.19
Nodes (5): QDialog, create_ambient_shadow(), CreateBinDialog, FetchBinsThread, SubmissionBinsView

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (2): NetworkStatusService, SyncService

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (7): run(), main(), init(), toggleView(), getViewPreference(), saveCacheDir(), saveViewPreference()

### Community 9 - "Community 9"
Cohesion: 0.15
Nodes (9): App(), async(), getUserIdFromToken(), handleReview(), handleViewDocument(), initUser(), getToken(), removeToken() (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.2
Nodes (4): getAvatarColor(), Dashboard(), Profile(), useApiCache()

### Community 11 - "Community 11"
Cohesion: 0.25
Nodes (4): remove_scholar_avatar(), upload_scholar_avatar(), delete_avatar(), upload_avatar()

### Community 12 - "Community 12"
Cohesion: 0.38
Nodes (4): get_current_user(), get_current_user_from_request(), get_token_from_request(), Extract token from Authorization header or cookie.

### Community 13 - "Community 13"
Cohesion: 0.4
Nodes (4): Run migrations in 'offline' mode.      This configures the context with just a U, Run migrations in 'online' mode.      In this scenario we need to create an Engi, run_migrations_offline(), run_migrations_online()

### Community 14 - "Community 14"
Cohesion: 0.5
Nodes (3): QMainWindow, create_ambient_shadow(), MainWindow

### Community 15 - "Community 15"
Cohesion: 0.83
Nodes (3): get_evaluator_token(), get_scholar_token(), start_tests()

### Community 16 - "Community 16"
Cohesion: 0.83
Nodes (3): get_evaluator_token(), get_scholar_token(), start_tests()

### Community 17 - "Community 17"
Cohesion: 0.5
Nodes (1): initial schema  Revision ID: 3b9970469f0e Revises:  Create Date: 2026-04-13 04:5

### Community 18 - "Community 18"
Cohesion: 0.5
Nodes (1): add_submission_bins  Revision ID: 5ee10ec12f32 Revises: ab66dfea0e7a Create Date

### Community 19 - "Community 19"
Cohesion: 0.5
Nodes (1): add_avatar_url_to_scholars  Revision ID: ab66dfea0e7a Revises: 3b9970469f0e Crea

### Community 20 - "Community 20"
Cohesion: 0.5
Nodes (1): add_is_approved_to_submission_bins  Revision ID: cd81366cd8dd Revises: 5ee10ec12

### Community 21 - "Community 21"
Cohesion: 0.5
Nodes (1): add_updated_at_and_system_sync  Revision ID: eeb1e72caa3a Revises: cd81366cd8dd

### Community 22 - "Community 22"
Cohesion: 0.67
Nodes (2): createAnnouncement(), loadAnnouncements()

### Community 23 - "Community 23"
Cohesion: 0.67
Nodes (1): Login()

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
Nodes (0): 

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (1): Generate initials: Juan + Dela Cruz -> "JDC"

### Community 47 - "Community 47"
Cohesion: 1.0
Nodes (1): Generate consistent color from name hash

### Community 48 - "Community 48"
Cohesion: 1.0
Nodes (1): # TODO: Implement actual API call via requests

## Knowledge Gaps
- **15 isolated node(s):** `Create a new announcement (requires auth)`, `Run migrations in 'offline' mode.      This configures the context with just a U`, `Run migrations in 'online' mode.      In this scenario we need to create an Engi`, `initial schema  Revision ID: 3b9970469f0e Revises:  Create Date: 2026-04-13 04:5`, `add_submission_bins  Revision ID: 5ee10ec12f32 Revises: ab66dfea0e7a Create Date` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 24`** (2 nodes): `test_supabase_direct.py`, `test_upload()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (2 nodes): `main.py`, `health_check()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (2 nodes): `sync.py`, `get_last_changed()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (2 nodes): `Settings.tsx`, `Settings()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (2 nodes): `Modal.tsx`, `getTypeStyles()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (2 nodes): `ViewLayout.tsx`, `ViewLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (2 nodes): `main()`, `build.rs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (2 nodes): `Inbox.jsx`, `Inbox()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `postcss.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (1 nodes): `tailwind.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `main.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `vite-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `apiService.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `cacheService.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `documentService.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (1 nodes): `api.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (1 nodes): `Generate initials: Juan + Dela Cruz -> "JDC"`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (1 nodes): `Generate consistent color from name hash`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (1 nodes): `# TODO: Implement actual API call via requests`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `Community 0` to `Community 12`, `Community 5`?**
  _High betweenness centrality (0.169) - this node is a cross-community bridge._
- **Why does `get_token_from_request()` connect `Community 12` to `Community 3`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **Why does `Extract token from Authorization header or cookie.` connect `Community 12` to `Community 0`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **Are the 28 inferred relationships involving `User` (e.g. with `Creates fake scholars for testing purposes.` and `Deletes all fake scholars by email pattern.`) actually correct?**
  _`User` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `MainWindow` (e.g. with `LoginView` and `DashboardView`) actually correct?**
  _`MainWindow` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 21 inferred relationships involving `Scholar` (e.g. with `Creates fake scholars for testing purposes.` and `Deletes all fake scholars by email pattern.`) actually correct?**
  _`Scholar` has 21 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `ScholarsDirectoryView` (e.g. with `MainWindow` and `EvaluatorApp`) actually correct?**
  _`ScholarsDirectoryView` has 3 INFERRED edges - model-reasoned connections that need verification._