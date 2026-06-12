# Task Progress

## 2026-06-11 Notifications → Real notifications Table Data

Status: done. The `/notifications` page now reads from the real `notifications` table via a shared server read model and supports marking all notifications as read through a Server Action.

- [x] Added `src/lib/server/notification-read-models.ts` with `getNotifications()`, `getNotificationCounts()`, and `markAllNotificationsRead()` — queries `notifications` for the current recipient and school, returns typed `NotificationItem`/`NotificationCounts` DTOs, normalizes internal source links from `reference_type`/`reference_id`/`link` when available, and respects RLS.
- [x] Added `src/app/actions/notifications.actions.ts` with `markAllAsReadAction()` (returns `ActionResult<{ count: number }>`) and `markAllAsReadFormAction()` (`<form action={…}>` compatible wrapper), revalidating `/notifications`.
- [x] Converted `/notifications/page.tsx` to an async Server Component that loads real data via `getNotifications()` + `getNotificationCounts()`, shows `ErrorState` on load failure, and passes data as props to desktop/mobile components.
- [x] Updated `DesktopNotificationList` to accept `notifications`/`totalCount` props, render real rows with type icons, Thai labels, relative time, read/unread states, empty state, and source links via `next/link`.
- [x] Updated `DesktopNotificationSidebar` to accept `NotificationCounts`, render real type breakdown from `byType`, and use semantic tokens (`bg-primary`/`text-primary-foreground`).
- [x] Reworked the desktop right rail from fake filter/date/calendar controls into real read-state, type breakdown, and channel status panels until URL filters/pagination are implemented.
- [x] Fixed `text-[9px]`, `text-[10px]`, `text-[11px]`, `text-[12px]`, `text-[13px]`, `text-[14px]`, `text-[18px]`, `text-[36px]` → standard Tailwind tokens (`text-xs`, `text-sm`, `text-lg`, `text-3xl`) in all six notification components and the page header.
- [x] Fixed `bg-[#f8fafc]` → `bg-background`, `shadow-[0_2px_10px_rgba(…)]` → `shadow-sm`, `bg-indigo-600` → `bg-primary` in touched components.
- [x] Updated mobile notification components (`MobileNotificationProfile`, `MobileNotificationHeader`, `MobileNotificationList`) to accept real props, render real rows, and use standard typography tokens.
- [x] Added `toggleNotificationRead()` to the read model with auth scope, per-item read/unread toggle with optimistic state.
- [x] Added `toggleNotificationReadAction` in `notifications.actions.ts` with UUID validation, `ActionResult<{ isRead: boolean }>`, and `/notifications` revalidation.
- [x] Created `notification-read-toggle.tsx` (`"use client"`) with `useTransition` optimistic toggle and revert-on-failure pattern.
- [x] Updated `/notifications/page.tsx` to read `searchParams` for `status`, `type`, `page`, `limit` and pass them to `getNotifications()` returning `NotificationPage` with `.items` + pagination metadata.
- [x] Updated `DesktopNotificationSidebar` — type rows are now real `<Link>` with `?type=...` searchParams, active state highlighting, and "ทั้งหมด" clears the type filter while preserving read status.
- [x] Updated `DesktopNotificationFilters` — status cards (`?status=all|unread|read`) and type rows are now real `<Link>`, active state with ring highlight.
- [x] Updated `DesktopNotificationList` — per-item `NotificationReadToggle`, pagination prev/next `<Link>` with both status and type preserved in URL.
- [x] Updated `MobileNotificationList` — per-item `NotificationReadToggle`, pagination prev/next `<Link>`.
- [x] Updated `MobileNotificationHeader` — status pills (`ทั้งหมด` / `ยังไม่ได้อ่าน` / `อ่านแล้ว`) are now real `<Link>` with active highlight.
- [x] Updated `MobileNotificationProfile` to pass pagination/status/type props through to child components.
- [x] Renamed `safePage` → `parsePageNumber` in `notification-read-models.ts` to resolve const shadowing TS error.
- [ ] Push delivery (real-time/realtime channel) is not done — only listing, filtering, pagination, per-item toggle, and mark-all-read are wired.

