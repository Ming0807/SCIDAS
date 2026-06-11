# UX/UI System Roadmap

วันที่ตรวจ: 2026-06-10
ขอบเขต: SCIDAS dashboard, navigation, page layout, reusable components, frontend flow, documentation, and future migration plan
เกณฑ์อ้างอิง: `$impeccable` product register, current source code, static detector, browser pre-auth audit, and the previous technical health check

## Executive Summary

ระบบตอนนี้ไม่ควรแก้ด้วยการไล่แต่งทีละหน้าเป็นหลักอีกแล้ว เพราะปัญหาซ้ำอยู่ในระดับระบบกลาง ได้แก่ navigation ไม่เป็น source of truth เดียว, component แยกตามหน้าจำนวนมาก, token สี/ขนาด/เงาไม่สม่ำเสมอ, mobile และ desktop หลายหน้าทำ logic ซ้ำกัน, และเอกสาร architecture ยังอ้าง Next.js 15 กับ route structure เก่าทั้งที่โปรเจกต์จริงใช้ Next.js 16.2.7

แนวทางที่ดีที่สุดคือทำ `System Reset แบบควบคุมความเสี่ยง`: สร้าง design system และ app shell กลางก่อน จากนั้นค่อย migrate แต่ละหน้าด้วย component contract เดียวกัน พร้อมตรวจ lint, type, test, build, responsive, accessibility และ visual regression ทุก wave

> Update 2026-06-10: Page-by-page UI migration is paused until the backend data foundation is applied and verified. Use `docs/BACKEND_DATA_ARCHITECTURE.md`, `supabase/migrations/0008_ux_data_foundation.sql`, and `src/lib/server/student-care-read-models.ts` as the required data source before replacing any remaining mock/static route data.

> Update 2026-06-10 later pass: initial real-data frontend integration is now in place for `/`, `/students`, `/home-visits`, `/risk-analysis`, and `/support`. The remaining blocker for production verification is applying migration `0008_ux_data_foundation.sql` in Supabase and running authenticated visual checks.

> Update 2026-06-11: the user applied migration `0008_ux_data_foundation.sql`. Supabase CLI is now available as a project dev dependency, local Supabase start applies migrations `0001` through `0008`, and generated database types are refreshed. `/support` and `/students/[id]` now connect action status changes, student notes, and care timeline to the shared backend layer. Remaining verification blocker: authenticated visual/data smoke checks against a real session.

> Update 2026-06-11 evidence pass: migration `0009_identity_evidence_flow.sql` hardens OAuth profile creation and adds storage policies for `documents/student-attachments/<student_id>/...`. `/support` and `/students/[id]` now share a reusable evidence attachment panel backed by `student_attachments`, including inline pending, success, and error feedback. Remaining UX work is wiring concrete home-visit/report detail flows.

> Update 2026-06-11 reports pass: `/reports` now reads `report_jobs` through `src/lib/server/report-read-models.ts`. `DesktopLatestReports` and `MobileDownloadReports` render real job data with status badges, empty state, and signed download URLs for completed outputs. The page itself is now an async Server Component.

## Evidence From Current Audit

### Technical Health Baseline

- `npm run lint`: ผ่านแล้ว แต่ยังเหลือ warning จำนวนมาก โดยเฉพาะ `<img>` ที่ควรใช้ `next/image`, unused import, unused variable
- `npx tsc --noEmit`: ผ่านแล้ว
- `npm test -- --run`: ผ่านแล้ว
- `npm run build`: ผ่านแล้ว
- Stack จริงใน `package.json`: Next.js `16.2.7`, React `19.2.4`, Tailwind CSS `4`

### UX/UI Static Findings

- พบ dashboard route หลัก 18 route รวม `/`, `/students`, `/attendance`, `/academics`, `/behavior`, `/risk-analysis`, `/support`, `/development-plans`, `/reports`, `/settings`, `/notifications`, `/home-visits`
- พบ component ใต้ `src/app/(dashboard)` ประมาณ 120 ไฟล์ แสดงว่ามี page-local component มาก และเสี่ยงต่อ pattern ซ้ำกับ drift ระหว่างหน้า
- `$impeccable` detector เจอ `gray-on-color` 16 จุด เช่น `text-slate-600` บน `bg-emerald-500`, `bg-red-500`, `bg-blue-500` และ `text-slate-400` บน `bg-blue-50`
- ยังพบ `text-[10px]`, `text-[11px]`, `text-[12px]` จำนวนมากในหลาย module แม้ `task.md` เดิมระบุว่าเคยแก้แล้ว
- ยังพบ hard-coded hex color, custom shadow, gradient, glass-like treatment, SVG color แบบกระจายหลายไฟล์
- ยังพบ `rounded-3xl` ในหลาย mobile components และบางหน้า
- `src/components/layout/mobile-bottom-nav.tsx` มีเมนู `href="/menu"` แต่ไม่มี route `/menu` ใน route list
- desktop sidebar และ mobile bottom nav ใช้ navigation คนละชุด ทำให้ taxonomy และ active state มีโอกาสเพี้ยน

