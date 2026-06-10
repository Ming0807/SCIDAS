# 🧠 Project Context (SCIDAS)

> **คำแนะนำสำหรับ AI Assistant:** เมื่ออ่านโปรเจกต์นี้ ให้ใช้ข้อมูลในไฟล์นี้เป็น Context หลักในการตัดสินใจ เพื่อความสอดคล้อง (Consistency) ของโค้ด

> **Current planning note (2026-06-10):** This context is partly stale. The current app uses Next.js 16.2.7, and frontend structure/UX decisions should follow [UX_UI_SYSTEM_ROADMAP.md](./UX_UI_SYSTEM_ROADMAP.md) until this file is fully updated.

## 1. ข้อมูลพื้นฐานของโปรเจกต์
- **ชื่อโปรเจกต์:** Student Care and Individual Development Analytics System (SCIDAS)
- **ระบบ:** ระบบสารสนเทศเพื่อวิเคราะห์และดูแลช่วยเหลือนักเรียนรายบุคคลสำหรับโรงเรียนขนาดเล็ก
- **เป้าหมายหลัก:** ระบบ Early Warning System (EWS), ดูแลช่วยเหลือนักเรียน, และ แผนพัฒนารายบุคคล (IDP)
- **กลุ่มเป้าหมาย:** ครูและผู้บริหารในโรงเรียนขนาดเล็ก (< 120 คน)

## 2. Tech Stack & Tools
- **Framework:** Next.js 16.2.7 (App Router)
- **UI & Styling:** React 19.x, Tailwind CSS 4.x, shadcn/ui, Lucide Icons, Recharts (สำหรับกราฟ)
- **Backend & Database:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Forms & Validation:** React Hook Form, Zod
- **State Management:** URL Query Params (ใช้ `nuqs`), Local State (useState/useReducer)
- **Language:** TypeScript 5.x อย่างเคร่งครัด

## 3. สถาปัตยกรรม (Architecture Guidelines)
### Frontend (Next.js App Router)
- **Server Components First:** ใช้ React Server Components (RSC) เป็นค่าเริ่มต้นเสมอ
- **Client Components (`"use client"`):** ใช้เฉพาะเมื่อมีการตอบสนองกับผู้ใช้ (Interactivity), State (useState), หรือ Hooks (useEffect)
- **Data Fetching:** Fetch ข้อมูลจาก Server Components โดยใช้ Supabase SSR (`@supabase/ssr`)
- **Mutations:** ใช้ **Server Actions** เป็นหลักสำหรับการทำ Form Submissions หรือแก้ไขข้อมูล หลีกเลี่ยงการใช้ API Routes (`/api`) ยกเว้นจะทำ Webhooks หรือ External API
- **Route Structure:** ใช้ `src/app/login` สำหรับหน้า login, `src/app/auth/callback/route.ts` สำหรับ auth callback, และ route group `src/app/(dashboard)` สำหรับหน้าหลัง login

### UX/UI Migration Guardrails (2026-06-10)
- **Source of truth:** ใช้ `docs/UX_UI_SYSTEM_ROADMAP.md` เป็นแผน migration และ `docs/frontend.md` เป็น design system rulebook
- **Next.js 16 check:** ก่อนแก้โค้ด Next.js ให้ดู guide ที่เกี่ยวข้องใน `node_modules/next/dist/docs/` ตามคำสั่งใน `AGENTS.md`
- **Server-first pages:** Page และ Layout เป็น Server Components โดย default; เพิ่ม `"use client"` เฉพาะ interaction, browser API, state, chart หรือ form ที่ต้องใช้ฝั่ง client
- **Shared UI direction:** ลด route-local `_components` ที่ซ้ำกัน แล้วค่อยย้ายเป็น shared contracts เช่น `PageShell`, `PageHeader`, `PageToolbar`, `Section`, `MetricCard`, `StatusBadge`, `DataTable`, `MobileList`, `FilterBar`, `FormSection`, และ feedback states
- **Navigation direction:** ต้องมี `src/lib/navigation.ts` เป็น source of truth เดียวก่อนแก้ navigation รอบใหญ่; ปัจจุบันไม่มี route `/menu`
- **Mutation flow:** Route Server Component -> query/service -> typed DTO/view model -> Client Component เฉพาะ interaction -> Server Action -> `ActionResult<T>` -> narrow `revalidatePath`, redirect, หรือ refresh
- **Banned UI patterns:** ห้ามเพิ่ม hard-coded colors, arbitrary tiny text, arbitrary shadows, non-token gradients, glassmorphism, `rounded-3xl`, และ gray text บน colored background ในงาน migration ใหม่
- **Verification baseline:** ล่าสุด `lint`, `tsc --noEmit`, `vitest`, และ `build` ผ่านแล้ว แต่ authenticated visual verification และ `$impeccable` detector findings ยังต้องตามต่อ

