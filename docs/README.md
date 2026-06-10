# 🎓 Student Care & Individual Development Analytics System

## ระบบสารสนเทศเพื่อวิเคราะห์และดูแลช่วยเหลือนักเรียนรายบุคคลสำหรับโรงเรียนขนาดเล็ก

> **Student Care and Individual Development Analytics System for Small Schools (SCIDAS)**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwindcss)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://typescriptlang.org)

---

> **Current planning note (2026-06-10):** UX/UI, component architecture, route flow, and documentation cleanup are now tracked in [UX_UI_SYSTEM_ROADMAP.md](./UX_UI_SYSTEM_ROADMAP.md). Design-system rules live in [frontend.md](./frontend.md). Some architecture sections below still reflect older Next.js 15 assumptions and must be reconciled with the current Next.js 16.2.7 app before implementation.

---

## 📋 สารบัญ

- [แนวคิดหลัก](#-แนวคิดหลัก)
- [คุณสมบัติของระบบ](#-คุณสมบัติของระบบ)
- [เทคโนโลยีที่ใช้](#-เทคโนโลยีที่ใช้)
- [สถาปัตยกรรมระบบ](#-สถาปัตยกรรมระบบ)
- [การติดตั้งและใช้งาน](#-การติดตั้งและใช้งาน)
- [โครงสร้างโปรเจกต์](#-โครงสร้างโปรเจกต์)
- [เอกสารประกอบ](#-เอกสารประกอบ)
- [บทบาทผู้ใช้งาน](#-บทบาทผู้ใช้งาน)
- [ระบบ Early Warning](#-ระบบ-early-warning)

---

## 🎯 แนวคิดหลัก

ระบบ SCIDAS ถูกออกแบบมาเพื่อช่วยให้ครูและผู้บริหาร **โรงเรียนขนาดเล็ก** สามารถติดตามนักเรียนแบบ **รายบุคคล** ได้ครบวงจร ตั้งแต่:

```
📊 ข้อมูลพื้นฐาน → 📅 การมาเรียน → 📝 ผลการเรียน → 🔄 พฤติกรรม
    → 🏠 เยี่ยมบ้าน → 🤝 การช่วยเหลือ → ⚠️ วิเคราะห์ความเสี่ยง
    → 📈 แผนพัฒนารายบุคคล
```

> **"ไม่ใช่แค่ระบบเก็บข้อมูลนักเรียน แต่เป็นระบบที่ช่วยครู 'รู้ทันปัญหา' และ 'วางแผนช่วยเหลือเด็กแต่ละคน'"**

### 3 แกนหลักของระบบ

| แกน | ความหมาย | โมดูล |
|-----|---------|-------|
| 🔴 **Early Warning** | ตรวจจับนักเรียนกลุ่มเสี่ยง | Risk Analysis, Dashboard |
| 🟡 **ระบบดูแลช่วยเหลือ** | บันทึกการช่วยเหลือ เยี่ยมบ้าน พฤติกรรม | Home Visit, Support, Behavior |
| 🟢 **แผนพัฒนารายบุคคล** | วิเคราะห์จุดอ่อนและติดตามพัฒนาการ | IDP, Academic, Basic Skills |

---

## ✨ คุณสมบัติของระบบ

### โมดูลหลัก 9 โมดูล

| # | โมดูล | คำอธิบาย | สถานะ |
|---|-------|---------|-------|
| 1 | **ข้อมูลนักเรียน** | ฐานข้อมูลนักเรียน ผู้ปกครอง ข้อมูลครอบครัว | 🔲 |
| 2 | **การมาเรียน** | บันทึกและสถิติ มา/ขาด/ลา/สาย | 🔲 |
| 3 | **ผลการเรียนและทักษะพื้นฐาน** | คะแนน เกรด ทักษะอ่าน-เขียน-คิดเลข | 🔲 |
| 4 | **พฤติกรรมและการส่งงาน** | บันทึกพฤติกรรม การส่ง/ไม่ส่งงาน | 🔲 |
| 5 | **เยี่ยมบ้าน** | บันทึกการเยี่ยมบ้าน รูปภาพ ปัญหาที่พบ | 🔲 |
| 6 | **การช่วยเหลือนักเรียน** | ทุน อุปกรณ์ อาหาร คำปรึกษา | 🔲 |
| 7 | **วิเคราะห์ความเสี่ยง (EWS)** | คำนวณ Risk Score แจ้งเตือนอัตโนมัติ | 🔲 |
| 8 | **แผนพัฒนารายบุคคล (IDP)** | วางแผน ตั้งเป้า ติดตามผล | 🔲 |
| 9 | **Dashboard ผู้บริหาร** | ภาพรวม กราฟ รายงาน | 🔲 |

### ฟีเจอร์เสริม

- 🔐 ระบบ Authentication & Role-Based Access Control (RBAC)
- 📱 Responsive Design — ใช้งานได้ทุกอุปกรณ์
- 🌙 Dark Mode / Light Mode
- 📊 Dashboard แสดงข้อมูลแบบ Real-time
- 📤 ส่งออกรายงาน PDF / Excel
- 📥 นำเข้าข้อมูลจาก CSV / Excel
- 🔔 ระบบแจ้งเตือน In-App Notifications
- 📈 กราฟและ Chart แบบ Interactive
- 🔍 ค้นหาและกรองข้อมูลแบบ Advanced
- 📋 Audit Log — บันทึกประวัติการใช้งาน

---

## 🛠 เทคโนโลยีที่ใช้

### Core Stack

| เทคโนโลยี | เวอร์ชัน | วัตถุประสงค์ |
|-----------|---------|-------------|
| **Next.js** | 16.2.7 | Full-stack React Framework (App Router) |
| **React** | 19.x | UI Library |
| **TypeScript** | 5.x | Type Safety |
| **Tailwind CSS** | 4.x | Utility-First CSS Framework |
| **Supabase** | Latest | Backend-as-a-Service (Auth, DB, Storage, Realtime) |

### UI & Design

| เทคโนโลยี | วัตถุประสงค์ |
|-----------|-------------|
| **shadcn/ui** | Component Library (Radix UI + Tailwind) |
| **Lucide Icons** | Icon Library |
| **Recharts** | Chart Library (React-based) |
| **Framer Motion** | Animation Library |
| **next-themes** | Dark/Light Mode Toggle |

### Development Tools

| เทคโนโลยี | วัตถุประสงค์ |
|-----------|-------------|
| **ESLint** | Code Linting |
| **Prettier** | Code Formatting |
| **Zod** | Schema Validation |
| **React Hook Form** | Form Management |
| **date-fns** | Date Utility |
| **nuqs** | URL Search Params State |
| **xlsx** | Excel Import/Export |
| **@react-pdf/renderer** | PDF Generation |

### Infrastructure

| เทคโนโลยี | วัตถุประสงค์ |
|-----------|-------------|
| **Supabase Auth** | Authentication (Email/Password + Magic Link) |
| **Supabase Database** | PostgreSQL Database with RLS |
| **Supabase Storage** | File Storage (Home Visit Images) |
| **Supabase Realtime** | Real-time Data Subscriptions |
| **Supabase Edge Functions** | Serverless Functions (if needed) |
| **Vercel** | Deployment Platform |

---

## 🏗 สถาปัตยกรรมระบบ

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  Next.js 15  │  │  shadcn/ui   │  │  Tailwind CSS  │  │
│  │  App Router  │  │  Components  │  │  + Framer      │  │
│  └──────┬──────┘  └──────────────┘  └────────────────┘  │
│         │                                                │
│  ┌──────┴──────────────────────────────────────────────┐ │
│  │           React Server Components (RSC)              │ │
│  │    ┌──────────┐  ┌──────────────┐  ┌─────────────┐  │ │
│  │    │  Server   │  │   Server     │  │    API      │  │ │
│  │    │  Actions  │  │   Components │  │   Routes    │  │ │
│  │    └────┬─────┘  └──────┬───────┘  └──────┬──────┘  │ │
│  └─────────┼───────────────┼─────────────────┼─────────┘ │
└────────────┼───────────────┼─────────────────┼───────────┘
             │               │                 │
    ┌────────┴───────────────┴─────────────────┴────────┐
    │              SUPABASE (Backend)                     │
    │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
    │  │   Auth   │  │ Database │  │    Storage        │  │
    │  │  (RBAC)  │  │  (PgSQL) │  │  (Home Visit     │  │
    │  │          │  │  + RLS   │  │   Images)         │  │
    │  └──────────┘  └──────────┘  └──────────────────┘  │
    │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
    │  │ Realtime │  │  Edge    │  │  Database         │  │
    │  │ Subscr.  │  │  Func.   │  │  Functions/Trig.  │  │
    │  └──────────┘  └──────────┘  └──────────────────┘  │
    └────────────────────────────────────────────────────┘
```

---

## 🚀 การติดตั้งและใช้งาน

### Prerequisites

- **Node.js** >= 20.x
- **npm** >= 10.x (หรือ pnpm/yarn)
- **Supabase Account** (Free tier เพียงพอ)
- **Git**

### 1. Clone โปรเจกต์

```bash
git clone <repository-url>
cd student-care-system
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. ตั้งค่า Environment Variables

```bash
cp .env.example .env.local
```

แก้ไขไฟล์ `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=SCIDAS

# Optional
NEXT_PUBLIC_STORAGE_BUCKET=home-visit-images
```

### 4. ตั้งค่า Supabase Database

```bash
# รัน Migration Script
npx supabase db push
```

หรือใช้ SQL Editor ใน Supabase Dashboard โดยรัน scripts จากไฟล์ `supabase/migrations/`

### 5. เริ่มต้น Development Server

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

---

## 📁 โครงสร้างโปรเจกต์

```
student-care-system/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication Pages
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (dashboard)/              # Protected Dashboard Pages
│   │   ├── layout.tsx            # Dashboard Layout (Sidebar + Header)
│   │   ├── page.tsx              # Overview Dashboard
│   │   ├── students/             # Student Management
│   │   ├── attendance/           # Attendance Module
│   │   ├── academics/            # Academic Performance
│   │   ├── behavior/             # Behavior Tracking
│   │   ├── home-visits/          # Home Visit Records
│   │   ├── support/              # Student Support Cases
│   │   ├── risk-analysis/        # Early Warning System
│   │   ├── development-plans/    # Individual Development Plans
│   │   ├── reports/              # Report Generation
│   │   └── settings/             # System Settings & User Management
│   ├── api/                      # API Routes
│   ├── layout.tsx                # Root Layout
│   └── page.tsx                  # Landing/Redirect
│
├── components/                   # Shared Components
│   ├── ui/                       # shadcn/ui Components
│   ├── layout/                   # Layout Components (Sidebar, Header)
│   ├── charts/                   # Chart Components
│   ├── forms/                    # Form Components
│   ├── data-display/             # Data Display Components
│   └── feedback/                 # Loading, Error, Empty States
│
├── hooks/                        # Custom React Hooks
│   ├── use-auth.ts
│   ├── use-students.ts
│   ├── use-attendance.ts
│   ├── use-risk-assessment.ts
│   └── use-supabase-realtime.ts
│
├── lib/                          # Library & Configuration
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase Client
│   │   ├── server.ts             # Server Supabase Client
│   │   ├── middleware.ts         # Auth Middleware
│   │   └── admin.ts              # Admin Supabase Client (service role)
│   ├── utils.ts                  # Utility Functions
│   ├── constants.ts              # App Constants
│   └── validations/              # Zod Schemas
│       ├── student.ts
│       ├── attendance.ts
│       ├── academic.ts
│       └── ...
│
├── services/                     # Business Logic / Data Access
│   ├── student.service.ts
│   ├── attendance.service.ts
│   ├── academic.service.ts
│   ├── behavior.service.ts
│   ├── home-visit.service.ts
│   ├── support.service.ts
│   ├── risk-assessment.service.ts
│   ├── development-plan.service.ts
│   └── report.service.ts
│
├── actions/                      # Server Actions
│   ├── student.actions.ts
│   ├── attendance.actions.ts
│   ├── academic.actions.ts
│   └── ...
│
├── types/                        # TypeScript Type Definitions
│   ├── database.ts               # Supabase Generated Types
│   ├── student.ts
│   ├── attendance.ts
│   ├── risk.ts
│   └── ...
│
├── styles/                       # Global Styles
│   └── globals.css
│
├── public/                       # Static Assets
│   ├── images/
│   └── icons/
│
├── supabase/                     # Supabase Configuration
│   ├── migrations/               # SQL Migrations
│   ├── seed.sql                  # Seed Data
│   └── config.toml               # Supabase Config
│
├── docs/                         # Documentation
│   ├── README.md                 # This file
│   ├── REQUIREMENTS.md           # Requirements Specification
│   ├── DATABASE_SCHEMA.md        # Database Schema Documentation
│   ├── API_SPECIFICATION.md      # API Documentation
│   ├── COMPONENT_ARCHITECTURE.md # Component Architecture
│   ├── USER_GUIDE.md             # User Guide
│   └── DEPLOYMENT.md             # Deployment Guide
│
├── .env.example                  # Environment Variables Template
├── .env.local                    # Local Environment (git-ignored)
├── .eslintrc.json                # ESLint Configuration
├── .prettierrc                   # Prettier Configuration
├── middleware.ts                 # Next.js Middleware (Auth Guard)
├── next.config.ts                # Next.js Configuration
├── tailwind.config.ts            # Tailwind Configuration
├── tsconfig.json                 # TypeScript Configuration
└── package.json                  # Dependencies
```

---

## 👥 บทบาทผู้ใช้งาน

| บทบาท | รหัส | สิทธิ์การเข้าถึง |
|-------|------|-----------------|
| **ผู้ดูแลระบบ** | `admin` | จัดการผู้ใช้ ตั้งค่าระบบ ดูทุกข้อมูล |
| **ผู้บริหาร** | `director` | ดู Dashboard ภาพรวมทั้งโรงเรียน รายงาน |
| **ครูประจำชั้น** | `homeroom` | จัดการนักเรียนในห้อง บันทึกทุกโมดูล สร้างแผน IDP |
| **ครูแนะแนว/ฝ่ายปกครอง** | `counselor` | ดูแลเคสความเสี่ยง การช่วยเหลือ เยี่ยมบ้าน |
| **ครูผู้สอน** | `teacher` | บันทึกคะแนน พฤติกรรม การส่งงาน |

### Permission Matrix

```
Module              │ admin │ director │ homeroom │ counselor │ teacher
────────────────────┼───────┼──────────┼──────────┼───────────┼────────
Dashboard Overview  │  ✅   │    ✅    │   ✅*    │    ✅*    │   ✅*
Student Profile     │  ✅   │    👁    │   ✅*    │    👁     │   👁*
Attendance          │  ✅   │    👁    │   ✅*    │    👁     │   ✅*
Academic Scores     │  ✅   │    👁    │   ✅*    │    👁     │   ✅*
Behavior            │  ✅   │    👁    │   ✅*    │    ✅     │   ✅*
Home Visit          │  ✅   │    👁    │   ✅*    │    ✅     │   ❌
Support             │  ✅   │    👁    │   ✅*    │    ✅     │   👁
Risk Analysis       │  ✅   │    ✅    │   👁*    │    ✅     │   ❌
Development Plan    │  ✅   │    👁    │   ✅*    │    ✅     │   ❌
Reports             │  ✅   │    ✅    │   ✅*    │    ✅*    │   ❌
User Management     │  ✅   │    ❌    │   ❌     │    ❌     │   ❌
System Settings     │  ✅   │    ❌    │   ❌     │    ❌     │   ❌

✅ = Full Access | 👁 = View Only | ❌ = No Access | * = Own class/subject only
```

---

## ⚠️ ระบบ Early Warning

### วิธีการคำนวณ Risk Score

ระบบคำนวณ **Risk Score** จากปัจจัยหลายด้าน โดยแต่ละปัจจัยมีน้ำหนักคะแนนเฉพาะ:

| ปัจจัย | คะแนน | เงื่อนไข |
|--------|-------|---------|
| ขาดเรียนบ่อย | +20 | ขาดเรียน ≥ 3 วัน/เดือน |
| มาสายบ่อย | +10 | มาสาย ≥ 5 วัน/เดือน |
| คะแนนต่ำ | +20 | GPA < 1.5 หรือ คะแนนเฉลี่ย < 50% |
| อ่าน/เขียนต่ำกว่าเกณฑ์ | +15 | ไม่ผ่านเกณฑ์ทักษะพื้นฐาน |
| ไม่ส่งงานบ่อย | +10 | ไม่ส่งงาน ≥ 30% ของงานทั้งหมด |
| มีปัญหาครอบครัว | +15 | ข้อมูลจากเยี่ยมบ้าน/แบบสอบถาม |
| เดินทางมาเรียนลำบาก | +10 | ระยะทาง > 10 กม. หรือไม่มีพาหนะ |
| ครูระบุว่าควรติดตาม | +10 | Flag จากครูประจำชั้น/ครูผู้สอน |

### ระดับความเสี่ยง

```
 🟢 ปกติ (Normal)        0-30 คะแนน
 🟡 เฝ้าระวัง (Watch)     31-60 คะแนน
 🔴 เสี่ยงสูง (High Risk)  61-100 คะแนน
```

### การทำงานอัตโนมัติ

1. ระบบคำนวณ Risk Score ใหม่เมื่อมีการอัปเดตข้อมูลที่เกี่ยวข้อง
2. แจ้งเตือนครูประจำชั้นเมื่อนักเรียนเข้าระดับ "เฝ้าระวัง"
3. แจ้งเตือนครูแนะแนว + ผู้บริหารเมื่อนักเรียนเข้าระดับ "เสี่ยงสูง"
4. แนะนำให้สร้างแผนพัฒนารายบุคคลอัตโนมัติ

---

## 📚 เอกสารประกอบ

| เอกสาร | คำอธิบาย |
|--------|---------|
| [REQUIREMENTS.md](./REQUIREMENTS.md) | ข้อกำหนดความต้องการของระบบ (SRS) |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | แบบจำลองฐานข้อมูลและ ER Diagram |
| [API_SPECIFICATION.md](./API_SPECIFICATION.md) | ข้อกำหนด API และ Server Actions |
| [COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md) | สถาปัตยกรรม Component และ Design System |
| [UX_UI_SYSTEM_ROADMAP.md](./UX_UI_SYSTEM_ROADMAP.md) | แผนปรับ UX/UI, component reuse, navigation, layout, flow และเอกสารให้เป็นระบบ |
| [frontend.md](./frontend.md) | กฎ design system, token usage, component contracts, และ banned UI patterns สำหรับ migration |
| [USER_GUIDE.md](./USER_GUIDE.md) | คู่มือการใช้งานระบบ |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | คู่มือการ Deploy ระบบ |

---

## 📄 License

This project is developed for educational purposes.

---

## 🙏 Acknowledgments

- โรงเรียนขนาดเล็ก สพฐ.
- กระทรวงศึกษาธิการ — ระบบดูแลช่วยเหลือนักเรียน
- Supabase Team
- Vercel Team
- shadcn/ui Community
