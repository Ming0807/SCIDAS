# Task Progress

## 2026-06-10 Backend Data Foundation Pivot

Status: active. The previous page-by-page UX/UI migration is paused temporarily while the database and backend flow are made reliable enough for real frontend usage.

Source of truth:

- `docs/BACKEND_DATA_ARCHITECTURE.md`
- `supabase/migrations/0008_ux_data_foundation.sql`
- `src/lib/server/student-care-read-models.ts`

### Completed In This Backend Pass

- [x] Audited the current Supabase schema, RLS policies, migrations, server actions, and route inventory.
- [x] Designed the cross-module student care data layer for smoother UX across dashboard, students, risk, support, IDP, reports, home visits, and notifications.
- [x] Added migration `0008_ux_data_foundation.sql` with school consistency triggers, UX orchestration tables, timeline automation, risk follow-up automation, read models, and RLS policies.
- [x] Added server-side contracts in `src/lib/server/action-result.ts`, `src/lib/server/current-user.ts`, `src/lib/server/student-care-read-models.ts`, and `src/app/actions/care.actions.ts`.
- [x] Updated `src/app/actions/dashboard.actions.ts` to read from the new student care dashboard service.
- [x] Updated `src/types/database.types.ts` for the existing `students.user_id` migration.
- [x] Documented the backend architecture and route integration order.

### Current Backend Verification

- [x] `npx tsc --noEmit`: passed after adding the DAL/service layer.
- [ ] `supabase db reset` or `supabase db push`: not run locally because Supabase CLI is not installed in this environment.
- [ ] SQL migration preview on Supabase: still required before production deploy.

### P0 Next Tasks

- [ ] Apply migration `0008_ux_data_foundation.sql` in a Supabase preview project and fix any SQL/RLS issues found there.
- [ ] Replace dashboard static components with props from `getStudentCareDashboard()`.
- [ ] Replace `/students` route-local `student-data.ts` with `getStudentWorklist()`.
- [ ] Replace mock `/home-visits` cards with real `home_visits` + `student_attachments`.
- [ ] Connect `/risk-analysis` top-risk and recommendations to `v_student_worklist`, `student_flags`, and `action_items`.
- [ ] Connect `/support` notes/actions to `student_notes`, `action_items`, and `student_timeline_events`.
- [ ] Convert migrated mutations to `ActionResult<T>` and verify auth/authorization inside every action.

### P1 Next Tasks

- [ ] Add a real report generation queue around `report_jobs`.
- [ ] Add attachment upload actions that write `student_attachments`.
- [ ] Add notification links to source records and action items.
- [ ] Add authenticated browser visual checks after pages consume real read models.
- [ ] Regenerate Supabase database types after migration `0008` is applied.

## 2026-06-10 System UX/UI & Architecture Roadmap

Source of truth for the next UX/UI and frontend architecture work:

- `docs/UX_UI_SYSTEM_ROADMAP.md`
- `.impeccable/critique/2026-06-10-system-ux-audit/browser-audit.json`

Status: planned, not fully implemented yet.

### Baseline From Latest Check

- Technical health after the previous fix pass is green:
  - `npm run lint` exits successfully, with warnings remaining.
  - `npx tsc --noEmit` exits successfully.
  - `npm test -- --run` exits successfully.
  - `npm run build` exits successfully.
- Current stack in `package.json`: Next.js `16.2.7`, React `19.2.4`, Tailwind CSS `4`.
- Dashboard route inventory found 18 route pages.
- Dashboard-local component inventory found about 120 files under `src/app/(dashboard)`, indicating too much page-local UI duplication.
- `$impeccable` detector still found 16 gray-on-color contrast warnings.
- Static scan still found many `text-[10px]`, `text-[11px]`, `text-[12px]`, hard-coded colors, custom shadows, gradients, and `rounded-3xl` usages.
- `src/components/layout/mobile-bottom-nav.tsx` links to `/menu`, but no dashboard route `/menu` exists.
- Browser audit without an auth session redirected protected routes to `/login`, so post-login screenshots still need authenticated visual verification.

### Important Note About Older Entries

The older UX/UI sections below are historical progress notes. They should not be treated as proof that the current UI is fully clean. The latest scan shows several previously mentioned anti-patterns still exist or have reappeared in other files. The next work should therefore prioritize shared system primitives and migration gates instead of isolated page-by-page cosmetic fixes.

### P0 Next Tasks

- [x] Create `src/lib/navigation.ts` as the single route/navigation source of truth.
- [x] Fix the mobile `/menu` problem by replacing it with a menu `Sheet` or adding a real route. Recommended: menu `Sheet`.
- [x] Add shared layout primitives: `PageShell`, `PageHeader`, `PageToolbar`, and `Section`.
- [ ] Normalize design tokens in `src/app/globals.css` and update `docs/frontend.md`.
- [x] Fix the 16 `$impeccable` gray-on-color detector findings.
- [x] Update stale docs that still reference Next.js 15 or route structures that do not match the app.
- [ ] Establish an authenticated visual test path for dashboard pages.
- [x] Enforce the Phase 1 docs/guardrails verification checklist before page migration starts.