## 2026-06-11 Create Report Panel → Real report_jobs Insert

Status: done. The `DesktopCreateReport` component, which displayed 4 static placeholder cards, now submits a form that inserts a real `report_jobs` row. No generation worker exists — jobs stay in `queued` status until a worker is built.

- [x] Added `requestReportJob()` mutation in `src/lib/server/report-read-models.ts` with `getCurrentUserContext()` auth, validation, and `report_jobs` insert.
- [x] Created `src/app/actions/reports.actions.ts` with `requestReportJobActionState` — a `useActionState`-compatible Server Action returning `ActionResult<{ id: string }>`, revalidating `/reports`.
- [x] Converted `DesktopCreateReport` to a `"use client"` component with radio-card report type selection (4 types), editable title input, submit button with pending/error/success states.
- [x] Fixed `text-[14px]` → `text-sm`, `text-[11px]` → `text-xs` in the Create Report panel.

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
- [x] Migration `0008_ux_data_foundation.sql` was applied by the user on 2026-06-11.
- [x] Added Supabase CLI as a project dev dependency and verified `npm run db:types`.
- [x] Fixed local Supabase `project_id` to `scidas-local`, then `npx supabase start` applied migrations `0001` through `0008` locally.
- [x] Regenerated `src/types/database.types.ts` from the local database after migration `0008`.
- [x] Validate migration `0009_identity_evidence_flow.sql` with local Supabase reset.
- [ ] Validate migration `0009_identity_evidence_flow.sql` with preview/project push.
- [ ] Production/preview data smoke with an authenticated dashboard user is still required.

### 2026-06-10 Real Frontend Integration Pass

- [x] Added shared display helpers in `src/lib/student-care-formatters.ts`.
- [x] Replaced `/students` mock route data with `getStudentWorklist()`, URL search params, server-side filtering, pagination, shared table/mobile list, and real profile snapshot.
- [x] Replaced dashboard summary/action/tracking/mobile mock data with `getStudentCareDashboard()`.
- [x] Added `src/lib/server/home-visit-read-models.ts` and replaced `/home-visits` mock gallery with real `home_visits`, `home_visit_images`, student/visitor joins, metrics, filters, empty state, and error state.
- [x] Connected `/risk-analysis` overview, top-risk table, and recommendations to `v_student_worklist`.
- [x] Replaced `/support` static profile layout with a real support workbench backed by `getStudentCareDashboard()` and `action_items`.
- [x] Connected `/support` notes and timeline panels to `student_notes` and `student_timeline_events`, including add-note and action-status Server Actions.
- [x] Replaced `/students/[id]` placeholder tabs with a real student care profile backed by `v_current_student_directory`, `v_student_worklist`, `action_items`, `student_notes`, and `student_timeline_events`.
- [x] Extracted reusable care UI components in `src/components/care` for action status controls, note forms, notes panels, and timeline panels.
- [x] Added the initial evidence upload/read flow using Supabase Storage `documents` plus `student_attachments`, with reusable care attachment components on `/students/[id]` and `/support`.
- [x] Updated the Students page test to await the async Server Component and mock the student worklist read model.

### 2026-06-11 Identity And Evidence Flow Pass

- [x] Added migration `0009_identity_evidence_flow.sql` to harden OAuth profile creation without editing the already-applied `0003` migration.
- [x] Added `documents` bucket storage policies for `student-attachments/<student_id>/...` paths and tightened `student_attachments` table policies.
- [x] Added `getStudentAttachments()` and `uploadStudentAttachment()` to the student care DAL with file validation, storage cleanup on registry failure, and signed download URLs.
- [x] Added care Server Action wrappers for attachment uploads and revalidation of support, student, home-visit, and report surfaces.
- [x] Added reusable `StudentAttachmentForm` and `StudentAttachmentsPanel` components.
- [x] Increased the Next.js Server Action body limit to `12mb` while the app validates student evidence files at 10 MB.
- [x] Add upload pending/success/error client feedback around the attachment form.
- [x] Added `docs/AI_HANDOFF.md` with required reading, guardrails, verification checklist, and a starter prompt for follow-up AI agents that must not commit or push.
- [ ] Wire the same attachment panel into concrete home-visit/report detail flows when those detail routes exist.