### Browser Audit

หลักฐานถูกเก็บไว้ที่ `.impeccable/critique/2026-06-10-system-ux-audit/`

- route ที่ตรวจด้วย browser ถูก redirect ไป `/login` เมื่อยังไม่ authenticate
- ไม่พบ horizontal overflow ในหน้า pre-auth ที่เปิดได้
- screenshot ของ route หลักก่อน login ถูกเก็บไว้ใน `screenshots/`
- ข้อจำกัด: ยังไม่ได้ตรวจ post-login visual state ของ dashboard จริง เพราะ browser session ไม่มี auth state

## Main Diagnosis

### 1. App Shell ยังไม่มี contract กลาง

ปัจจุบัน `(dashboard)/layout.tsx` มี Sidebar, Header, MobileBottomNav แต่หน้าแต่ละ route ยังจัด padding, title, toolbar, grid, card และ responsive เอง ทำให้ spacing และ hierarchy ต่างกันง่าย

สิ่งที่ควรมี:

- `PageShell`: กำหนด content width, page padding, bottom spacing สำหรับ mobile nav, และ background
- `PageHeader`: title, description, primary action, secondary actions, breadcrumbs
- `PageToolbar`: filter, search, view switch, date range, export
- `Section`: section heading และ spacing มาตรฐาน
- `ResponsiveContent`: layout rule เดียวสำหรับ desktop/tablet/mobile

### 2. Navigation ยังไม่เป็น source of truth เดียว

ตอนนี้ desktop sidebar, mobile bottom nav, breadcrumbs และ route list ไม่ได้ดึงจาก config เดียวกัน จึงเกิด `/menu` ที่ไม่มี route และ mobile เห็น module ไม่ครบ

สิ่งที่ควรมี:

- `src/lib/navigation.ts` เป็น route taxonomy เดียว
- แยก `primaryNav`, `secondaryNav`, `mobilePrimaryNav`, `moduleNav`, `roleNav`
- mobile ปุ่ม "เมนู" ควรเปิด `Sheet` ที่แสดง module ทั้งหมด หรือสร้าง route `/menu` จริง แต่ทางที่เหมาะกว่าคือใช้ `Sheet` เพราะไม่ต้องเพิ่ม route ที่ไม่มีข้อมูลเฉพาะ
- breadcrumbs ต้อง map จาก navigation config ไม่ใช่แปลง pathname แบบ manual

### 3. Design tokens ยังไม่คุมระบบจริง

มี `globals.css` และ `docs/frontend.md` แต่โค้ดยังใช้ hard-coded color, custom shadow, gradient, arbitrary tiny text และ radius หลายรูปแบบ

สิ่งที่ควรมี:

- semantic tokens ใน `globals.css`
- status token สำหรับ `normal`, `watch`, `high-risk`, `success`, `warning`, `danger`, `info`, `neutral`
- component token สำหรับ `surface`, `border`, `muted`, `focus`, `selected`, `hover`, `chart-*`
- ห้ามใช้ arbitrary hex ใน page/component ยกเว้น token definition
- ห้ามใช้ `text-[10px]` กับ `text-[11px]` ใน UI ปกติ
- ใช้ `rounded-lg` ถึง `rounded-xl` เป็น default สำหรับ product surface

### 4. Component reuse ยังต่ำเกินไป

มี `_components` จำนวนมากในแต่ละ route และมี mobile/desktop components แยกกันมาก ทำให้แก้ UX หนึ่งเรื่องต้องตามหลายสิบไฟล์

สิ่งที่ควรมี:

```text
src/components/ui/            shadcn/base primitives
src/components/layout/        app shell, sidebar, header, mobile nav
src/components/dashboard/     PageShell, PageHeader, MetricCard, StatusBadge
src/components/data/          DataTable, MobileList, FilterBar, Pagination
src/components/charts/        ChartCard, Legend, EmptyChartState
src/components/forms/         FormSection, FieldRow, SubmitBar, ActionResultAlert
src/components/feedback/      EmptyState, ErrorState, LoadingState, PermissionState
src/lib/navigation.ts         route taxonomy and role visibility
src/lib/design/status.ts      status mapping, badge variants, chart colors
```