### P1 Next Tasks

- [x] Add reusable dashboard components: `MetricCard`, `StatusBadge`, `StudentIdentity`, `ChartCard`.
- [x] Add reusable data components: `DataTable`, `MobileList`, `FilterBar`, `Pagination`.
- [x] Add reusable form/feedback components: `FormSection`, `SubmitBar`, `EmptyState`, `ErrorState`, `LoadingState`, `PermissionState`.
- [x] Migrate `/students` and `/attendance` first as pilot pages.
  - [x] `/students`: migrated to `PageShell`, `PageHeader`, shared metrics, shared `FilterBar`, shared `DataTable`, shared `MobileList`, and shared `Pagination`.
  - [x] `/attendance`: migrated to `PageShell`, `PageHeader`, shared metrics, shared `FilterBar`, shared `DataTable`, shared `MobileList`, shared `Pagination`, and cleaned attendance-local banned UI patterns.
- [x] Continue Wave 2 migration with `/academics`: migrated to shared page shell, filter bar, metrics, table/list, and shared academic data source.
- [x] Add guardrails for banned UI patterns: tiny arbitrary text, hard-coded hex colors, arbitrary decorative shadows, `rounded-3xl`, and non-token gradients.

### Documentation Queue

- [x] Keep `docs/UX_UI_SYSTEM_ROADMAP.md` updated as the master plan.
- [x] Update `docs/frontend.md` into the active design system rulebook.
- [x] Update `docs/COMPONENT_ARCHITECTURE.md` for the real Next.js 16 route/component structure.
- [x] Update `docs/CONTEXT.md` for current stack, current modules, and current testing status.
- [x] Update `docs/README.md` badges and document links.
- [x] Update `docs/API_SPECIFICATION.md` with the shared `ActionResult` and server action flow.
- [x] Update `docs/AGENT.md` to align with Next.js 16 and the local `AGENTS.md` instruction to read `node_modules/next/dist/docs/` before writing Next.js code.

### Phase 1 Docs/Guardrails Verification Checklist

Result from Docs/Guardrails/Verification pass on 2026-06-10:

- [x] Read local Next.js 16 docs in `node_modules/next/dist/docs/` for project structure, Server/Client Components, Server Actions, and CSS/Tailwind guidance before editing docs.
- [x] Kept changes inside the assigned docs/guardrails scope.
- [x] Did not edit `src/components/layout/*`, `src/lib/navigation.ts`, or shared UI primitive files.
- [x] Did not commit or push.
- [x] Added design-system guardrails for tokens, typography, radius, shadows, status colors, component usage, banned patterns, and verification gates.
- [x] Added a Next.js 16 active migration architecture overlay based on current `src/app` route inventory.
- [x] Added the `ActionResult<T>` and Server Action flow contract for migrated modules.
- [x] Added docs link/status note for `docs/frontend.md` and the UX/UI roadmap.
- [x] Diff reviewed before handoff; markdown lint was not required for this pass.
- [ ] Remaining stale sections still need cleanup: older architecture diagrams, older route examples, API top stack row, legacy `success` ActionResult snippets, API action file names, and README architecture block that still mention Next.js 15 or pre-migration flows.

### 2026-06-10 Implementation Pass

- Added `src/lib/navigation.ts` and routed Sidebar, MobileBottomNav, and Breadcrumb through the same navigation config.
- Replaced the broken mobile `/menu` link with a bottom `Sheet` menu that lists real module routes.
- Added shared foundation primitives:
  - `src/components/dashboard`: `PageShell`, `PageHeader`, `PageToolbar`, `Section`, `MetricCard`, `StatusBadge`, `StudentIdentity`, `ChartCard`.
  - `src/components/data`: `FilterBar`.
  - `src/components/forms`: `FormSection`, `SubmitBar`.
  - `src/components/feedback`: `EmptyState`, `ErrorState`, `LoadingState`, `PermissionState`.
  - `src/lib/design/status.ts`: shared status tone mapping and class helpers.
- Cleared the `$impeccable` gray-on-color detector findings in attendance, academics, and students components.
- Added and updated layout tests for sidebar, mobile bottom nav, and breadcrumbs.
- Verification:
  - `npx tsc --noEmit`: passed.
  - `npm run lint`: passed with 111 existing warnings.
  - `npm test -- --run`: passed, 6 files and 16 tests.
  - `node .agents/skills/impeccable/scripts/detect.mjs --json src/app src/components`: passed with `[]`.
  - `npm run build`: passed.

## E2E Tests
- Added Playwright tests in `tests/risk-analysis.spec.ts` to test `/risk-analysis` responsiveness.
- Tested on standard viewport sizes: Desktop (1920x1080), Laptop (1366x768), Tablet (768x1024), and Mobile (375x667).
- Updated snapshots and confirmed all 20 tests pass successfully.

