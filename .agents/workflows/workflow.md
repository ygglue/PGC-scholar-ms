# Scholar Management System — Workflow

This document describes every user-facing workflow in the system from start to finish.

---

## 1. Scholar onboarding

A new scholar is added to the system by an evaluator or admin — scholars cannot self-register.

1. Evaluator creates a `User` record with `role = scholar` and the scholar's institutional or personal email
2. Evaluator creates a linked `Scholar` record with the scholar's batch, course, school, and basic personal info
3. A `ProgramHistory` row is inserted for the scholar's initial program with `start_date = date_enrolled` and `end_date = null`
4. Scholar receives their email and logs in via Google OAuth on the web app
5. Google verifies their identity and returns their email to the backend
6. Backend checks the email against the `users` table — if found and `role = scholar`, a JWT is issued
7. Scholar lands on their dashboard

---

## 2. Scholar profile update

Scholars cannot directly edit their own records. All changes go through an approval queue.

1. Scholar navigates to **My Profile** and edits one or more fields
2. Before submitting, a confirmation prompt appears: "Are you sure you want to submit these changes for review?"
3. Scholar confirms — backend checks for an existing `pending` profile change for this scholar
4. If one exists, submission is blocked: "You already have a pending profile update"
5. If none exists, a `PendingChange` row is created with `change_type = profile` and a JSON diff payload showing before/after values
6. Evaluator sees the submission in their review queue
7. Evaluator approves → backend applies the diff to the `scholars` table and marks the change as `approved`
8. Evaluator rejects or requests more info → `evaluator_note` is attached and scholar is notified
9. If rejected or more info requested, scholar revises and resubmits — cycle repeats

---

## 3. Grade submission

1. Scholar navigates to **My Grades** and selects or creates a semester (school year + semester)
2. Scholar enters subjects one by one: subject code, subject name, units, grade, status
3. Scholar selects the overall semester remarks status: `complete`, `unposted` (max 2), `INC` (max 1), or `failed` (max 1)
4. Scholar uploads required documents for the semester (see Document Upload workflow below)
5. Scholar reviews everything and confirms submission
6. Backend creates an `AcademicRecord` row with `submission_status = pending` and `ProspectusGrade` rows for each subject
7. A `PendingChange` row is also created with `change_type = grades` pointing to the record
8. Evaluator opens the submission in the review queue, checks grades and documents
9. Evaluator approves → `AcademicRecord.submission_status` is set to `approved`
10. Evaluator rejects or requests more info → scholar is notified with a remark

---

## 4. Document upload

Documents are uploaded to Supabase Storage in a private bucket. They are never publicly accessible.

1. Scholar selects a file (JPEG, PNG, or PDF, max 10MB)
2. Scholar selects the document type: `COR`, `ROG`, `explanation_letter`, `completion_form`, or `other`
3. Scholar optionally links the document to a specific semester (academic record)
4. Backend validates file type and size
5. File is uploaded to Supabase Storage at path: `scholars/{scholar_id}/{doc_type}/{uuid}_{filename}`
6. A `Document` row is saved with the `storage_path` — never a public URL
7. A `PendingChange` row is created with `change_type = documents`
8. To view a document, the backend generates a signed URL expiring in 120 seconds
9. Only the scholar who owns the file or an evaluator can request a signed URL

---

## 5. Evaluator review queue

The primary daily workflow for evaluators.

1. Evaluator opens the review queue — sees all `pending` submissions ordered by submission date
2. Evaluator can filter by `change_type` (profile / grades / documents)
3. Evaluator selects a submission — backend claims it: `claimed_by = evaluator_id`, `claimed_at = now()`
4. If another evaluator tries to open the same submission within 30 minutes, they receive: "Being reviewed by another evaluator"
5. Claims expire after 30 minutes automatically
6. Evaluator reviews the diff (profile) or grades + documents (grades/documents submission)
7. Evaluator makes a decision:
   - **Approve** → changes are applied to the database, `status = approved`, claim released
   - **Reject** → changes are not applied, `status = rejected`, `evaluator_note` saved, claim released
   - **Request more info** → `status = more_info`, `evaluator_note` saved, claim released
