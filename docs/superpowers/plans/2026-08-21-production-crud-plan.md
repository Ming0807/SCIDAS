# Production CRUD Implementation Plan

## Phase 1: Core School Records

### Task 1: Shared mutation UX

- Add reusable action feedback/status component.
- Add reusable destructive confirmation component using the existing dialog primitives.
- Export both from `src/components/forms`.
- Add focused component tests where the repo's current test setup supports them.

### Task 2: Student lifecycle

- Add school-scoped update and archive actions with validation.
- Add `/students/[id]/edit` and reuse one student form contract for create/edit.
- Replace disabled row controls with detail/edit/archive actions.
- Keep bulk assignment and card printing absent until implemented.

### Task 3: Attendance batch editing

- Replace the legacy mutation with `ActionResult` and verify classroom/student membership.
- Mount a real date-scoped editor from `/attendance`.
- Support batch create/update, remarks, dirty state, feedback, and route refresh.

### Task 4: Academic score editing

- Replace the legacy mutation with `ActionResult` and verify semester/classroom/subject/student ownership.
- Store classwork, midterm, and final independently; derive total and grade consistently.
- Mount the semester-scoped editor with per-cell validation and mutation feedback.

### Task 5: Behavior maintenance

- Add school-scoped update and delete actions.
- Add edit route/form and guarded delete on detail.
- Preserve creator/audit metadata and revalidate list/detail routes.

## Phase 2: Student Care Lifecycle

### Task 6: Development plans

- Add `/development-plans/new`.
- Harden plan/goal/activity/evaluation actions with ownership checks.
- Replace disabled detail controls with working dialogs/forms.

### Task 7: Support cases

- Add support detail and edit flows.
- Add assignment and status lifecycle mutations.
- Add follow-up create/edit/delete and responsive list actions.

### Task 8: Home visits

- Add detail/edit routes and guarded archive/delete.
- Connect visit evidence to the existing attachment service.

## Phase 3: Administrative CRUD

### Task 9: Settings and preferences

- Implement profile and dashboard preference updates.
- Limit school-level settings to authorized administrators.

### Task 10: Secondary record maintenance

- Add note and attachment delete/edit where policy allows.
- Add report job cancel/retry/delete lifecycle.
- Polish notification mutation feedback.

## Phase 4: Production Verification

- Add authorization and mutation tests per module.
- Run TypeScript, lint, unit tests, build, and authenticated Playwright CRUD smoke.
- Run Supabase migration/type/runtime verification.
- Update `task.md`, backend architecture, UX/UI roadmap, and handoff documentation.