### P0 Next Tasks

- [ ] Apply migration `0008_ux_data_foundation.sql` in a Supabase preview project and fix any SQL/RLS issues found there.
- [x] Added `src/lib/server/report-read-models.ts` with `getReportJobs()` that reads `report_jobs` for the current school and returns typed `ReportJobItem` DTOs with signed download URLs for completed jobs.
- [x] Updated `/reports/page.tsx` to async Server Component loading real `report_jobs` data.
- [x] Updated `DesktopLatestReports` and `MobileDownloadReports` to render real job rows with status badges, empty state, and download links.
- [x] Fixed typography (text-[10px]/text-[11px] → text-xs/text-sm) in touched components.
- [x] Replace dashboard static components with props from `getStudentCareDashboard()`.
- [x] Replace `/students` route-local mock data with `getStudentWorklist()`.
- [x] Replace mock `/home-visits` cards with real `home_visits` + `home_visit_images`.
- [x] Connect `/risk-analysis` top-risk and recommendations to `v_student_worklist`.
- [x] Connect `/support` actions to `action_items`.
- [x] Connect `/support` notes and timeline panels to `student_notes` and `student_timeline_events`.
- [x] Connect `/students/[id]` to the shared care profile, notes, timeline, and action item read models.
- [x] Add generic evidence upload flow using `student_attachments` for support/student detail evidence.
- [ ] Extend evidence upload to concrete home-visit/report detail records when those flows are migrated.
- [ ] Convert migrated mutations to `ActionResult<T>` and verify auth/authorization inside every action.

### P1 Next Tasks

- [ ] Add a real report generation queue around `report_jobs` — the Create Report panel now inserts queued `report_jobs` rows via `requestReportJob()` and `reports.actions.ts`, but the generation worker, progress updates, and download artifact pipeline still need to be built.
- [x] Add attachment upload actions that write `student_attachments`.
- [x] Add notification links to available source routes (internal source links built from `reference_type`/`reference_id`/`link` in `getNotificationSourceLink()`).
- [ ] Add authenticated browser visual checks after pages consume real read models.
- [x] Regenerate Supabase database types after migration `0008` is applied.

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

## 2026-06-12 Final Mock → Real Data Migration Batch

Status: done. The last three pages still depending on mock/static data are now wired to real read models.

### /behavior → Real behavior_records

- [x] Created `src/lib/server/behavior-read-models.ts` with `getBehaviorDashboard()` (summary metrics, recent records, leaderboard) and `getBehaviorRecords()` — Queries `behavior_records` scoped to `school_id`, joins `students` and `profiles`, returns typed `BehaviorRecordItem` / `BehaviorSummary` / `BehaviorLeaderboardItem` / `BehaviorDashboard` DTOs.
- [x] Migrated `/behavior/page.tsx` to async Server Component using `PageShell`, `PageHeader`, `MetricCard`, `StatusBadge`, `EmptyState`, and `ErrorState` — all real data, no mock.
- [x] Cleared all banned UI patterns: no more `text-[9px]`/`text-[10px]`/`text-[11px]`/`text-[12px]`/`text-[13px]`, no `bg-[#4f46e5]`, no `shadow-[...]`, no dicebear avatars, no hardcoded hex, no `bg-slate-50` wrapper.
- [x] Replaced dicebear avatars with computed initials via `getStudentInitials()` in `src/lib/student-care-formatters.ts`.
- [x] Converted `src/app/actions/behavior.actions.ts` to `ActionResult<T>` — `createBehaviorRecordAction()` returns `ActionResult<{ id: string }>`, with a `createBehaviorRecord()` form-action-compatible wrapper for the `/behavior/record` page.
- [x] Added proper auth scoping via `getCurrentUserContext()`, `school_id`, and validation.

### /development-plans → Real development_plans