## UX/UI Audit & Fixes (impeccable)
Audited the `/risk-analysis` UI against the `Product` guidelines and fixed the following anti-patterns:
1. **Typography & Accessibility**: Addressed WCAG violations caused by extremely small, illegible fonts (`text-[10px]`, `text-[11px]`). Replaced them with standard `text-xs` (12px) and `text-sm` (14px) and improved legibility by substituting over-used `font-bold` with `font-semibold` and `font-medium`.
2. **AI Slop Avoidance**: Replaced the "hero-metric template" anti-pattern in `risk-overview-cards.tsx` (the 4-column grid of identical cards with uninformative decorative sparklines) with cleaner, functional metric cards.
3. **Background Tint**: Changed the overly-saturated AI default background (`#f8fafc`) to semantic, standard `slate-50` and tightened border radiuses (`rounded-2xl` -> `rounded-xl`) to feel more like a serious product UI, in accordance with the product reference.

## Batch 1 E2E Tests (`/students`, `/attendance`, `/behavior`)
- Added Playwright tests in `tests/batch1.spec.ts` for `/students`, `/attendance`, and `/behavior`.
- Configured tests to assess layout responsiveness across 4 standard viewports (Desktop, Laptop, Tablet, Mobile) without horizontal scrolling bugs.
- Executed the tests and ensured all viewports handle the UI structure successfully.

## Batch 1 UX/UI Audit & System-Wide Fixes (impeccable)
Audited the UIs for `/students`, `/attendance`, and `/behavior` against the `Product` guidelines. Identified systemic UI "codex tells" and anti-patterns spreading across the dashboard, and resolved them comprehensively:

1. **AI Slop / Over-rounding**: Extracted and removed "insanely rounded" corners (`rounded-2xl`) across 100+ files, standardizing to a professional `rounded-xl` for dashboard cards.
2. **Ghost-Card Anti-Pattern**: Removed the problematic pairing of borders and deep soft shadows (`shadow-[...rgba(0,0,0,0.1)] border border-slate-100`). Cards now use a clean `border border-slate-200 shadow-sm` for a tighter, more intentional surface hierarchy.
3. **Decorative Colored Stripes**: Removed arbitrary side-stripe borders (absolute positioned color bands) inside cards on `/attendance` which did not serve a necessary semantic function, relying instead on clean iconography.
4. **Hard-Coded Background Colors**: Standardized the overly saturated `bg-[#f8fafc]` hex code across all page wrappers to the semantic token `bg-slate-50`, ensuring cleaner token consistency in the codebase.

## Batch 2 E2E Tests (`/academics`, `/home-visits`, `/support`)
- Added Playwright tests in `tests/batch2.spec.ts` for `/academics`, `/home-visits`, and `/support`.
- Tested the layout at 4 viewports: Desktop, Laptop, Tablet, and Mobile.
- Handled snapshot updates with network idle checking.

## Batch 2 UX/UI Audit & Fixes (impeccable)
Audited the UI components across `/academics`, `/home-visits`, and `/support` based on the Impeccable guidelines and Product register:
1. **Typography Scaling**: Corrected overly small and inaccessible fonts (`text-[10px]`, `text-[11px]`, `text-[12px]`) across 27 component files, replacing them with standard Tailwind scales (`text-xs`, `text-sm`) to pass WCAG contrast and readability tests.
2. **Font Weights**: Relaxed aggressive typography by replacing generic `font-bold` overuse with `font-semibold` in various list items and labels for better visual hierarchy.
3. **Visual Slop Clean-up**: Identified the "hero-metric template" in `academic-summary-cards.tsx` and removed decorative gradients, `blur-2xl` glow effects, fake SVG sparklines, and unnecessary side-stripe colored borders to match the expected Product UI aesthetic.

## Batch 3 E2E Tests (/development-plans, /reports, /notifications, /settings)
- Created Playwright tests in tests/batch3.spec.ts for /development-plans, /reports, /notifications, and /settings.
- Configured tests to capture snapshots across Desktop, Laptop, Tablet, and Mobile viewports.
- Triggered background test execution for these four pages.

## Batch 3 UX/UI Audit & Fixes (impeccable)
Audited the UI components across the batch 3 pages for AI slop and anti-patterns according to the Product guidelines:
1. **Background Theming Anti-Pattern**: Identified hard-coded bg-[#f8fafc] (AI default cream/slate color) and replaced it with bg-background to integrate correctly with the theming system across all four pages.
2. **Decorative Elements Ban**: Addressed the 'Decorative noise' anti-pattern in /settings by removing arbitrary absolute positioned SVG blobs (border-2 border-indigo-800/30 rounded-full) from the security banner, adhering to the 'no glassmorphism/useless decoration' principle.
3. **Identical Card Grid Pattern Identified**: Recognized the hero-metric identical card grid pattern in reports/_components/desktop-overview-stats.tsx and development-plans/_components/idp-goals.tsx.
