# Scholar Management System — API Endpoints

**Base URL (development):** `http://localhost:8000`  
**Base URL (production):** `https://your-deployed-api.com`  
**Authentication:** Bearer JWT token in `Authorization` header  
**Format:** All requests and responses are JSON unless noted

---

## Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Evaluator login (email + password) |
| POST | `/auth/google` | Public | Scholar login (Google ID token) |
| POST | `/auth/dev-login` | Dev only | Bypass login for testing — remove in production |

### POST `/auth/login`
```
Body (form-data):
  username: string   (evaluator email)
  password: string

Response:
  { "access_token": "eyJ...", "token_type": "bearer" }
```

### POST `/auth/google`
```
Body:
  { "token": "google-id-token-string" }

Response:
  { "access_token": "eyJ...", "token_type": "bearer" }

Errors:
  401 — Invalid Google token
  403 — Not a registered scholar
```

---

## Scholars

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/scholars/me` | Scholar | Get own profile |
| POST | `/scholars/me/update` | Scholar | Submit profile update for approval |
| GET | `/scholars/` | Evaluator | List and filter all scholars |
| GET | `/scholars/{scholar_id}` | Evaluator | Get a specific scholar's profile |
| PATCH | `/scholars/{scholar_id}` | Evaluator | Directly edit a scholar's profile |

### GET `/scholars/me`
```
Response: Scholar object
```

### POST `/scholars/me/update`
```
Body:
  {
    "first_name": "string",
    "last_name": "string",
    "middle_name": "string",
    "date_of_birth": "YYYY-MM-DD",
    "place_of_birth": "string",
    "sex": "string",
    "civil_status": "string",
    "religion": "string",
    "address": "string",
    "contact_number": "string",
    "batch_number": "string",
    "year_level": "string",
    "course": "string",
    "school": "string",
    "student_type": "regular | irregular"
  }
  (all fields optional — only changed fields needed)

Response:
  { "message": "Profile update submitted for review", "changes": { ... } }

Errors:
  400 — No changes detected
  409 — Already has a pending profile update
```

### GET `/scholars/`
```
Query params (all optional):
  batch         string
  school        string
  course        string
  status        active | inactive | graduate
  student_type  regular | irregular
  search        string (searches first + last name)

Response: Array of Scholar objects
```

### PATCH `/scholars/{scholar_id}`
```
Body: Same as POST /scholars/me/update
Response: { "message": "Scholar profile updated" }
```

---

## Academic Records

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/academic-records/me` | Scholar | Get own academic records |
| POST | `/academic-records/me/submit` | Scholar | Submit grades for a semester |
| GET | `/academic-records/scholar/{scholar_id}` | Evaluator | Get a scholar's records |
| GET | `/academic-records/{record_id}/grades` | Evaluator | Get grades for a specific record |

### GET `/academic-records/me`
```
Response: Array of AcademicRecord objects ordered by school_year, semester
```

### POST `/academic-records/me/submit`
```
Body:
  {
    "school_year": "2024-2025",
    "semester": "1st | 2nd | summer",
    "student_type": "regular | irregular",
    "remarks_status": "complete | unposted | INC | failed",
    "unposted_count": "0",
    "inc_count": "0",
    "failed_count": "0",
    "grades": [
      {
        "subject_code": "CS101",
        "subject_name": "Data Structures",
        "units": 3.0,
        "grade": "1.5",
        "status": "passed | failed | INC | unposted"
      }
    ]
  }

Response:
  { "message": "Grades submitted for review", "record_id": "uuid" }

Errors:
  409 — Already has a pending submission for this semester
```

---

## Documents

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/documents/upload` | Scholar | Upload a document |
| GET | `/documents/me` | Scholar | Get own documents |
| GET | `/documents/{document_id}/view` | Scholar | Get signed URL (own files only) |
| GET | `/documents/{document_id}/view-evaluator` | Evaluator | Get signed URL for any document |
| PATCH | `/documents/{document_id}/verify` | Evaluator | Mark document as verified |
| GET | `/documents/scholar/{scholar_id}` | Evaluator | Get all documents for a scholar |

### POST `/documents/upload`
```
Body (multipart/form-data):
  file               File      JPEG, PNG, or PDF — max 10MB
  doc_type           string    COR | ROG | explanation_letter | completion_form | other
  academic_record_id string    UUID (optional) — links document to a semester

Response:
  { "message": "Document uploaded successfully", "document_id": "uuid", "file_name": "string" }

Errors:
  400 — Invalid doc type
  400 — Invalid file type (only JPEG, PNG, PDF allowed)
  400 — File too large (max 10MB)
  500 — Upload to Supabase Storage failed
```

### GET `/documents/{document_id}/view`
```
Response:
  { "url": "https://signed-url...", "expires_in": 120, "file_name": "string" }