ระยะสั้นให้คง route structure เดิมใน `src/app/(dashboard)` เพื่อไม่ให้ migration ใหญ่เกินไป แต่เริ่มย้าย component ที่ใช้ซ้ำได้ออกจาก route-local `_components` ไปไว้ใน shared folders ด้านบน

ระยะกลาง หลังระบบนิ่งแล้วค่อยพิจารณา `src/features/<module>` สำหรับ business-heavy modules เช่น `students`, `attendance`, `risk-analysis`, `support`

### 5. Data and action flow ยังควรตั้งมาตรฐานก่อนทำหน้าให้จริง

ควรวาง flow เดียวทุก module:

```text
Route Server Component
  -> service/query function
  -> typed DTO/view model
  -> page client component เฉพาะ interaction
  -> server action สำหรับ mutation
  -> ActionResult<T>
  -> toast/inline result
  -> revalidatePath หรือ optimistic update ตามความเหมาะสม
```

กฎ:

- Server Component รับผิดชอบ initial data
- Client Component รับผิดชอบ interaction เท่านั้น
- filter/sort/pagination ควรผูก URL ด้วย `nuqs` หรือ search params
- server actions ต้อง return shape เดียว เช่น `{ ok, message, data, fieldErrors }`
- ทุกหน้า data-heavy ต้องมี loading, empty, error, permission, and offline-ish fallback state

## Priority Backlog

### P0: Foundation Before More Page Work

- [ ] สร้าง navigation source of truth ที่ `src/lib/navigation.ts`
- [ ] แก้ mobile `/menu`: เปลี่ยนเป็น `Sheet` menu หรือเพิ่ม route จริง โดยแนะนำ `Sheet`
- [ ] สร้าง `PageShell`, `PageHeader`, `PageToolbar`, `Section` และใช้กับหน้า pilot
- [ ] กำหนด design token จริงใน `globals.css` และ update `docs/frontend.md`
- [ ] แก้ detector findings 16 จุดเรื่อง gray text บน colored background
- [ ] อัปเดตเอกสารที่ stale: Next.js 15 -> Next.js 16.2.7 และ route structure จริง
- [ ] เพิ่ม rule ใน task/checklist ว่าห้ามเพิ่ม page-local pattern ใหม่ถ้ามี shared component รองรับแล้ว

### P1: Shared Product Components

- [x] `MetricCard`: metric, delta, icon, status, compact/regular variants
- [x] `StatusBadge`: normal/watch/high-risk/success/warning/danger/info
- [x] `StudentIdentity`: avatar, name, class, student code, risk/status
- [x] `DataTable`: desktop table with sticky action column, loading, empty, pagination
- [x] `MobileList`: mobile equivalent for data rows without duplicating business logic
- [x] `FilterBar`: search, grade, status, date range, clear filters
- [x] `ChartCard`: title, action, legend, empty state, fixed height rules
- [x] `FormSection` and `SubmitBar`: consistent forms across attendance, academics, support, IDP
- [x] `EmptyState`, `ErrorState`, `LoadingState`: consistent feedback

### P2: Page Migration Waves

- [x] Wave 1: app shell, dashboard overview, students list
- [ ] Wave 2: attendance, academics, behavior
  - [x] attendance pilot migrated to shared shell/data/list patterns.
  - [x] academics migrated to shared shell/data/list patterns.
  - [ ] behavior remains.
- [ ] Wave 3: risk-analysis, support, development-plans
  - [x] risk-analysis overview/top-risk/recommendations now read from `v_student_worklist`.
  - [x] support now uses a real action/support workbench backed by `getStudentCareDashboard()`, `getActionQueue()`, `getStudentNotes()`, and `getStudentTimeline()`.
  - [ ] development-plans remains.
- [ ] Wave 4: reports, notifications, settings, home-visits
  - [x] home-visits now reads real `home_visits`/`home_visit_images`.
  - [x] reports now reads `report_jobs` via `src/lib/server/report-read-models.ts` on the async Server Component.
  - [ ] notifications remain.
  - [ ] settings remain.
- [ ] Wave 5: student detail and behavior/detail pages
  - [x] student detail now reads the real care profile, open action items, notes, and timeline.
  - [ ] behavior/detail pages remain.

### P3: Quality Gates and Automation

