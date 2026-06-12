# Backend Data Architecture

Status: active plan, started on 2026-06-10

This document is the backend/data source of truth for making the SCIDAS UI work as one coherent product. The old page-by-page UI migration is paused while the database, read models, and server action flow are hardened.

## Goal

The frontend should not rebuild student state separately on every route. Each page should read from shared, secure read models that answer the same questions:

- Who is the student?
- What is the current risk and why?
- What needs action now?
- Who owns the next step?
- What happened recently?
- Which evidence, notes, and reports are attached?

## Data Layers

### 1. Source Tables

Existing tables remain the system of record:

- Identity and school: `schools`, `profiles`, `students`, `guardians`, `student_guardians`
- Enrollment: `academic_years`, `semesters`, `classrooms`, `classroom_students`, `subjects`, `classroom_subjects`
- Signals: `attendance_records`, `academic_scores`, `basic_skills`, `behavior_records`, `assignment_submissions`, `home_visits`
- Care workflow: `support_records`, `support_followups`, `risk_assessments`, `risk_factors`, `development_plans`, `development_goals`, `development_activities`, `development_evaluations`
- System: `notifications`, `system_settings`, `audit_logs`

### 2. UX Orchestration Tables

Migration `supabase/migrations/0008_ux_data_foundation.sql` adds the cross-module layer:

| Table | Purpose | Primary UI Use |
|---|---|---|
| `student_timeline_events` | Unified event stream generated from attendance, behavior, support, risk, IDP, and home visits | student detail, support, risk, IDP timeline |
| `student_flags` | Current active flags that explain why a student needs attention | dashboard badges, worklist, student header |
| `action_items` | Cross-module task queue with owner, priority, due date, and source record | dashboard action queue, support workflow, risk follow-up |
| `student_notes` | Shared note stream with team/private/leadership visibility | support notes, student detail, counselor workflow |
| `student_attachments` | Generic attachment registry tied to student and optional source record | home visits, support evidence, reports |
| `report_jobs` | Async report/export state | reports page, export progress |
| `user_dashboard_preferences` | Per-user dashboard/filter/view preferences | dashboard, data tables, saved views |

### 3. Read Models

These views are intended for Server Components and server-only data access:

| View | Purpose |
|---|---|
| `v_current_student_directory` | One current row per active student with class and primary guardian |
| `v_student_latest_risk` | Latest risk assessment per student |
| `v_student_support_state` | Open support cases, active IDPs, flags, actions, next due date |
| `v_student_worklist` | Main student worklist combining identity, risk, support, flags, actions, and 30-day attendance |

`v_student_worklist` is the preferred first read model for `/students`, `/risk-analysis`, `/support`, dashboard priority students, and any route that needs a student list with actionable state.

### 4. Identity And Evidence Hardening

Migration `supabase/migrations/0009_identity_evidence_flow.sql` adds the next production hardening layer:

- Replaces `handle_new_user()` safely for OAuth signups without rewriting old applied migrations.
- Accepts Google/OAuth metadata such as `full_name`, `name`, `avatar_url`, and `picture`.
- Falls back to the first active school only when metadata does not contain a valid active `school_id`.
- Normalizes role aliases such as `teacher` and `homeroom` into the existing `user_role` enum.
- Splits generic attachment access into explicit select/insert/update/delete policies.
- Adds Supabase Storage policies for private `documents/student-attachments/<student_id>/...` objects.

The application validates evidence uploads at 10 MB while `next.config.ts` allows Server Action bodies up to `12mb`, giving the app room to return controlled validation errors before Next.js rejects the request.

## Automation

Migration `0008` adds these database automations:

- `school_id` consistency triggers for student-scoped and parent-scoped tables.
- Timeline sync triggers for `attendance_records`, `behavior_records`, `support_records`, `risk_assessments`, `development_plans`, and `home_visits`.
- Risk follow-up trigger that creates or updates a `student_flags` row and an `action_items` row when risk becomes `watch` or `high`, and resolves/cancels those rows when risk returns to `normal`.
- RLS policies for every new orchestration table.

This means frontend pages can show a unified activity feed and action queue without hand-building one query per module.

## Server Data Access Layer

New files:

- `src/lib/server/current-user.ts`
  - Resolves Supabase user, profile/student identity, school, role, and current semester.
- `src/lib/server/student-care-read-models.ts`
  - Exposes `getStudentCareDashboard`, `getStudentWorklist`, `getStudentCareProfile`, `getActionQueue`, `getStudentActionItems`, `getStudentTimeline`, `getStudentNotes`, `getStudentAttachments`, `createStudentNote`, `uploadStudentAttachment`, and `updateActionItemStatus`.
- `src/lib/server/home-visit-read-models.ts`
  - Exposes `getHomeVisitDashboard` for `/home-visits`, joining visits with student, visitor, and visit image context.
- `src/lib/server/report-read-models.ts`
  - Exposes `getReportJobs` for `/reports`, reading `report_jobs` scoped to the current school, joining with `profiles` for requester name, generating signed download URLs for completed outputs, and returning typed `ReportJobItem` DTOs.
