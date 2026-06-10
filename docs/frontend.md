# Frontend Design System Rulebook

> **Active status (2026-06-10):** This is the working rulebook for the UX/UI migration. Use it together with [UX_UI_SYSTEM_ROADMAP.md](./UX_UI_SYSTEM_ROADMAP.md). The roadmap defines migration order; this file defines the design and implementation guardrails.

## 1. Product Register

- **Product type:** internal SaaS dashboard for student care, early warning, and IDP workflows.
- **Primary users:** teachers, homeroom teachers, counselors, administrators, and school directors in small schools.
- **Interface tone:** calm, professional, dense enough for repeated work, and easy to scan under time pressure.
- **Default UX priority:** clarity of next action over decoration. A migrated page must answer: "what needs attention, why, and what can the user do next?"

## 2. Source Of Truth

- **Framework:** Next.js 16.2.7 App Router, React 19.2.4.
- **Styling:** Tailwind CSS 4 with CSS variables in `src/app/globals.css`.
- **Fonts:** `Noto_Sans_Thai` from `next/font/google` is the current app font for Thai and Latin text. Do not introduce a second product font during Phase 1.
- **Base primitives:** `src/components/ui/*` for shadcn/Radix-style primitives.
- **Layout ownership:** `src/components/layout/*` is app-shell-owned. Do not make opportunistic layout edits while migrating page content.
- **Roadmap:** `docs/UX_UI_SYSTEM_ROADMAP.md` is the migration plan and acceptance criteria source.

## 3. Token Rules

All repeated visual decisions must route through semantic tokens or shared components. Page-local Tailwind is allowed for layout composition, but not for inventing new colors, shadows, status styles, or card treatments.

### Color Tokens

Use these roles, not one-off colors:

| Role | Use |
|---|---|
| `background` | Dashboard canvas and page background |
| `foreground` | Primary text |
| `card` / `card-foreground` | White or dark-mode surface text pair |
| `muted` / `muted-foreground` | Secondary panels, helper text, table metadata |
| `border` | Structural separation |
| `primary` / `primary-foreground` | Main actions, active navigation, important selected state |
| `accent` / `accent-foreground` | Low-emphasis selected or hover state |
| `destructive` / `destructive-foreground` | Destructive action or danger state |
| `ring` | Focus ring and active form control ring |

Status color must use a semantic mapping instead of raw "pretty" colors:

| Status | Soft Treatment | Solid Treatment |
|---|---|---|
| `normal` / `success` | `bg-emerald-50 text-emerald-700 border-emerald-200` | `bg-emerald-600 text-white` |
| `watch` / `warning` | `bg-amber-50 text-amber-800 border-amber-200` | `bg-amber-500 text-slate-950` |
| `high-risk` / `danger` | `bg-red-50 text-red-700 border-red-200` | `bg-red-600 text-white` |
| `info` | `bg-blue-50 text-blue-700 border-blue-200` | `bg-blue-600 text-white` |
| `neutral` | `bg-slate-100 text-slate-700 border-slate-200` | `bg-slate-700 text-white` |

Rules:

- Never place gray text (`text-slate-*`, `text-muted-foreground`) on saturated colored backgrounds.
- Status colors cannot be the only signal. Pair them with labels, icons, or structured copy.
- Hard-coded hex, rgb, hsl, and arbitrary color classes are banned in page components except inside token definition files.
- Chart colors should come from a shared chart/status palette, not ad hoc page colors.

### Typography

Use a compact product scale:

| Role | Tailwind class |
|---|---|
| Page title | `text-2xl font-semibold` desktop, `text-xl font-semibold` mobile |
| Section title | `text-lg font-semibold` or `text-base font-semibold` in dense panels |
| Card title | `text-base font-semibold` |
| Body | `text-sm` or `text-base` |
| Metadata / helper text | `text-xs` |
| Table cell | `text-sm` |
| Badge | `text-xs font-medium` |

Rules:

- Do not scale fonts with viewport width.
- Do not use negative letter spacing.
- Avoid `font-bold` except for rare emphasis such as key totals. Prefer `font-medium` and `font-semibold`.
- `text-[10px]`, `text-[11px]`, and `text-[12px]` are banned for normal UI content. Use `text-xs` at minimum.
- Long Thai labels must wrap cleanly; do not force cramped one-line buttons or cards.

### Radius

| Element | Default | Maximum |
|---|---|---|
| Buttons, inputs, selects | `rounded-lg` | `rounded-xl` only for large touch targets |
| Cards and panels | `rounded-lg` | `rounded-xl` |
| Tables and toolbars | `rounded-lg` | `rounded-xl` |
| Badges and pills | `rounded-md` or `rounded-full` | `rounded-full` |
| Avatars | `rounded-full` | `rounded-full` |

Rules:

- `rounded-2xl` and `rounded-3xl` are not allowed for dashboard cards or page panels during migration.
- Full radius is reserved for avatars, pills, switches, and circular icon affordances.
- Cards inside cards are banned. Use sections or nested rows instead.

### Shadows And Elevation

Use a quiet SaaS hierarchy:

| Level | Class | Use |
|---|---|---|
| Flat | `border border-border shadow-none` | Tables, dense panels, settings sections |
| Raised | `border border-border shadow-sm` | Default cards and popovers |
| Overlay | `shadow-lg` with tokenized border | Dialogs, dropdowns, sheets |