8. Scholar sees the outcome on their dashboard

---

## 6. Evaluator direct edit

Evaluators can edit a scholar's profile directly without going through the approval queue.

1. Evaluator opens a scholar's profile via the scholar management screen
2. Evaluator edits any field and saves
3. Changes are applied immediately to the `scholars` table — no pending change created
4. This is intended for corrections and admin fixes, not routine updates

---

## 7. Program shift

When a scholar changes course or school:

1. Evaluator opens the scholar's profile
2. Evaluator closes the current `ProgramHistory` row by setting `end_date = today`
3. Evaluator creates a new `ProgramHistory` row with the new course/school, `start_date = today`, `end_date = null`
4. The scholar's `course`, `school`, and `year_level` fields on the `scholars` table are also updated
5. Scholar can view their full program history in the web app

---

## 8. Post-graduation update

1. Scholar must have `status = graduate` before post-grad fields can be updated
2. If not yet set to graduate, evaluator updates `scholars.status = graduate` first
3. Evaluator opens the post-grad section of the scholar's profile
4. Evaluator updates employment status: toggle `employed_at_pps`
5. Evaluator updates board exam: toggle `board_passer`, set `board_exam_date`, set `profession`
6. Changes are saved directly — no approval queue for evaluator-initiated post-grad updates

> Note: Post-graduation data is stored in a `post_graduation` table (Phase 6). The `scholars` table holds only the base status.

---

## 9. Allowance tracking

1. Evaluator opens a scholar's profile or the allowance management screen
2. Evaluator adds a new allowance record: amount, date received, notes
3. Record is saved to the `allowance_records` table (Phase 6)
4. Scholar can view their full allowance history in the web app (read-only)

---

## 10. CSR event tracking

1. Evaluator creates a CSR event: event name, date, description
2. Evaluator marks attendance per scholar for that event
3. Attendance is saved to `csr_participation` (Phase 6)
4. Scholar can view their CSR attendance history in the web app (read-only)

---

## 11. Announcements (submission bin)

Evaluators can broadcast messages to all or a filtered subset of scholars.

1. Evaluator opens the **New Announcement** form
2. Evaluator fills in title, message, and type (`general`, `reminder`, `warning`, `deadline`)
3. Evaluator optionally filters recipients by batch, school, and/or status
4. Evaluator optionally schedules for a future date/time — leaving blank sends immediately
5. Backend creates an `Announcement` row and queries matching scholars based on the filter
6. An `AnnouncementReceipt` row is created for each matching scholar
7. Announcement appears on each recipient scholar's dashboard as an unread notice
8. When the scholar views it, `is_read = true` and `read_at = now()` are set

---

## 12. Report generation

1. Evaluator opens the **Reports** screen
2. Evaluator selects a report type:
   - Active scholars by school and batch
   - Inactive scholars by school and batch
   - Graduate scholars by school and batch
   - Extended active scholars by school and batch
   - Latin honors (Summa, Magna, Cum Laude) by school and batch
   - Post-graduation: employed at PPS
   - Post-graduation: licensure passers per profession
3. Evaluator applies optional filters: course, school, batch, status, demographics
4. Report is generated and displayed
5. Evaluator exports to Excel or PDF

---

## 13. Evaluator login

Evaluators use username (email) and password — no OAuth.

1. Evaluator enters email and password in the PySide6 desktop app
2. Backend verifies credentials against `users` table using bcrypt
3. If valid and `role = evaluator`, a JWT is issued (expires in 8 hours)
4. JWT is stored in memory for the session — not written to disk
5. All subsequent API calls include the JWT as a Bearer token

---

## 14. Scholar login

Scholars use Google OAuth — no password managed by this system.

1. Scholar clicks "Sign in with Google" on the web app
2. Google handles authentication and returns a Google ID token to the web app
3. Web app sends the Google ID token to `POST /auth/google`
4. Backend verifies the token with Google's public keys and extracts the email
5. Backend checks the email in the `users` table
6. If found and `role = scholar` and `is_active = true` → JWT issued
7. If not found → 403 "Not a registered scholar"
8. JWT is stored in the browser (localStorage) for the session