- `src/lib/server/notification-read-models.ts`
  - Exposes `getNotifications` (paginated via `NotificationPage`, supports `status`/`type`/`page`/`limit` filters, max 50 items per page), `getNotificationCounts`, `markAllNotificationsRead`, and `toggleNotificationRead` for `/notifications`. Queries `notifications` for the current recipient and school, joins sender profile, builds typed `NotificationItem`/`NotificationCounts` DTOs with Thai labels, normalizes internal source links from `reference_type`/`reference_id`/`link`, and scopes all mutations to the authenticated user's `profileId` + `schoolId`.
- `src/lib/server/action-result.ts`
  - Shared `ActionResult<T>` helpers for migrated server actions.
- `src/app/actions/care.actions.ts`
  - Thin Server Action wrapper for updating action item status, adding student care notes, and uploading student evidence attachments.

Server Components should call the read-model functions directly. Client Components should mutate through Server Actions and receive `ActionResult<T>`.

## Frontend Integration Order

1. Dashboard
   - Replace static summary/action/tracking widgets with `getStudentCareDashboard()`.
   - Show `priorityStudents` and `actionQueue` from the DAL.
   - Current status: initial real-data integration is complete for summary cards, action queue, tracking table, and mobile dashboard.

2. Students
   - Replace route-local `student-data.ts` with `getStudentWorklist()`.
   - Keep one shared DTO for desktop `DataTable` and mobile `MobileList`.
   - Current status: initial real-data integration is complete with URL search params, server filtering, pagination, real profile snapshot, and a real `/students/[id]` care profile that reads notes, timeline, open action items, and evidence attachments.

3. Risk Analysis
   - Read top risk students from `v_student_worklist`.
   - Use `action_items` for follow-up ownership and due dates.
   - Current status: overview metrics, top-risk table, and recommendations now read from `v_student_worklist`; matrix and charts still need real factor/matrix models.

4. Support
   - Use `action_items`, `student_notes`, and `student_timeline_events`.
   - Stop duplicating notes/actions inside page-local static components.
   - Current status: support workbench reads `getStudentCareDashboard()`, `getStudentWorklist()`, `getActionQueue()`, `getStudentNotes()`, `getStudentTimeline()`, and `getStudentAttachments()`. Users can move action items forward, add student notes, and upload evidence files from the support page. Remaining work: dedicated case creation/edit flows and richer pending/success feedback.

5. IDP
   - Use timeline events for plan creation/progress and action items for review tasks.

6. Home Visits
   - Replace mock visit cards with `home_visits` plus `student_attachments`.
   - Write visit creation so timeline and risk factors update automatically.
   - Current status: list/gallery now reads real `home_visits` plus `home_visit_images`; the generic `student_attachments` upload service exists and should be attached to concrete visit detail/edit flows next.

7. Reports
   - Use `report_jobs` for queued/running/completed/failed state.
   - Current status: `src/lib/server/report-read-models.ts` provides `getReportJobs()` that reads `report_jobs` scoped to the current school, joins with `profiles` for the requester name, maps to a typed `ReportJobItem` DTO, and generates signed download URLs for completed jobs with `output_bucket`/`output_path` set. `/reports/page.tsx` is now an async Server Component that loads real job data and passes it to `DesktopLatestReports` (table with status badges, empty state, context-aware actions) and `MobileDownloadReports` (downloadable report cards with signed links and empty state). `DesktopCreateReport` now uses a `useActionState` Server Action to insert queued `report_jobs` rows, but a real generation worker and artifact pipeline are still pending.

8. Notifications and Settings
   - Notifications should link to source records and student/action context.
   - Current status: `/notifications` reads real `notifications` table data via `src/lib/server/notification-read-models.ts` (paginated listing with status/type filters via URL search params, counts by type/read-state, internal source links, mark-all-read and per-item toggle Server Actions with optimistic UI). Filters and pagination are real `<Link>` components — no fake buttons. Push delivery (realtime) is not yet wired.
   - Settings should use `user_dashboard_preferences` for per-user UI behavior.

## Acceptance Criteria

A route is backend-ready when:

- It uses a server read model or DAL function instead of page-local mock data.
- It validates auth and school ownership on every mutation.
- It returns `ActionResult<T>` for migrated actions.
- It has loading, empty, error, permission, and pending states in the UI.
- It uses the same DTO for mobile and desktop rendering.
- It does not query child tables without respecting `school_id`.
- It can explain why a student appears in a risk/support/action list.

## Known Verification Gap

The user reported that `0008_ux_data_foundation.sql` was applied on 2026-06-11. Supabase CLI is now installed as a project dev dependency. Local Supabase starts successfully after normalizing `supabase/config.toml` to `project_id = "scidas-local"`, migrations `0001` through `0008` apply locally, and `src/types/database.types.ts` has been regenerated with `npm run db:types`. Migration `0009_identity_evidence_flow.sql` now needs the same local reset and preview/project verification. Before production deployment, still run the same verification against the target Supabase project:

```bash
supabase db reset
supabase db push
```

or apply the migrations in a Supabase preview project, inspect the new views/RLS policies, and regenerate `src/types/database.types.ts` from that target when the account has platform typegen privileges.