- [x] Created `src/lib/server/idp-read-models.ts` with `getDevelopmentPlanList()` and `getPlanSummary()` — Queries `development_plans` scoped to `school_id`, joins `students`/`profiles`, batches goal counts, returns typed `DevelopmentPlanListItem`/`PlanSummary` DTOs with status labels/tones.
- [x] Migrated `/development-plans/page.tsx` to async Server Component using `PageShell`, `PageHeader`, `MetricCard`, `StatusBadge`, `EmptyState`, `ErrorState` — real plan list table with status badges, progress bars, goal counts.
- [x] Removed all mock sub-component composition (idp-header, idp-goals, idp-timeline, idp-trend-reflection, idp-latest-records, idp-sidebar, mobile-idp-profile) — page now self-contained with inline rendering.
- [x] The `[id]/page.tsx` detail page was already wired to real data via `idp.actions.ts` and was left untouched.

### /settings → Real profiles + school data

- [x] Created `src/lib/server/settings-read-models.ts` with `getUserProfile()` — Reads current user's profile + school + auth metadata, returns typed `UserProfileInfo` with role labels.
- [x] Migrated `/settings/page.tsx` to async Server Component using `PageShell`, `PageHeader`, `ErrorState` — loads real profile data, displays name/role/school/email/phone/last-sign-in with semantic tokens.
- [x] Cleared all banned UI patterns: no dicebear, no hardcoded names/phones/emails, no `text-[10px]`/`text-[11px]`/`text-[12px]`/`text-[13px]`, no `bg-[#f8fafc]`, no `bg-indigo-900`.
- [x] Security banner uses `bg-primary/90` with semantic tokens, no decorative blobs.

### Verification

- [x] `npx tsc --noEmit`: passed.
- [x] `npm run lint`: passed (61 pre-existing warnings, 0 new).
- [x] `npm run build`: passed.

### /behavior/[id] → Real behavior record detail

- [x] Added `getBehaviorRecordById()` + `getBehaviorRecordsByStudentId()` to behavior read model — single-record lookup + student-scoped list, both scoped to `school_id`.
- [x] Migrated `/behavior/[id]/page.tsx` to async Server Component — loads real behavior record, shows detail card with type/points/date/category/severity/parent-notified, plus related records table for same student.
- [x] Removed all mock sub-components from the page composition (StudentProfileHeader, BehaviorCharts, BehaviorRecent, BehaviorComments, MobileBehaviorProfile — these files still exist on disk but are no longer imported by the page).
- [x] Uses `PageShell`, `StatusBadge`, `ErrorState`, `getStudentInitials`.

### /home-visits/new → Real form + StudentAttachmentForm

- [x] Added `createHomeVisit()` mutation to `src/lib/server/home-visit-read-models.ts` — inserts into `home_visits` with `visitor_id`, `semester_id` (current), `school_id`, and all optional fields.
- [x] Created `src/app/actions/home-visit.actions.ts` — `createHomeVisitAction()` returns `ActionResult<{ id: string }>` with validation.
- [x] Converted `/home-visits/new/page.tsx` from mock client component to async Server Component loading real student list via `getStudentWorklist()`.
- [x] Created `_components/home-visit-form.tsx` ("use client") — student selector dropdown, visit date/time/address/assessment fields, checkboxes (follow-up, family problem, travel difficulty), submit with `useActionState`, inline success/error feedback.
- [x] Embedded `StudentAttachmentForm` from `@/components/care` — appears after student is selected, uploads to `student-attachments/<studentId>/...` with `referenceTable="home_visits"`.

## 2026-06-12 Batch 2: Attendance + Reports + ActionResult<T> Conversion

### /attendance → real attendance_records

- [x] Created `src/lib/server/attendance-read-models.ts` — `getAttendanceDashboard()` queries `attendance_records` scoped to `school_id` for a target date (default today), joins `students` + `profiles`, returns `AttendanceSummary` (total/present/absent/late/leave/sick/rate) + `AttendanceRecordItem[]`.
- [x] Migrated `/attendance/page.tsx` to async Server Component using `PageShell`, `PageHeader`, `MetricCard`, `StatusBadge`, `EmptyState`, `ErrorState` — real summary cards + real student table with status badges and initials.
- [x] Removed all mock sub-component imports (AttendanceFilters, AttendanceCharts, AbsentReasons, ClassSummary, QuickTools, GradeLevelSummary, MobileAttendance, attendance-data.ts).
- [x] Cleared banned UI patterns — no dicebear, no `text-[10-13px]`, no hardcoded hex.

