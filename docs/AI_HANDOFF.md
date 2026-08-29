# AI Handoff Guide

This is the operating contract for any follow-up coding agent working on SCIDAS after the latest Codex-reviewed checkpoint on `main`.

## Ownership

- The follow-up agent may create one local commit after all requested batches pass verification.
- The follow-up agent must never push. Codex reviews the diff and owns remote pushes.
- Never rewrite, reset, clean, or revert user work. Leave `.agents`, `.gemini`, `.reasonix`, and `skills-lock.json` untracked unless the user explicitly requests otherwise.
- Report the baseline SHA, final local SHA, files changed, checks run, remaining risks, and the first files Codex should inspect.

## Read First

1. `AGENTS.md`
2. Relevant Next.js 16.3 docs in `node_modules/next/dist/docs/`
3. `task.md`
4. `docs/BACKEND_DATA_ARCHITECTURE.md`
5. `docs/UX_UI_SYSTEM_ROADMAP.md`
6. `docs/frontend.md`
7. `docs/COMPONENT_ARCHITECTURE.md`
8. `docs/API_SPECIFICATION.md`
9. The latest migrations in `supabase/migrations/`
10. Existing read models under `src/lib/server/` and actions under `src/app/actions/`

For frontend work, also read `.agents/skills/impeccable/SKILL.md`. For broad architecture work, read `.agents/skills/improve-codebase-architecture/SKILL.md` when available.

## Current Baseline

- Next.js `16.3.3`, React `19.2.4`, Tailwind CSS `4`, Supabase.
- Server Components load initial data through server-only read models and typed DTOs.
- Mutations are thin Server Actions returning `ActionResult<T>` and validating all client input.
- Every query and mutation is explicitly tenant-scoped by authenticated `school_id`; RLS is defense in depth.
- Multi-table invariants use transactional database RPCs. Generated Supabase types must match new RPCs.
- Storage and database operations must use failure-safe lifecycle semantics; do not call cross-system operations atomic.
- Shared UI belongs in established component directories. Do not add page-local duplicates.
- Empty, loading, error, success, permission, and conflict states must be honest and usable on desktop and mobile.
- Applied migrations are append-only. If deployment status is uncertain, add a new repair migration instead of rewriting production history.

## Required Gates

Use focused checks during implementation. Before the local checkpoint commit run:

```bash
git diff --check
npx tsc --noEmit
npm run lint
npm test -- --run
npm run build
npm audit --omit=dev
```

When migrations change and Docker is available:

```bash
npx supabase start
npx supabase db reset
npm run db:types
```

For UI changes, run authenticated browser smoke tests at desktop and mobile widths. Never refresh visual snapshots blindly; inspect the rendered result first.

## Coding Rules

- Use `apply_patch` for manual edits and keep changes scoped.
- Read the relevant local Next.js guide before changing framework code.
- Authenticate, authorize, validate, and tenant-scope every Server Action.
- Never trust a typed client argument as runtime validation.
- Prefer database constraints plus RPC transactions for invariants and concurrency.
- Use deterministic ordering for paginated queries.
- Add focused regression tests for each repaired production defect.
- Do not silence errors, fabricate data, leave decorative controls, or mark incomplete work complete in `task.md`.
- Do not commit generated caches, credentials, local agent configuration, or unrelated changes.

## Handoff Output

Return a compact report containing:

1. Baseline and local commit SHA; confirm `push: none`.
2. Batches completed and user-visible behavior.
3. Migrations/RPCs and authorization model changed.
4. Exact verification results.
5. Runtime checks not performed and why.
6. Remaining risks and recommended next order.
7. Highest-risk files for Codex review.