- [ ] Add visual smoke tests for authenticated dashboard states
- [ ] Add accessibility checks for contrast, focus ring, keyboard flow, tap targets
- [ ] Add responsive checks for desktop, laptop, tablet, mobile
- [ ] Add lint detector or codemod for banned UI patterns: `text-[10px]`, hard-coded hex, arbitrary shadows, `rounded-3xl`, decorative gradients
- [ ] Add page inventory doc with owner, data source, states, and migration status

## Route-Level Plan

### `/` Dashboard

- เปลี่ยนเป็น executive overview ที่ตอบว่า "วันนี้ต้องสนใจอะไร"
- ใช้ `MetricCard`, `RiskStudentList`, `ActionQueue`, `TrendSummary`
- ลด card grid ที่เหมือนกันเกินไป และจัดลำดับความสำคัญตามความเร่งด่วน

### `/students`

- รวม desktop table และ mobile list ให้ใช้ data/view model เดียว: done with `getStudentWorklist()` and URL search params
- filter ควรอยู่ใน `FilterBar`: done
- row action ต้องชัด: view, edit, support, risk
- student profile panel ควรแยกเป็น reusable `StudentIdentity` และ `StudentSnapshot`
- `/students/[id]` now also includes the shared evidence attachment panel; remaining detail work should add academic/attendance drilldowns and edit flows without reintroducing mock tabs.

### `/attendance`

- ใช้ status token เดียวสำหรับ มา/ขาด/ลา/สาย: done for current pilot data and table/list.
- chart ต้องมี legend และไม่ใช้สีเป็นสัญญาณเดียว: current chart keeps labels with tokenized colors.
- form บันทึกการมาเรียนควรใช้ `FormSection`, `SubmitBar`, validation message แบบเดียว: still pending for the dedicated attendance form flow.

### `/academics`

- academic table และ student academic table ควรใช้ `DataTable`: done for current risk-student academic table.
- สีผลการเรียนควรเป็น semantic ไม่ใช้ blue/indigo แบบ decorative: current table/list uses status tones and tokenized chart colors.
- แยก academic score, skill status, and intervention suggestion ให้ชัด: partially done; intervention suggestion flow remains for later form/action work.

### `/behavior`

- แยก incident, positive behavior, assignment status และ follow-up action
- ใช้ timeline/list component เดียวกับ support/development plan เมื่อเป็น event stream
- detail page ควรใช้ `StudentProfileHeader` กลาง

### `/risk-analysis`

- รักษา focus ของ EWS: risk level, factors, suggested action, owner, due date
- chart ควรลด decorative elements และเพิ่ม explainability
- top risk students ต้องเชื่อม action ต่อไป: create support case, create IDP, schedule home visit
- overview, top-risk list, and recommendations now read from `v_student_worklist`; matrix/chart data models still need backend source.

### `/support`

- support case ควรมี lifecycle: open, in progress, resolved, monitoring
- ทีมช่วยเหลือ, current plan, notes, records ควรใช้ shared case components
- หน้า new support ต้องใช้ form contract กลางและ action result กลาง
- main support page now reads the real action queue, priority students, student notes, care timeline, and evidence attachments. Remaining work is the dedicated case lifecycle UI and richer form pending/success feedback.

### `/development-plans`

- IDP ต้องเห็น goal, intervention, owner, next review, progress
- ใช้ timeline และ goal card ที่ไม่ซ้ำกับ support แต่ share primitives
- detail page ต้องแยก read-only summary กับ editable action ชัดเจน

### `/home-visits`

- ต้องมี visit status, next visit, attachment/image state, privacy warning
- mobile ต้องเหมาะกับครูที่กรอกภาคสนาม
- form ควรแยกเป็น steps หรือ sections ที่สั้นและตรวจง่าย
- list/gallery now reads real `home_visits` and `home_visit_images`; the generic `student_attachments` upload flow is available and should be wired into concrete visit detail/edit screens next.

### `/reports`

- report cards ควรเป็น task-oriented: generate, download, schedule, compare
- ลด decorative report list ที่ไม่ได้บอก action
- export state ต้องมี loading/success/error

### `/notifications`

- ต้องมี read/unread, priority, category, related student/case
- mobile list ใช้ common notification row
- notification ควร link ไป action page จริง ไม่ใช่แค่ข้อความ

### `/settings`

- แยก user profile, school profile, system defaults, security, display
- ลด banner decorative และจัดเป็น settings sections
- role/permission settings ต้องผูกกับ RBAC ที่ใช้งานจริง

### `/login`

- Pre-auth page ตอนนี้ไม่มี overflow ใน browser audit
- ควรตรวจ copy, loading state, Google auth error state, และ redirect target หลัง login

## Documentation Plan

เอกสารที่ควรปรับตามลำดับ:

1. `task.md`: ใช้เป็น execution backlog รายวัน แยกสิ่งที่เสร็จแล้วกับสิ่งที่ยังต้อง migrate
2. `docs/UX_UI_SYSTEM_ROADMAP.md`: ใช้เป็นแผนแม่บทของ UX/UI และ frontend architecture
3. `docs/frontend.md`: ปรับเป็น design system rules ที่ตรงกับ token และ component จริง
4. `docs/COMPONENT_ARCHITECTURE.md`: อัปเดตจาก Next.js 15/route เก่า เป็น Next.js 16 และ component structure จริง
5. `docs/CONTEXT.md`: อัปเดต current stack, current routes, current module readiness
6. `docs/README.md`: อัปเดต badge Next.js 16 และเพิ่ม link ไป roadmap/design system
7. `docs/API_SPECIFICATION.md`: เพิ่ม ActionResult contract และ server action flow
8. `docs/USER_GUIDE.md`: ปรับหลัง UX flow ของแต่ละ module นิ่งแล้ว
9. `docs/AGENT.md`: อัปเดตคำสั่ง agent จาก Next.js 15 เป็น Next.js 16 และเพิ่มกฎก่อนแก้ Next ให้ดู docs ใน `node_modules/next/dist/docs/`

## Proposed Migration Order

### Phase 0: Inventory and Guardrails

- ทำ route inventory และ component inventory
- เพิ่ม banned-pattern checklist
- สรุป design tokens ที่จะใช้จริง
- ระบุ route ที่ต้อง auth และวิธีทำ test session

### Phase 1: App Shell and Navigation

- ทำ `src/lib/navigation.ts`
- refactor Sidebar, MobileBottomNav, Breadcrumb ให้ใช้ config เดียว
- เปลี่ยน mobile `/menu` เป็น menu sheet
- เพิ่ม page shell ที่ควบคุม spacing และ responsive bottom padding

### Phase 2: Design Primitives

- เพิ่ม `PageShell`, `PageHeader`, `MetricCard`, `StatusBadge`, `StudentIdentity`, `EmptyState`, `ErrorState`, `LoadingState`
- แก้ token สีใน layout และ status components
- แก้ detector contrast findings

### Phase 3: Data and Forms

- เพิ่ม `DataTable`, `MobileList`, `FilterBar`, `Pagination`, `FormSection`, `SubmitBar`
- ตั้ง `ActionResult` contract กลาง
- migrate forms ที่ซ้ำกันมากก่อน: attendance, academics, support

### Phase 4: Module Migration

- migrate หน้าตาม wave ที่กำหนด
- หลังจบแต่ละหน้า ต้องลบ duplication ที่ไม่จำเป็นใน `_components`
- ไม่สร้าง mobile component แยกถ้า shared responsive component รองรับได้

### Phase 5: Verification and Hardening

- run `npm run lint`
- run `npx tsc --noEmit`
- run `npm test -- --run`
- run `npm run build`
- run responsive smoke tests
- run `$impeccable` detector
- เก็บ screenshots desktop/mobile สำหรับหน้าที่ migrate แล้ว

## Acceptance Criteria

แต่ละหน้าจะถือว่า "พร้อมทำงานจริง" เมื่อผ่านทุกข้อ:

- ไม่มี broken navigation หรือ route ที่กดแล้วไปหน้าไม่มีอยู่
- ใช้ `PageShell` และ `PageHeader` กลาง
- ใช้ shared component สำหรับ metric, badge, table/list, chart, form, feedback states
- มี loading, empty, error, permission state
- ไม่มี `text-[10px]` หรือ `text-[11px]` ใน content ปกติ
- ไม่มี hard-coded hex color ใน page component
- ไม่มี custom decorative gradient/shadow ที่ไม่ใช่ token
- ไม่เกิด horizontal overflow ที่ desktop, tablet, mobile
- สี status ไม่เป็น color-only indicator
- keyboard focus และ tap target ใช้งานได้
- lint, typecheck, test, build ผ่าน

## Immediate Next Best Step

เริ่มจาก Phase 1: App Shell and Navigation เพราะเป็นจุดที่กระทบทุกหน้าและแก้ root cause ได้มากที่สุด โดยทำ pilot กับ 2 หน้า:

1. `/students`: data-heavy page ที่มี table/list/filter/action
2. `/attendance`: form/chart/status-heavy page ที่ทดสอบ token, chart, and form contract ได้ดี

เมื่อสองหน้านี้นิ่งแล้ว ค่อยใช้ pattern เดียวกัน migrate module อื่น
