# AI Handoff Guide

This document is the handoff packet for any follow-up AI agent working after the Codex baseline commit on branch `codex/system-ux-foundation`.

The follow-up agent must not commit or push. Codex owns the checkpoint commits so later reviews can compare the follow-up work against a clean baseline.

## Read First

Read these files in this order before changing code:

1. `AGENTS.md`
2. Relevant local Next.js 16 docs under `node_modules/next/dist/docs/`
3. `task.md`
4. `docs/BACKEND_DATA_ARCHITECTURE.md`
5. `docs/UX_UI_SYSTEM_ROADMAP.md`
6. `docs/frontend.md`
7. `docs/COMPONENT_ARCHITECTURE.md`, especially section `0. Active Migration Architecture`
8. `docs/API_SPECIFICATION.md`, especially `ActionResult And Server Action Flow`
9. `supabase/migrations/0008_ux_data_foundation.sql`
10. `supabase/migrations/0009_identity_evidence_flow.sql`
11. `src/lib/server/student-care-read-models.ts`
12. `src/app/actions/care.actions.ts`
13. `src/components/care/*`

## Current Baseline

The current production direction is:

- Next.js `16.2.7`, React `19.2.4`, Tailwind CSS `4`.
- Supabase migrations are append-only after they have been applied. Do not edit old applied migrations such as `0001` through `0008`; add a new migration instead.
- Student care data should flow through shared server read models and typed DTOs, not page-local duplicated queries.
- Mutations should be thin Server Actions returning `ActionResult<T>`.
- Forms that need pending or field-level feedback should use `useActionState`.
- Shared UI belongs under `src/components/dashboard`, `src/components/data`, `src/components/forms`, `src/components/feedback`, or `src/components/care` when it is reused across routes.

## Coding Rules

- Do not commit or push.
- Do not run destructive git commands.
- Keep changes scoped to the requested task.
- Do not introduce new page-local UI patterns when a shared component already exists.
- Server Components should load initial data through server-only read models.
- Client Components should only handle interaction, local UI state, and form feedback.
- Every Server Action must re-check authentication and authorization.
- Every student-scoped query or mutation must respect school ownership and RLS.
- Do not use a service-role key from UI actions.
- Use generated Supabase types from `src/types/database.types.ts`.
- For frontend work, follow the design-system rules in `docs/frontend.md` and the reusable component contracts in `docs/COMPONENT_ARCHITECTURE.md`.
- Update `task.md` and the relevant architecture doc when behavior, data flow, or migration status changes.

## Verification Checklist

Run the relevant subset for small changes, and the full set before handing back broad work:

```bash
npm run db:start
npx supabase db reset
npm run db:types
npm run lint
npx tsc --noEmit
npm test -- --run
npm run build
node .agents/skills/impeccable/scripts/detect.mjs --json src/app src/components
```

For UI changes, also run browser checks at desktop and mobile sizes. Protected routes may redirect to `/login` without an authenticated session; authenticated visual smoke is still required before production sign-off.

## Near-Term Backlog

High-value next tasks:

- Wire the existing `student_attachments` panel into concrete home-visit detail/edit and report detail flows.
- Build the dedicated support case lifecycle UI around open, in-progress, resolved, and monitoring states.
- Continue replacing route-local mock data with read models for behavior, development plans, reports, notifications, and settings.
- Add real `report_jobs` queue behavior and download state.
- Add authenticated visual smoke tests for the migrated dashboard routes.

## Starter Prompt For Follow-Up AI

Use this as the initial prompt for the next agent:

```text
You are continuing work on the SCIDAS Next.js 16 project after Codex's baseline commit on branch codex/system-ux-foundation.

Important constraints:
- Do not commit or push. Leave all changes unstaged unless explicitly asked.
- Read AGENTS.md first.
- Before writing Next.js code, read the relevant local docs in node_modules/next/dist/docs/.
- Read docs/AI_HANDOFF.md, task.md, docs/BACKEND_DATA_ARCHITECTURE.md, docs/UX_UI_SYSTEM_ROADMAP.md, docs/frontend.md, docs/COMPONENT_ARCHITECTURE.md section 0, and docs/API_SPECIFICATION.md ActionResult section.
- Follow the existing patterns in src/lib/server/student-care-read-models.ts, src/app/actions/care.actions.ts, and src/components/care/*.

Task:
Pick the next highest-value item from task.md that moves the app toward real production usage. Prefer shared read models, typed DTOs, reusable components, and thin Server Actions. Do not create page-local duplicate UI if a shared component fits. Update task.md and relevant docs when you change architecture or status.

Verification expected before handoff:
- npx tsc --noEmit
- npm run lint
- npm test -- --run
- npm run build
- node .agents/skills/impeccable/scripts/detect.mjs --json src/app src/components
- If migrations changed: npm run db:start, npx supabase db reset, npm run db:types
```