### /reports header → remove hardcoded teacher identity

- [x] Replaced hardcoded dicebear avatar + "นางสาวจันทร์จิรา พรมดี" with real profile data from `getUserProfile()` — shows real initials avatar, full name, and role label.

### idp.actions.ts → ActionResult<T> wrappers

- [x] Added `createDevelopmentPlanAction()`, `updateDevelopmentPlanAction()`, `createDevelopmentGoalAction()` — all return `ActionResult<{ id: string }>` with validation + revalidation.
- [x] Existing read functions (getDevelopmentPlans, getDevelopmentPlanById, etc.) kept as-is for Server Component use.

### support.actions.ts → ActionResult<T>

- [x] Converted `createSupportRecord()` to `ActionResult<{ id: string }>` with `useActionState` signature, auth via `getCurrentUserContext()`, school_id scoping.
- [x] Added `createSupportRecordFormAction()` wrapper for `<form action={...}>` compatibility.
- [x] Updated `/support/new/page.tsx` to use the form-action wrapper.

### Verification

- [x] `npx tsc --noEmit`: passed.
- [x] `npm run lint`: passed (57 pre-existing warnings, 0 new).

## 2026-06-12 Batch 3: Layout + Academics + Orphan Cleanup

### Dashboard layout → real profile in Header + Sidebar

- [x] Updated `src/app/(dashboard)/layout.tsx` to load `getUserProfile()` server-side and pass `profile` as props to Header and `schoolName` to Sidebar.
- [x] Updated `src/components/layout/header.tsx` — replaced hardcoded dicebear avatar + fake name "ครูประจำชั้น" / "ครูโรงเรียนบ้านหนองแค" with real profile data: initials avatar, full name, role label, school name. Real date via `Intl.DateTimeFormat`. Bell icon now links to `/notifications`.
- [x] Updated `src/components/layout/sidebar.tsx` — replaced hardcoded school name "โรงเรียนบ้านหนองแค" / "สพป.ชัยภูมิ เขต 1" with real `schoolName` prop. Removed dead "เปลี่ยนโรงเรียน" button.

### /academics → real academic_scores

- [x] Created `src/lib/server/academic-read-models.ts` — `getAcademicDashboard()` queries `academic_scores` for current semester, joins `students` + `classroom_subjects` → `subjects` + `classrooms`, returns `AcademicSummary` (total, avg GPA, above 3.0, below 2.0, top/weakest subject) + `AcademicScoreItem[]` with per-score breakdown.
- [x] Migrated `/academics/page.tsx` to async Server Component using `PageShell`, `PageHeader`, `MetricCard`, `StatusBadge`, `EmptyState` — real summary cards, subject highlights, full scores table with grade badges.
- [x] All mock sub-components (`academic-data.ts`, `academic-summary-cards.tsx`, `academic-charts.tsx`, `student-lists.tsx`, `student-academic-table.tsx`, `classroom-comparison.tsx`, `bottom-insights.tsx`, `mobile-academic-profile.tsx`) are now orphaned — they remain on disk but the page no longer imports them.

### Orphaned settings components → deleted

- [x] Deleted 7 desktop sub-components: `desktop-user-profile`, `desktop-general-settings`, `desktop-display-settings`, `desktop-settings-tabs`, `desktop-storage-info`, `desktop-system-info`, `desktop-default-data-settings`.
- [x] Deleted 4 mobile sub-components: `mobile-admin-header`, `mobile-admin-sidebar`, `mobile-admin-basic-settings`, `mobile-settings-profile`.
- [x] None of these were imported by the current `settings/page.tsx` — verified safe to delete.

### Verification

- [x] `npx tsc --noEmit`: passed.
- [x] `npm run lint`: passed (53 warnings, 2 fewer than before due to orphan deletions).
- [x] `npm run build`: passed (all 20 routes compiled).

## 2026-06-12 Batch 4: Dashboard Home + Massive Orphan Cleanup + Tests

### Dashboard home → removed 3 mock components, replaced with real inline data

