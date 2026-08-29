# Backend Data Architecture

Status: active plan, updated on 2026-08-29

This document is the backend/data source of truth for making the SCIDAS UI work as one coherent product.

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

### 4. Identity, Evidence, and Production Hardening Layers

- **Migration 0009**: `0009_identity_evidence_flow.sql` — OAuth profile sync trigger hardening, `documents` storage bucket policies for `student-attachments/<student_id>/...`.
- **Migration 0010**: `0010_security_crud_hardening.sql` — Server Actions auth/tenant scoping, protected profile fields, tenant child policy checks.
- **Migration 0011**: `0011_admin_academic_management.sql` — Academic administration triggers maintaining a single current academic year and single current semester per school; foreign key checks for teacher/classroom tenant consistency.
- **Migration 0012**: `0012_student_import_security.sql` — Atomic batch import RPC `import_students_atomic`, homeroom teacher classroom authorization, duplicate checking.
- **Migration 0013**: `0013_report_artifacts.sql` — Private storage bucket `reports` with signed URL access and school-scoped RLS policies.
- **Migration 0014**: `0014_risk_analytics.sql` — Real risk trend history and multi-dimension benchmarks RPCs (`get_school_risk_trend`, `get_risk_dimension_benchmarks`, `get_classroom_risk_breakdown`).
- **Migration 0015**: `0015_realtime_hardening.sql` — Postgres replication publications and `REPLICA IDENTITY FULL` on `notifications`, `attendance_records`, `report_jobs`, `risk_assessments`.
- **Migration 0016**: `0016_guardian_transactional.sql` — Transactional `manage_student_guardian` RPC maintaining atomic guardian upsert and primary-guardian invariant; notification DELETE RLS policy for recipients.

## Acceptance Criteria

A route is backend-ready when:

- It uses a server read model or DAL function instead of page-local mock data.
- It validates auth and school ownership on every mutation.
- It returns `ActionResult<T>` for migrated actions.
- It has loading, empty, error, permission, and pending states in the UI.
- It uses the same DTO for mobile and desktop rendering.
- It does not query child tables without respecting `school_id`.
- It can explain why a student appears in a risk/support/action list.