Errors:
  403 — Document does not belong to this scholar
```

---

## Pending Changes

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/pending-changes/` | Evaluator | List submissions in the queue |
| POST | `/pending-changes/{change_id}/claim` | Evaluator | Claim a submission before reviewing |
| POST | `/pending-changes/{change_id}/review` | Evaluator | Approve, reject, or request more info |

### GET `/pending-changes/`
```
Query params (all optional):
  status       pending | approved | rejected | more_info  (default: pending)
  change_type  profile | grades | documents

Response: Array of PendingChange objects ordered by submitted_at
```

### POST `/pending-changes/{change_id}/claim`
```
Response:
  { "claimed": true }

Errors:
  400 — Submission is no longer pending
  409 — Being reviewed by another evaluator (claim active < 30 min)
```

### POST `/pending-changes/{change_id}/review`
```
Body:
  {
    "status": "approved | rejected | more_info",
    "evaluator_note": "string (optional)"
  }

Response:
  { "message": "Submission approved | rejected | more_info" }

Errors:
  400 — Invalid status
  400 — Submission already reviewed
```

---

## Announcements

> Phase 6 — not yet implemented

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/announcements/` | Evaluator | Create and send an announcement |
| GET | `/announcements/` | Evaluator | List all announcements |
| GET | `/announcements/me` | Scholar | Get announcements for this scholar |
| PATCH | `/announcements/receipts/{receipt_id}/read` | Scholar | Mark announcement as read |

### POST `/announcements/`
```
Body:
  {
    "title": "string",
    "message": "string",
    "type": "general | reminder | warning | deadline",
    "recipient_filter": {
      "batch": "Batch 5",
      "school": "UST",
      "status": "active"
    },
    "scheduled_at": "2025-08-01T09:00:00Z"
  }
  (recipient_filter and scheduled_at are optional — null = all scholars, send immediately)
```

---

## Allowance (Phase 6)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/allowance/me` | Scholar | View own allowance history |
| POST | `/allowance/` | Evaluator | Add an allowance record |
| GET | `/allowance/scholar/{scholar_id}` | Evaluator | View a scholar's allowance history |
| PATCH | `/allowance/{record_id}` | Evaluator | Edit an allowance record |

---

## CSR Events (Phase 6)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/csr/events` | Scholar | View CSR events attended |
| POST | `/csr/events` | Evaluator | Create a CSR event |
| POST | `/csr/events/{event_id}/attendance` | Evaluator | Mark attendance for scholars |
| GET | `/csr/events/{event_id}/attendance` | Evaluator | View attendance for an event |

---

## Reports (Phase 5)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/reports/active` | Evaluator | Active scholars by school and batch |
| GET | `/reports/inactive` | Evaluator | Inactive scholars by school and batch |
| GET | `/reports/graduates` | Evaluator | Graduate scholars by school and batch |
| GET | `/reports/extended` | Evaluator | Extended active scholars |
| GET | `/reports/latin-honors` | Evaluator | Latin honors by school and batch |
| GET | `/reports/postgrad-employed` | Evaluator | Scholars employed at PPS |
| GET | `/reports/board-passers` | Evaluator | Licensure passers per profession |

### Common query params for all report endpoints
```
batch       string
school      string
course      string
status      string
format      json | xlsx | pdf   (default: json)
```

---

## Post-Graduation (Phase 6)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/postgrad/{scholar_id}` | Evaluator | Get post-grad data for a scholar |
| PUT | `/postgrad/{scholar_id}` | Evaluator | Update post-grad data |

### PUT `/postgrad/{scholar_id}`
```
Body:
  {
    "employed_at_pps": true,
    "board_passer": true,
    "board_exam_date": "2025-06-15",
    "profession": "Registered Nurse"
  }
```

---

## Health

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/health` | Public | Check if the server is running |

```
Response: { "status": "ok" }
```

---

## HTTP status codes used

| Code | Meaning |
|---|---|
| 200 | Success |
| 400 | Bad request — invalid input |
| 401 | Unauthorized — missing or invalid token |
| 403 | Forbidden — valid token but wrong role |
| 404 | Not found |
| 409 | Conflict — e.g. duplicate pending change, claimed submission |
| 500 | Internal server error — check server logs |

---

## Notes

- All UUIDs are v4 formatted as strings: `"550e8400-e29b-41d4-a716-446655440000"`
- All timestamps are ISO 8601 UTC: `"2025-04-13T08:30:00Z"`
- Endpoints marked **Phase 5** and **Phase 6** are planned but not yet built
- The `/auth/dev-login` endpoint must be removed before deploying to production
- Signed URLs from `/documents/*/view` expire in 120 seconds — do not cache them