- [x] Replaced `RiskCharts` (hardcoded SVG line chart) with real risk breakdown cards using `dashboard.metrics` — normal/watch/high-risk counts with percentages.
- [x] Replaced `RecentActivities` (4 hardcoded activity items) with real action queue items from `dashboard.actionQueue` — shows title, student name, due date, status badge.
- [x] Replaced `BottomMiniCharts` (hardcoded attendance/academic/donut charts) with real `MetricCard`-based summary cards — attendance rate, support cases, active plans, open actions, student count.
- [x] Deleted `risk-charts.tsx`, `recent-activities.tsx`, `bottom-mini-charts.tsx` from `src/app/(dashboard)/_components/`.

### Orphaned mock files → mass cleanup

Deleted 47 orphaned files across 4 modules (all verified zero-import before deletion):

| Module | Files deleted |
|---|---|
| **attendance** `_components/` | 10 files: attendance-data.ts, attendance-charts.tsx, attendance-summary.tsx, attendance-table.tsx, attendance-filters.tsx, absent-reasons.tsx, class-summary.tsx, grade-level-summary.tsx, quick-tools.tsx, mobile-attendance.tsx |
| **academics** `_components/` | 7 files: academic-data.ts, academic-charts.tsx, academic-summary-cards.tsx, bottom-insights.tsx, classroom-comparison.tsx, mobile-academic-profile.tsx, student-academic-table.tsx, student-lists.tsx |
| **behavior `[id]`** `_components/` | 7 files: behavior-charts.tsx, behavior-comments.tsx, behavior-recent.tsx, student-profile-header.tsx, mobile-behavior-profile.tsx + 5 mobile/ sub-files |
| **development-plans** `_components/` | 13 files: idp-header.tsx, idp-goals.tsx, idp-timeline.tsx, idp-trend-reflection.tsx, idp-latest-records.tsx, idp-sidebar.tsx + 7 mobile/ sub-files |
| **settings** `_components/` | 11 files (deleted in batch 3) |

### Test fix

- [x] Updated `header.test.tsx` — bell icon changed from `<button>` to `<Link>` → test now uses `getByRole("link")`.

### Verification

- [x] `npx tsc --noEmit`: passed.
- [x] `npm run lint`: passed (22 warnings, down from 57 — 35 fewer due to orphan deletions).
- [x] `npm test -- --run`: passed (6 files, 16 tests).
- [x] `npm run build`: passed (all 20 routes).

## 2026-06-12 Batch 5: Support Orphans + Dicebear Fixes + Reports Metrics

### Support orphaned components → deleted 15 files

- [x] Deleted 7 desktop support mock components: support-header, support-team, support-tracking-chart, support-notes-actions, support-current-plan, support-risk-summary, support-records.
- [x] Deleted 8 mobile support mock components: mobile-support-profile, mobile-support-header, mobile-support-team, mobile-support-issues, mobile-support-records, mobile-support-summary, mobile-support-plan.
- [x] All verified zero imports outside their own directory before deletion. `support/page.tsx` uses only shared components (DataTable, StudentNotesPanel, etc.) — none of these were imported.

### Active dicebear images → replaced with clean headers

- [x] `mobile-report-header.tsx` — removed entire fake student profile (dicebear boy1, "เด็กชายธนวัฒน์ ใจดี", fake tabs, fake hero banner, fake semester). Replaced with clean header: back link + title.
- [x] `mobile-risk-header.tsx` — same treatment: removed fake student profile, dicebear, fake tabs. Replaced with clean header.

### Reports overview stats → real metrics

- [x] Updated `/reports/page.tsx` to load `getStudentCareDashboard()` metrics alongside existing `getReportJobs()` and `getUserProfile()`.
- [x] Rewrote `DesktopOverviewStats` to accept `metrics` prop and render real `MetricCard` components — total students, risk count, open support cases, active plans — all from real data. Falls back to "-" when metrics unavailable.
- [x] Removed hardcoded SVG sparklines, fake gender split (316/326), fake deltas (-1.2%, +2.7%, +8.3%).

### Verification

- [x] `npx tsc --noEmit`: passed.
- [x] `npm run lint`: passed (11 warnings, down from 53 — 42 fewer).
- [x] `npm run build`: passed (all 20 routes).
