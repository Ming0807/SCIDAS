# SCIDAS Long Production Loop Prompt

Work continuously on the SCIDAS repository from the current `main` HEAD. Do not
pause for routine decisions. Choose the safest production-grade approach that
matches the existing architecture and complete as many batches as possible.

## Non-negotiable rules

- Record `BASE_COMMIT=$(git rev-parse HEAD)` before editing.
- Read `AGENTS.md`, `docs/AI_HANDOFF.md`, `task.md`, the relevant local skills,
  and the matching Next.js 16.3.3 guides in `node_modules/next/dist/docs/`.
- Use subagents for independent investigation and implementation batches when
  available. Give each agent explicit file ownership and merge/review every
  result yourself. Avoid parallel edits to the same files.
- Never push. Create exactly one local commit after every required gate passes.
- Do not amend, reset, rebase, force checkout, delete user changes, or commit
  `.agents/`, `.gemini/`, `.reasonix/`, `skills-lock.json`, secrets, or local
  generated artifacts.
- Migrations are append-only from `0018_*.sql`; do not rewrite `0011`-`0017`.
- Preserve SCIDAS patterns: authenticated server read models, thin Server
  Actions, `ActionResult<T>`, Zod validation, explicit `school_id` tenant scope,
  role checks, RLS `USING` plus `WITH CHECK`, transactional RPCs for multi-table
  writes, generated database types, honest loading/empty/error/success states.
- Never invent schema columns, enum values, backend results, completed files, or
  test output. Verify every SQL identifier against migrations/database types.
- Use the Impeccable skill for UI work. Keep desktop and mobile responsive,
  accessible, keyboard usable, visually consistent, and free of dead controls.
- Add focused regression tests while implementing. Run focused checks per batch;
  run the full verification suite once at the end to avoid wasted cycles.

## Wave 1: Runtime and security proof

1. Start local Supabase if Docker is available, reset it from migrations and
   seed connected demo data. If unavailable, record the exact blocker and still
   perform static SQL contract tests; never claim runtime success.
2. Exercise migrations `0011`-`0017`, guardian RPCs, student import RPC, risk
   analytics RPCs, report claim/complete/fail/retry/recovery, storage policies,
   and all role enum values. Repair only with new migrations.
3. Audit every production query and mutation for tenant scope, authorization,
   validation, deterministic ordering, race handling, and honest error mapping.

## Wave 2: Complete core CRUD workflows

4. Finish student create/read/update/archive, classroom enrollment, guardian
   management, notes and import flows, including confirmation, duplicate and
   conflict states. Do not hard-delete records where history must be retained.
5. Finish attendance daily recording and corrections, behavior incident CRUD,
   support-case lifecycle, development-plan goals/activities/reviews, home-visit
   CRUD and attachments, and academic-score entry/correction/import.
6. Enforce role capabilities consistently in navigation, pages, actions, RPCs,
   RLS, and tests. Hidden buttons are not authorization.

## Wave 3: Reports, risk and notifications

7. Add real report filters for academic year, semester, classroom and student;
   persist validated filter snapshots in jobs and make every generator honor
   them. Keep private storage and signed downloads.
8. Replace request-bound report execution with a durable, idempotent worker
   approach appropriate for Supabase deployment. Preserve claim tokens, stale
   recovery, retry limits and observable failure reasons.
9. Complete risk trends, dimensions and classroom/student drill-down using real
   scoped data only. Add explainable factor evidence and recalculation strategy
   that will not time out on large schools.
10. Complete notification read/delete/preferences and realtime reconciliation;
    avoid duplicate toasts and stale unread counts.

## Wave 4: Production UX and operations

11. Audit every route with Impeccable at desktop and mobile sizes. Fix navigation,
    hierarchy, spacing, overflow, Thai copy, focus states, forms, tables, dialogs,
    touch targets, loading, empty, error, permission and success states. Remove
    or disable every dead interaction with an honest reason.
12. Add authenticated Playwright smoke coverage for the highest-value workflows
    and role boundaries. Prefer stable semantic locators and deterministic data.
13. Add production observability for critical mutations and background jobs
    without logging personal data or secrets. Update operating/runbook docs.
14. Update `task.md` and `docs/AI_HANDOFF.md` with completed work, exact pending
    risks, required deployment steps and rollback notes.

## Required final gates

Run and report exact results:

```bash
git diff --check "$BASE_COMMIT"
npx tsc --noEmit
npm run lint
npm test -- --run
npm run build
npm audit --omit=dev
```

Also run migration reset/runtime smoke and Playwright tests when the environment
supports them. Clearly label anything not run and why. Review the full diff from
`BASE_COMMIT`, remove debug code and unrelated churn, then create one local commit
with a precise message. Do not push.

## Final response format

Return: base commit, local commit, batches completed, files/migrations changed,
security and tenant decisions, exact gate results, runtime/E2E evidence, remaining
risks, and the first files Codex should inspect. Include `git status --short` and
state explicitly: `Push: none`.
