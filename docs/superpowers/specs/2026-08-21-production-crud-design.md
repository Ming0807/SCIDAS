# Production CRUD Design

## Goal

Make the dashboard's core records maintainable end to end before the final UX/UI polish pass. Every visible create, edit, archive/delete, and batch-save control must execute a real school-scoped Supabase mutation and return useful Thai feedback.

## Scope And Order

1. Students: create, read, edit, archive, and restore-ready status handling.
2. Attendance: date-scoped batch create/update plus explicit correction semantics.
3. Academics: semester-scoped batch create/update with separate classwork, midterm, final, total, and grade values.
4. Behavior: create, read, edit, and guarded delete for correction of erroneous records.
5. Development plans: plan, goal, activity, and evaluation lifecycle.
6. Support and home visits: case/visit detail, edit, status lifecycle, evidence, and guarded archive/delete.
7. Settings, reports, and notifications: editable preferences and lifecycle actions appropriate to each module.

## Mutation Contract

All migrated Server Actions must:

- return `ActionResult<T>`;
- call `getCurrentUserContext()` inside the action;
- reject unauthenticated users and unsupported roles;
- derive `school_id`, actor profile, and current semester on the server;
- verify every referenced record belongs to `context.schoolId` before mutation;
- validate FormData or structured payloads and return field errors where useful;
- scope update/delete queries by both record id and `school_id`;
- revalidate every affected list and detail route;
- avoid exposing raw database errors to users;
- preserve auditability through existing audit triggers and lifecycle status fields.

## Delete Policy

- Students are archived by changing `status`; they are not physically deleted through the UI.
- Development plans and support cases use lifecycle statuses where the schema supports them.
- Attendance and academic score rows may be removed only as explicit corrections and only after ownership validation.
- Behavior records may be deleted as corrections because audit logs capture the mutation; the UI requires confirmation.
- Files are deleted from Storage and their registry together, with cleanup on partial failure.

## UI Contract

- Create/edit forms use `useActionState` or `useTransition` with a visible status region.
- Submit controls communicate pending state and cannot double-submit.
- Field errors appear beside the relevant control; form-level errors remain visible until retry.
- Destructive actions require a confirmation dialog that names the record and consequence.
- Success updates the current view through revalidation, `router.refresh()`, or a returned `redirectTo`.
- Desktop and mobile expose equivalent row-level actions.
- Batch editors track dirty state and do not silently overwrite unsaved changes during navigation.

## Read And Write Boundaries

- Server Components load DTOs through `src/lib/server/*-read-models.ts`.
- Server Actions own validation and writes in `src/app/actions/*.actions.ts`.
- Client components own temporary form state only; they never construct trusted tenant or actor fields.
- Shared feedback and confirmation components live under `src/components/forms`.

## Error Handling

- `UNAUTHORIZED`: no authenticated profile.
- `FORBIDDEN`: role or school ownership mismatch.
- `VALIDATION_ERROR`: invalid or incomplete input, including field errors.
- `NOT_FOUND`: target record does not exist in the current school.
- `CONFLICT`: duplicate student code or unique attendance/score collision that cannot be safely upserted.
- `INTERNAL_ERROR`: logged server-side and rendered as a neutral retry message.

## Verification

- Unit tests cover validation, cross-school rejection, scoped update/delete, and success revalidation.
- TypeScript, lint, Vitest, and production build must pass.
- Authenticated browser smoke covers create, edit, archive/delete confirmation, empty/error states, and mobile layout for each migrated module.
- Supabase runtime smoke confirms generated query shapes against the applied migrations.

## Non-Goals For This Pass

- Report artifact generation and notification realtime remain later production phases.
- Bulk student assignment/card printing is not enabled until a concrete workflow exists.
- Broad schema redesign is avoided unless a verified CRUD requirement cannot be represented safely.