Rules:

- Arbitrary shadows such as `shadow-[...]` are banned in page code.
- Do not combine large blur shadows with pastel cards to create decorative glow.
- Use borders before shadows when the UI needs separation.

### Spacing And Layout

- Page padding should be centralized in `PageShell` once available.
- Default page gap: `gap-4` mobile, `md:gap-6` desktop.
- Default card padding: `p-4` mobile, `md:p-5` or `md:p-6` desktop.
- Data-heavy screens should prefer dense but breathable grids over marketing-style hero layouts.
- Fixed-format elements such as tables, charts, nav items, metric cards, and icon buttons need stable dimensions to prevent layout shift.

## 4. Component Usage Contracts

### App Shell

Target shared layout primitives:

- `PageShell`: page background, max width, responsive padding, mobile bottom-nav spacing.
- `PageHeader`: title, description, primary action, secondary actions, breadcrumbs.
- `PageToolbar`: search, filters, date range, view switch, export.
- `Section`: section heading, description, action slot, spacing.

Until those exist, do not add new page-local shell patterns. Keep page changes small and ready to migrate into these contracts.

### Product Components

Target shared components:

- `MetricCard`: metric, label, delta, status, icon, compact and regular variants.
- `StatusBadge`: `normal`, `watch`, `high-risk`, `success`, `warning`, `danger`, `info`, `neutral`.
- `StudentIdentity`: avatar, full name, class, student code, risk/status.
- `ChartCard`: title, description, action slot, legend, fixed-height chart area, empty state.
- `DataTable`: desktop table with loading, empty, error, pagination, sticky action column only when needed.
- `MobileList`: mobile representation of the same view model used by `DataTable`.
- `FilterBar`: search, select filters, clear action, responsive wrapping.
- `FormSection` and `SubmitBar`: consistent forms and submit/error state.
- `EmptyState`, `ErrorState`, `LoadingState`, `PermissionState`: consistent feedback states.

Rules:

- Prefer a shared component over route-local `_components` when the behavior repeats in more than one module.
- Mobile and desktop should share data/view models. Split rendering only when the interaction is genuinely different.
- Do not add a new `_components/mobile/*` variant if a responsive shared component can express the same workflow.
- Use Lucide icons for standard actions and status affordances.

## 5. Server/Client UX Flow

- Pages and layouts are Server Components by default in Next.js 16. Keep them server-first.
- Client Components should be limited to state, event handlers, browser APIs, charts that require the client, and form interaction.
- Data-heavy dashboard routes should read through `src/lib/server/student-care-read-models.ts` or another server-only DAL module before adding new page-local queries or mock data.
- Student list, risk, support, dashboard, and student detail routes should prefer `getStudentWorklist()`, `getStudentCareDashboard()`, `getActionQueue()`, and `getStudentTimeline()` where applicable.
- Internal mutations should use Server Actions, not API routes, unless the endpoint is for webhooks or external integrations.
- Mutated pages must surface pending, success, validation error, and unexpected error states.
- Server Actions should return the shared `ActionResult<T>` contract documented in `docs/API_SPECIFICATION.md` when a module is migrated.
- After mutation, use the smallest correct revalidation path or redirect. Avoid broad refreshes unless the page depends on multiple unknown sources.

## 6. Banned Patterns

These patterns block a page from being considered migrated:

- Glassmorphism, blurred translucent panels, decorative orbs, bokeh, and arbitrary SVG blobs.
- Gradient text for data or headings.
- Non-token gradients and non-token custom shadows in product UI.
- Side-stripe borders such as `border-l-4` unless they are a deliberate alert affordance.
- Hard-coded hex/rgb/hsl colors in route pages or route-local components.
- `text-[10px]`, `text-[11px]`, `text-[12px]` for normal content.
- `rounded-2xl` or `rounded-3xl` on cards, panels, metric tiles, and page sections.
- Gray text on saturated colored backgrounds.
- Card grids where every card has the same visual weight but no clear task priority.
- Page-local desktop/mobile forks that duplicate the same business logic.
- Visible in-app copy that explains the UI implementation rather than helping the user act.

## 7. Migration Gate

A page is not Phase 1 ready until it passes this checklist:

- Uses the current Next.js 16 route structure and does not create phantom routes such as `/menu`.
- Uses or is ready to use `PageShell`, `PageHeader`, `PageToolbar`, and `Section`.
- Uses shared status, metric, chart, table/list, form, and feedback contracts where applicable.
- Has loading, empty, error, permission, and pending mutation states.
- Has no banned typography, color, radius, shadow, gradient, or glass patterns.
- Has no horizontal overflow at mobile, tablet, laptop, and desktop widths.
- Has readable contrast for all status and action states.
- Has visible keyboard focus and touch targets of at least 44px for primary mobile actions.
- Passes lint, typecheck, tests, build, and post-login visual smoke checks for migrated routes.

## 8. Verification Commands

Baseline technical checks:

```bash
npm run lint
npx tsc --noEmit
npm test -- --run
npm run build
```

Visual checks required for migrated dashboard pages:

- Authenticated browser pass for desktop, laptop, tablet, and mobile.
- Screenshot review for overlap, truncation, contrast, and empty/loading/error states.
- Static scan for banned patterns before marking the page migrated.