### Backend (Supabase)
- **Row Level Security (RLS):** ตารางทุกตารางในฐานข้อมูลต้องมีการเปิด RLS
- **Authentication:** ผูกผู้ใช้กับตาราง `auth.users` ของ Supabase โดยมีตาราง `public.profiles` เพื่อเก็บ Role
- **Roles:** `admin`, `director` (ผู้บริหาร), `homeroom` (ครูประจำชั้น), `counselor` (ครูแนะแนว/ฝ่ายปกครอง), `teacher` (ครูผู้สอน)
- **Database Logic:** ฟังก์ชันที่ซับซ้อนให้เขียนเป็น Database Functions / Triggers (เช่น การคำนวณ Risk Score) เพื่อป้องกันการโหลดข้อมูลมากเกินไปที่ฝั่ง Frontend

## 4. โครงสร้างฐานข้อมูล (Key Entities)
- `profiles`: ข้อมูลผู้ใช้และ Role
- `students`, `guardians`, `student_guardians`: ข้อมูลนักเรียนและผู้ปกครอง
- `classrooms`, `subjects`, `classroom_students`: ข้อมูลชั้นเรียนและวิชาเรียน
- `attendance_records`: ข้อมูลการมาเรียน
- `academic_scores`, `basic_skills`: ข้อมูลคะแนนและทักษะพื้นฐาน
- `behavior_records`, `assignment_submissions`: ข้อมูลพฤติกรรมและการส่งงาน
- `home_visits`, `support_records`: ข้อมูลเยี่ยมบ้านและการช่วยเหลือนักเรียน
- `risk_assessments`, `risk_factors`: ข้อมูลการวิเคราะห์ความเสี่ยงและปัจจัยเสี่ยง
- `development_plans`, `development_goals`: ข้อมูลแผนพัฒนารายบุคคล

## 5. การวิเคราะห์ความเสี่ยง (Risk Score System)
คำนวณจาก 8 ปัจจัยหลัก:
1. ขาดเรียนบ่อย (+20)
2. มาสายบ่อย (+10)
3. คะแนนต่ำ (+20)
4. อ่าน/เขียนต่ำกว่าเกณฑ์ (+15)
5. ไม่ส่งงานบ่อย (+10)
6. มีปัญหาครอบครัว (+15)
7. เดินทางมาเรียนลำบาก (+10)
8. ครูระบุว่าควรติดตาม (+10)

**ระดับความเสี่ยง:**
- 🟢 ปกติ (0-30 คะแนน)
- 🟡 เฝ้าระวัง (31-60 คะแนน)
- 🔴 เสี่ยงสูง (61-100 คะแนน)

## 6. ตำแหน่งเอกสารอ้างอิง
เอกสารทั้งหมดอยู่ในโฟลเดอร์ `docs/`:
- `README.md`: ภาพรวมและวิธีการติดตั้ง
- `REQUIREMENTS.md`: ความต้องการของระบบ (Functional/Non-Functional) และ Use Cases
- `DATABASE_SCHEMA.md`: โครงสร้างฐานข้อมูล ER Diagram และ RLS
- `API_SPECIFICATION.md`: ข้อกำหนด Server Actions และ API Routes
- `COMPONENT_ARCHITECTURE.md`: โครงสร้างหน้าจอและ React Components
- `frontend.md`: กฎ design system, tokens, component usage, และ banned UI patterns
- `UX_UI_SYSTEM_ROADMAP.md`: แผน migration UX/UI และ frontend architecture
- `USER_GUIDE.md`: คู่มือการใช้งาน
- `DEPLOYMENT.md`: คู่มือการ Deploy บน Vercel และ Supabase

## 7. กฎการเขียนโค้ด (Coding Rules)
1. **TypeScript:** ไม่ใช้ `any` เด็ดขาด ใช้ Zod เพื่อ Infer Types ควบคู่กับการประกาศ Interfaces
2. **Tailwind:** ใช้ Class Utilities เท่านั้น ไม่สร้างไฟล์ CSS แยก (เว้นแต่ CSS Variables ใน `globals.css`)
3. **UI Components:** หากต้องการใช้ Component พื้นฐาน (ปุ่ม, ฟอร์ม, ไดอะล็อก) ให้ดึงจาก shadcn/ui ก่อนสร้างใหม่เสมอ
4. **Error Handling:** จัดการ Error ฝั่ง Server เสมอ และ Return กลับมาให้ Client แสดงผลอย่างเหมาะสม (ใช้ Toast)
5. **Security:** ห้ามเปิดเผย `SUPABASE_SERVICE_ROLE_KEY` ในฝั่ง Client เด็ดขาด
6. **Imports:** ใช้ Absolute imports (`@/components`, `@/lib` เป็นต้น)
