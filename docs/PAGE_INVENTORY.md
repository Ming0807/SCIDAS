# 📋 SCIDAS Route & Page Inventory

## ระบบดูแลช่วยเหลือนักเรียนและวิเคราะห์พัฒนาการรายบุคคล สำหรับโรงเรียนขนาดเล็ก
### Student Care and Individual Development Analytics System for Small Schools

> **Tech Stack**: Next.js 16.3.3 App Router · React 19.2.4 · Tailwind CSS v4 · shadcn/ui · Supabase PostgreSQL  
> **อัปเดตล่าสุด**: 13 กันยายน 2569  
> **สถานะภาพรวม**: ผ่านการไมเกรตสู่ Server Components + Typed Read Models + Semantic Design Tokens ครบ 100%

---

## 1. ผังเส้นทางทั้งหมด (Route Directory & Ownership)

| เส้นทาง (Route) | ประเภท / เลเอาต์ | สิทธิ์การใช้งาน (Role Scope) | แหล่งข้อมูลหลัก (Data Source / Read Model) | สถานะ UI ที่รองรับ (States) | สถานะไมเกรต |
|---|---|---|---|---|:---:|
| `/` | Server Component | ทุกบทบาท (Scoped) | `getStudentCareDashboard()`, `v_student_worklist` | Loading, Empty, Content, Error | **เสร็จสมบูรณ์** |
| `/login` | Public Client | ทุกผู้ใช้งาน | Supabase Auth (OAuth & Email) | Idle, Submitting, Error | **เสร็จสมบูรณ์** |
| `/auth/callback` | Route Handler | ทุกผู้ใช้งาน | Supabase Auth Code Exchange | Redirecting | **เสร็จสมบูรณ์** |
| `/students` | Server Component | `admin`, `director`, `homeroom_teacher`, `counselor`, `subject_teacher` | `getStudentWorklist()`, `v_student_worklist` | Filter, Table, Mobile, Empty, Pagination | **เสร็จสมบูรณ์** |
| `/students/new` | Server Component + Action | `admin`, `homeroom_teacher` | `createStudentActionState`, `classrooms` | Form, Validating, Submit, Error | **เสร็จสมบูรณ์** |
| `/students/import` | Server Component + Action | `admin`, `homeroom_teacher` | `importStudentsActionState`, Excel Server Parser | Dropzone, Preview, Importing, Feedback | **เสร็จสมบูรณ์** |
| `/students/[id]` | Server Component | ทุกบทบาท (ตามสิทธิ์ RLS) | `v_current_student_directory`, `getStudentAttachments` | Care Profile, Attachments, Notes, Timeline | **เสร็จสมบูรณ์** |
| `/students/[id]/edit` | Server Component + Action | `admin`, `homeroom_teacher` | `updateStudentActionState`, `students` | Form, Prefilled, Update, Error | **เสร็จสมบูรณ์** |
| `/attendance` | Server Component + Client Form | `admin`, `homeroom_teacher`, `subject_teacher` | `getAttendanceDashboard()`, `attendance_records` | Summary Cards, Realtime Sync, Conflict, Empty | **เสร็จสมบูรณ์** |
| `/academics` | Server Component | `admin`, `director`, `homeroom_teacher`, `subject_teacher` | `getAcademicDashboard()`, `academic_scores` | Metrics, Scores Table, Subject Breakdown | **เสร็จสมบูรณ์** |
| `/behavior` | Server Component | ทุกบทบาทครูและผู้บริหาร | `getBehaviorDashboard()`, `behavior_records` | Metrics, Leaderboard, Recent Events, Empty | **เสร็จสมบูรณ์** |
| `/behavior/record` | Server Component + Action | `admin`, `homeroom_teacher`, `subject_teacher`, `counselor` | `createBehaviorRecordAction()`, `students` | Form, Incident/Positive, Severity, Submit | **เสร็จสมบูรณ์** |
| `/behavior/[id]` | Server Component | ทุกบทบาทครูและผู้บริหาร | `getBehaviorRecordById()`, `behavior_records` | Detail Card, Related Student Events, Error | **เสร็จสมบูรณ์** |
| `/behavior/[id]/edit` | Server Component + Action | `admin`, เจ้าของบันทึก | `updateBehaviorRecordAction()`, `behavior_records` | Form, Edit, Save, Error | **เสร็จสมบูรณ์** |
| `/risk-analysis` | Server Component | ทุกบทบาทครูและผู้บริหาร | `v_student_worklist`, `getStudentRiskFactors` | EWS Matrix, Student Benchmark, Mobile Drilldown | **เสร็จสมบูรณ์** |
| `/support` | Server Component | `admin`, `counselor`, `homeroom_teacher` | `getStudentCareDashboard()`, `action_items` | Priority Queue, Care Timeline, Notes | **เสร็จสมบูรณ์** |
| `/support/new` | Server Component + Action | `admin`, `counselor`, `homeroom_teacher` | `createSupportRecordAction()`, `students` | Lifecycle Form, Level, Target, Submit | **เสร็จสมบูรณ์** |
| `/support/[id]` | Server Component | `admin`, `counselor`, `homeroom_teacher` | `getSupportCaseById()`, `getStudentAttachments` | Case Timeline, Evidence Attachments, Actions | **เสร็จสมบูรณ์** |
| `/support/[id]/edit` | Server Component + Action | `admin`, `counselor` | `updateSupportRecordAction()` | Form, Case Progress, Close/Resolve | **เสร็จสมบูรณ์** |
| `/development-plans` | Server Component | ทุกบทบาทครูและผู้บริหาร | `getDevelopmentPlanList()`, `development_plans` | Plan Summary, Goals Progress, Empty, Error | **เสร็จสมบูรณ์** |
| `/development-plans/new` | Server Component + Action | `admin`, `homeroom_teacher`, `counselor` | `createDevelopmentPlanAction()`, `students` | Goal Builder, Target Dates, Submit | **เสร็จสมบูรณ์** |
| `/development-plans/[id]` | Server Component | ทุกบทบาทครูและผู้บริหาร | `getDevelopmentPlanById()`, `development_goals` | IDP Overview, Milestones, Progress Bar | **เสร็จสมบูรณ์** |
| `/development-plans/[id]/edit` | Server Component + Action | `admin`, เจ้าของแผน | `updateDevelopmentPlanAction()` | Goal Editor, Status Updates, Save | **เสร็จสมบูรณ์** |
| `/home-visits` | Server Component | ทุกบทบาทครูและผู้บริหาร | `getHomeVisits()`, `home_visits`, `home_visit_images` | Gallery Cards, Metrics, Status Filter, Empty | **เสร็จสมบูรณ์** |
| `/home-visits/new` | Server Component + Action | `admin`, `homeroom_teacher` | `createHomeVisitAction()`, `StudentAttachmentForm` | Step Form, Image Upload, Geo/Housing, Submit | **เสร็จสมบูรณ์** |
| `/home-visits/[id]` | Server Component | ทุกบทบาทครูและผู้บริหาร | `getHomeVisitById()`, `getStudentAttachments` | Assessment Card, Evidence Photos, Attachments | **เสร็จสมบูรณ์** |
| `/home-visits/[id]/edit` | Server Component + Action | `admin`, ครูผู้เยี่ยม | `updateHomeVisitAction()`, `home_visits` | Form, Assessment Revision, Save | **เสร็จสมบูรณ์** |
| `/reports` | Server Component | ทุกบทบาท (Scoped) | `getReportJobs()`, `getRiskFactorDistribution()` | Job Status, PDF Generation, Trend Charts, Donut | **เสร็จสมบูรณ์** |
| `/notifications` | Server Component | ทุกผู้ใช้งานที่เข้าสู่ระบบ | `getNotifications()`, `notifications` table | Read/Unread Toggle, Mark-All-Read, Type Filter | **เสร็จสมบูรณ์** |
| `/settings` | Server Component | ทุกผู้ใช้งานที่เข้าสู่ระบบ | `getUserProfile()`, `profiles`, `schools` | Profile Form, Role Badge, Security Card | **เสร็จสมบูรณ์** |
| `/settings/academic` | Server Component + Action | `admin`, `director` | `semesters`, `academic_years`, `classrooms` | Term Configuration, Batch Operations | **เสร็จสมบูรณ์** |

---

## 2. การจัดการ UI States และ Feedback System

ทุกหน้าในระบบ SCIDAS ถูกออกแบบให้รองรับ State พื้นฐานอย่างถูกต้องและซื่อสัตย์ต่อผู้ใช้ (Honest States):

1. **Loading State**:
   - ใช้ `loading.tsx` หรือ Suspense Skeletons ตามมาตรฐาน Next.js App Router
2. **Empty State**:
   - ใช้คอมโพเนนต์กลาง `<EmptyState title="..." description="..." action={...} />` จาก `@/components/feedback/empty-state` ปราศจากการสร้าง mock ปลอม
3. **Error State**:
   - ใช้คอมโพเนนต์กลาง `<ErrorState title="..." description="..." onRetry={...} />` จาก `@/components/feedback/error-state` พร้อมคำอธิบายที่ชัดเจน
4. **Permission Guard**:
   - ตรวจสอบสิทธิ์ตั้งแต่ระดับ Server Component ด้วย `getCurrentUserContext()` และป้องกันระดับข้อมูลด้วย Row Level Security (RLS) ของ PostgreSQL
5. **Offline & Realtime Feedback**:
   - แจ้งเตือนผ่าน `<OfflineBanner />` เมื่อขาดการเชื่อมต่อ และแจ้งสถานะอัปเดตแบบเรียลไทม์เมื่อมีการเปลี่ยนแปลงข้อมูลร่วมกัน
