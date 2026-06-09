# 📘 API Specification — ระบบดูแลช่วยเหลือนักเรียนและวิเคราะห์พัฒนาการรายบุคคล

> **Student Care and Individual Development Analytics System for Small Schools**

| รายการ | รายละเอียด |
|---|---|
| **Version** | `1.0.0` |
| **Base URL** | `https://<domain>/api` |
| **Tech Stack** | Next.js 15 App Router, Supabase (PostgreSQL + Auth + Storage + Realtime) |
| **Architecture** | Server Actions (mutations) + API Routes (external/webhooks) |
| **Auth** | Supabase Auth (JWT) — ส่ง `Authorization: Bearer <token>` สำหรับ API Routes |
| **Date Format** | ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`) |
| **Pagination** | Cursor-based & Offset-based (ดูรายละเอียดที่ [Common Patterns](#common-patterns)) |
| **อัปเดตล่าสุด** | 2026-06-09 |

---

## สารบัญ (Table of Contents)

1. [Common Patterns](#common-patterns)
2. [Authentication & Authorization](#1-authentication--authorization)
3. [Students Module](#2-students-module)
4. [Attendance Module](#3-attendance-module)
5. [Academic Performance Module](#4-academic-performance-module)
6. [Behavior Module](#5-behavior-module)
7. [Home Visit Module](#6-home-visit-module)
8. [Support/Assistance Module](#7-supportassistance-module)
9. [Risk Assessment Module (Early Warning)](#8-risk-assessment-module-early-warning)
10. [Individual Development Plan (IDP)](#9-individual-development-plan-idp)
11. [Dashboard & Reports](#10-dashboard--reports)
12. [User Management (Admin)](#11-user-management-admin)
13. [Server Actions Reference](#server-actions-reference)
14. [Supabase Realtime Subscriptions](#supabase-realtime-subscriptions)
15. [File Upload Handling](#file-upload-handling)
16. [Rate Limiting](#rate-limiting)

---

## Common Patterns

### การ Authentication

ระบบใช้ **Supabase Auth** ในการจัดการ Authentication ทุก request ที่ต้องการสิทธิ์จะต้องส่ง JWT token

```
Authorization: Bearer <supabase_access_token>
```

สำหรับ **Server Actions** จะใช้ `createServerClient()` ของ `@supabase/ssr` ซึ่งอ่าน token จาก cookies โดยอัตโนมัติ

### Roles & Permissions

| Role | รหัส | สิทธิ์ |
|---|---|---|
| **Super Admin** | `super_admin` | เข้าถึงทุกส่วน จัดการระบบ |
| **Admin** | `admin` | จัดการข้อมูลทั้งโรงเรียน |
| **Teacher** | `teacher` | จัดการข้อมูลนักเรียนในความดูแล |
| **Counselor** | `counselor` | ดูข้อมูลนักเรียน บันทึกการให้คำปรึกษา |
| **Viewer** | `viewer` | ดูข้อมูลอย่างเดียว (read-only) |

### Pagination Pattern

ระบบรองรับ 2 รูปแบบ:

#### Offset-based Pagination (ค่าเริ่มต้น)

```typescript
// Request Query Parameters
interface PaginationParams {
  page?: number;      // หน้าที่ต้องการ (เริ่มจาก 1) — default: 1
  limit?: number;     // จำนวนรายการต่อหน้า — default: 20, max: 100
  sort?: string;      // ฟิลด์ที่ต้องการเรียง — default: "created_at"
  order?: "asc" | "desc"; // ทิศทางการเรียง — default: "desc"
}
```

```json
// Response Envelope
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Cursor-based Pagination (สำหรับ real-time feeds)

```typescript
interface CursorPaginationParams {
  cursor?: string;   // ID ของรายการสุดท้ายจากหน้าก่อน
  limit?: number;    // จำนวนรายการต่อหน้า — default: 20
}
```

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "nextCursor": "uuid-of-last-item",
    "hasMore": true
  }
}
```

### Standard Response Format

#### Success Response

```json
{
  "success": true,
  "data": { },
  "message": "ดำเนินการสำเร็จ"
}
```

#### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "กรุณากรอกข้อมูลให้ครบถ้วน",
    "details": [
      {
        "field": "email",
        "message": "รูปแบบอีเมลไม่ถูกต้อง"
      }
    ]
  }
}
```

### Standard Error Codes

| HTTP Status | Error Code | คำอธิบาย |
|---|---|---|
| `400` | `VALIDATION_ERROR` | ข้อมูลที่ส่งมาไม่ถูกต้อง |
| `400` | `BAD_REQUEST` | คำร้องขอไม่ถูกต้อง |
| `401` | `UNAUTHORIZED` | ไม่ได้เข้าสู่ระบบ หรือ token หมดอายุ |
| `403` | `FORBIDDEN` | ไม่มีสิทธิ์เข้าถึง |
| `404` | `NOT_FOUND` | ไม่พบข้อมูลที่ร้องขอ |
| `409` | `CONFLICT` | ข้อมูลซ้ำ (เช่น เลขประจำตัวนักเรียนซ้ำ) |
| `413` | `FILE_TOO_LARGE` | ไฟล์มีขนาดใหญ่เกินไป |
| `422` | `UNPROCESSABLE_ENTITY` | ข้อมูลรูปแบบถูกต้องแต่ประมวลผลไม่ได้ |
| `429` | `RATE_LIMIT_EXCEEDED` | ส่ง request มากเกินไป |
| `500` | `INTERNAL_ERROR` | ข้อผิดพลาดภายในระบบ |

### TypeScript Type Conventions

```typescript
// UUID ใช้เป็น primary key ทุก table
type UUID = string;

// วันที่ในรูปแบบ ISO 8601
type ISODateString = string;

// ปีการศึกษา เช่น 2568
type AcademicYear = number;

// ภาคเรียน
type Semester = 1 | 2;
```

---

## 1. Authentication & Authorization

ระบบ Authentication ใช้ **Supabase Auth** เป็นหลัก โดย Server Actions จะเรียกผ่าน `@supabase/ssr` และ API Routes สำหรับ external integrations

---

### POST `/api/auth/login`

**คำอธิบาย:** เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน

**สิทธิ์ที่ต้องการ:** ไม่ต้องการ (Public)

**Request Body:**

```typescript
interface LoginRequest {
  email: string;        // อีเมลผู้ใช้ (required)
  password: string;     // รหัสผ่าน (required, min 8 chars)
}
```

```json
{
  "email": "teacher@school.ac.th",
  "password": "SecureP@ss123"
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "teacher@school.ac.th",
      "role": "teacher",
      "profile": {
        "first_name": "สมศรี",
        "last_name": "ใจดี",
        "avatar_url": "https://xxx.supabase.co/storage/v1/object/public/avatars/teacher1.jpg",
        "phone": "081-234-5678"
      }
    },
    "session": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "v1.MjQ1Njc4OTAtY...",
      "expires_in": 3600,
      "expires_at": 1749456000
    }
  },
  "message": "เข้าสู่ระบบสำเร็จ"
}
```

**Error Responses:**

| Status | Code | สาเหตุ |
|---|---|---|
| `400` | `VALIDATION_ERROR` | ไม่ได้กรอกอีเมลหรือรหัสผ่าน |
| `401` | `INVALID_CREDENTIALS` | อีเมลหรือรหัสผ่านไม่ถูกต้อง |
| `423` | `ACCOUNT_LOCKED` | บัญชีถูกล็อก (ล็อกอินผิดเกิน 5 ครั้ง) |

---

### POST `/api/auth/register`

**คำอธิบาย:** ลงทะเบียนผู้ใช้ใหม่ (เฉพาะ Admin เท่านั้นที่สร้างได้)

**สิทธิ์ที่ต้องการ:** `admin`, `super_admin`

**Request Body:**

```typescript
interface RegisterRequest {
  email: string;          // อีเมลผู้ใช้ (required, unique)
  password: string;       // รหัสผ่าน (required, min 8 chars)
  role: UserRole;         // บทบาท (required)
  profile: {
    first_name: string;   // ชื่อจริง (required)
    last_name: string;    // นามสกุล (required)
    phone?: string;       // เบอร์โทรศัพท์
    position?: string;    // ตำแหน่ง เช่น "ครูประจำชั้น ป.3"
  };
}

type UserRole = "admin" | "teacher" | "counselor" | "viewer";
```

```json
{
  "email": "new_teacher@school.ac.th",
  "password": "SecureP@ss456",
  "role": "teacher",
  "profile": {
    "first_name": "สมชาย",
    "last_name": "รักเรียน",
    "phone": "089-876-5432",
    "position": "ครูประจำชั้น ป.4"
  }
}
```

**Response — `201 Created`:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "email": "new_teacher@school.ac.th",
      "role": "teacher",
      "profile": {
        "first_name": "สมชาย",
        "last_name": "รักเรียน",
        "phone": "089-876-5432",
        "position": "ครูประจำชั้น ป.4"
      },
      "created_at": "2026-06-09T04:42:00Z"
    }
  },
  "message": "สร้างบัญชีผู้ใช้สำเร็จ"
}
```

**Error Responses:**

| Status | Code | สาเหตุ |
|---|---|---|
| `400` | `VALIDATION_ERROR` | ข้อมูลไม่ครบหรือรูปแบบไม่ถูกต้อง |
| `403` | `FORBIDDEN` | ไม่มีสิทธิ์สร้างบัญชี |
| `409` | `CONFLICT` | อีเมลนี้ถูกใช้งานแล้ว |

---

### POST `/api/auth/logout`

**คำอธิบาย:** ออกจากระบบ ลบ session ปัจจุบัน

**สิทธิ์ที่ต้องการ:** Authenticated (ทุก role)

**Request Body:** ไม่ต้องส่ง

**Response — `200 OK`:**

```json
{
  "success": true,
  "message": "ออกจากระบบสำเร็จ"
}
```

---

### POST `/api/auth/reset-password`

**คำอธิบาย:** ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมล

**สิทธิ์ที่ต้องการ:** ไม่ต้องการ (Public)

**Request Body:**

```typescript
interface ResetPasswordRequest {
  email: string;   // อีเมลที่ลงทะเบียนไว้ (required)
}
```

```json
{
  "email": "teacher@school.ac.th"
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "message": "ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลแล้ว"
}
```

> [!NOTE]
> ส่ง response `200 OK` เสมอ ไม่ว่าจะมีอีเมลในระบบหรือไม่ เพื่อป้องกันการตรวจสอบว่ามีอีเมลอยู่ในระบบ (Email enumeration prevention)

---

### GET `/api/auth/me`

**คำอธิบาย:** ดึงข้อมูลผู้ใช้ปัจจุบันที่เข้าสู่ระบบอยู่

**สิทธิ์ที่ต้องการ:** Authenticated (ทุก role)

**Request:** ไม่ต้องส่ง body (อ่านจาก JWT token)

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "teacher@school.ac.th",
    "role": "teacher",
    "profile": {
      "first_name": "สมศรี",
      "last_name": "ใจดี",
      "avatar_url": "https://xxx.supabase.co/storage/v1/object/public/avatars/teacher1.jpg",
      "phone": "081-234-5678",
      "position": "ครูประจำชั้น ป.3"
    },
    "permissions": [
      "students:read",
      "students:write",
      "attendance:read",
      "attendance:write",
      "behavior:read",
      "behavior:write",
      "homevisit:read",
      "homevisit:write"
    ],
    "assigned_classes": ["ป.3/1"],
    "last_login": "2026-06-09T04:30:00Z"
  }
}
```

---

### Server Action — `updatePassword`

**คำอธิบาย:** เปลี่ยนรหัสผ่านของผู้ใช้ปัจจุบัน (ใช้ Server Action แทน API Route)

**ไฟล์:** `app/actions/auth.ts`

```typescript
"use server";

interface UpdatePasswordInput {
  currentPassword: string;   // รหัสผ่านปัจจุบัน
  newPassword: string;       // รหัสผ่านใหม่ (min 8 chars)
  confirmPassword: string;   // ยืนยันรหัสผ่านใหม่
}

interface ActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export async function updatePassword(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult>;
```

**การเรียกใช้จาก Client Component:**

```typescript
"use client";
import { useActionState } from "react";
import { updatePassword } from "@/app/actions/auth";

function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePassword, {
    success: false,
    message: "",
  });

  return (
    <form action={formAction}>
      <input name="currentPassword" type="password" required />
      <input name="newPassword" type="password" required />
      <input name="confirmPassword" type="password" required />
      <button type="submit" disabled={isPending}>
        {isPending ? "กำลังบันทึก..." : "เปลี่ยนรหัสผ่าน"}
      </button>
      {state.message && <p>{state.message}</p>}
    </form>
  );
}
```

---

## 2. Students Module

จัดการข้อมูลนักเรียนทั้งหมด ตั้งแต่ข้อมูลพื้นฐาน ข้อมูลครอบครัว ไปจนถึง profile แบบครบวงจร

---

### GET `/api/students`

**คำอธิบาย:** ดึงรายชื่อนักเรียนทั้งหมด พร้อมตัวกรองและการค้นหา

**สิทธิ์ที่ต้องการ:** `teacher`, `counselor`, `admin`, `super_admin`

**Query Parameters:**

```typescript
interface StudentListParams {
  page?: number;              // หน้า (default: 1)
  limit?: number;             // จำนวนต่อหน้า (default: 20, max: 100)
  search?: string;            // ค้นหาจากชื่อ นามสกุล รหัสนักเรียน
  class_level?: string;       // ชั้นเรียน เช่น "ป.3"
  classroom?: string;         // ห้อง เช่น "ป.3/1"
  academic_year?: number;     // ปีการศึกษา เช่น 2568
  status?: StudentStatus;     // สถานะ: "active" | "graduated" | "transferred" | "dropped"
  risk_level?: RiskLevel;     // ระดับความเสี่ยง: "low" | "medium" | "high" | "critical"
  sort?: string;              // เรียงตาม: "name" | "student_id" | "created_at" | "risk_level"
  order?: "asc" | "desc";    // ทิศทาง (default: "asc")
  teacher_id?: UUID;          // กรองตามครูประจำชั้น
}
```

**ตัวอย่าง Request:**

```
GET /api/students?page=1&limit=20&class_level=ป.3&status=active&academic_year=2568
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "student_id": "65001",
      "prefix": "เด็กชาย",
      "first_name": "สมศักดิ์",
      "last_name": "มีสุข",
      "nickname": "เอก",
      "date_of_birth": "2016-03-15",
      "age": 10,
      "gender": "male",
      "class_level": "ป.3",
      "classroom": "ป.3/1",
      "academic_year": 2568,
      "status": "active",
      "avatar_url": "https://xxx.supabase.co/storage/v1/object/public/students/65001.jpg",
      "risk_level": "low",
      "teacher": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "สมศรี ใจดี"
      },
      "created_at": "2025-05-01T08:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### GET `/api/students/:id`

**คำอธิบาย:** ดึงข้อมูลนักเรียนรายบุคคลแบบละเอียด

**สิทธิ์ที่ต้องการ:** `teacher` (เฉพาะนักเรียนในความดูแล), `counselor`, `admin`, `super_admin`

**Path Parameters:**

| Parameter | Type | คำอธิบาย |
|---|---|---|
| `id` | UUID | รหัส UUID ของนักเรียน |

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "student_id": "65001",
    "prefix": "เด็กชาย",
    "first_name": "สมศักดิ์",
    "last_name": "มีสุข",
    "nickname": "เอก",
    "date_of_birth": "2016-03-15",
    "age": 10,
    "gender": "male",
    "national_id": "1-XXXX-XXXXX-XX-X",
    "blood_type": "O",
    "class_level": "ป.3",
    "classroom": "ป.3/1",
    "academic_year": 2568,
    "status": "active",
    "avatar_url": "https://xxx.supabase.co/storage/v1/object/public/students/65001.jpg",
    "address": {
      "house_number": "123/4",
      "village": "หมู่ 5",
      "sub_district": "ท่าศาลา",
      "district": "เมือง",
      "province": "นครศรีธรรมราช",
      "postal_code": "80000",
      "coordinates": {
        "lat": 8.4304,
        "lng": 99.9631
      }
    },
    "family": {
      "father": {
        "name": "สมบัติ มีสุข",
        "occupation": "เกษตรกร",
        "phone": "081-111-2222",
        "income": 10000,
        "status": "alive"
      },
      "mother": {
        "name": "สมใจ มีสุข",
        "occupation": "แม่บ้าน",
        "phone": "081-333-4444",
        "income": 5000,
        "status": "alive"
      },
      "guardian": null,
      "siblings_count": 2,
      "birth_order": 1,
      "family_status": "parents_together",
      "household_income": 15000
    },
    "health": {
      "weight": 30.5,
      "height": 130,
      "bmi": 18.05,
      "bmi_status": "normal",
      "allergies": ["ถั่ว"],
      "chronic_diseases": [],
      "disabilities": [],
      "special_needs": null
    },
    "teacher": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "สมศรี ใจดี"
    },
    "risk_level": "low",
    "risk_score": 15,
    "created_at": "2025-05-01T08:00:00Z",
    "updated_at": "2026-06-01T10:00:00Z"
  }
}
```

---

### GET `/api/students/:id/profile`

**คำอธิบาย:** ดึงข้อมูล profile ครบวงจรของนักเรียน รวมสรุปการเข้าเรียน ผลการเรียน พฤติกรรม ความเสี่ยง และแผนพัฒนา

**สิทธิ์ที่ต้องการ:** `teacher` (เฉพาะนักเรียนในความดูแล), `counselor`, `admin`, `super_admin`

**Path Parameters:**

| Parameter | Type | คำอธิบาย |
|---|---|---|
| `id` | UUID | รหัส UUID ของนักเรียน |

**Query Parameters:**

```typescript
interface ProfileParams {
  academic_year?: number;   // ปีการศึกษา (default: ปีปัจจุบัน)
  semester?: Semester;      // ภาคเรียน (default: ภาคเรียนปัจจุบัน)
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "student": { "...": "ข้อมูลนักเรียน (เหมือน GET /api/students/:id)" },
    "attendance_summary": {
      "total_days": 100,
      "present": 92,
      "absent": 5,
      "late": 2,
      "leave": 1,
      "attendance_rate": 92.0
    },
    "academic_summary": {
      "gpa": 3.25,
      "subjects": [
        { "name": "ภาษาไทย", "score": 78, "grade": "3" },
        { "name": "คณิตศาสตร์", "score": 85, "grade": "3.5" },
        { "name": "วิทยาศาสตร์", "score": 72, "grade": "2.5" }
      ],
      "basic_skills": {
        "reading": "good",
        "writing": "fair",
        "math": "good"
      },
      "trend": "improving"
    },
    "behavior_summary": {
      "good_behaviors": 12,
      "watch_behaviors": 3,
      "assignment_submission_rate": 88.5,
      "recent_behaviors": [
        {
          "type": "good",
          "description": "ช่วยเพื่อนทำความสะอาดห้อง",
          "date": "2026-06-05"
        }
      ]
    },
    "risk_assessment": {
      "risk_level": "low",
      "risk_score": 15,
      "risk_factors": [],
      "last_assessed_at": "2026-06-01T00:00:00Z"
    },
    "active_support_cases": 0,
    "active_idp": null,
    "home_visits_count": 1,
    "last_home_visit": "2026-03-15"
  }
}
```

---

### Server Action — `createStudent`

**คำอธิบาย:** เพิ่มข้อมูลนักเรียนใหม่

**ไฟล์:** `app/actions/students.ts`

**สิทธิ์ที่ต้องการ:** `teacher`, `admin`, `super_admin`

```typescript
"use server";

import { z } from "zod";

const createStudentSchema = z.object({
  student_id: z.string().min(1, "กรุณากรอกรหัสนักเรียน"),
  prefix: z.enum(["เด็กชาย", "เด็กหญิง", "นาย", "นางสาว"]),
  first_name: z.string().min(1, "กรุณากรอกชื่อ"),
  last_name: z.string().min(1, "กรุณากรอกนามสกุล"),
  nickname: z.string().optional(),
  date_of_birth: z.string().date("รูปแบบวันเกิดไม่ถูกต้อง"),
  gender: z.enum(["male", "female"]),
  national_id: z.string().length(13, "เลขบัตรประชาชนต้อง 13 หลัก").optional(),
  blood_type: z.enum(["A", "B", "AB", "O"]).optional(),
  class_level: z.string().min(1, "กรุณาเลือกชั้นเรียน"),
  classroom: z.string().min(1, "กรุณาเลือกห้องเรียน"),
  academic_year: z.number().int(),
  // ข้อมูลที่อยู่
  address: z.object({
    house_number: z.string().optional(),
    village: z.string().optional(),
    sub_district: z.string().optional(),
    district: z.string().optional(),
    province: z.string().optional(),
    postal_code: z.string().optional(),
  }).optional(),
  // ข้อมูลครอบครัว
  family: z.object({
    father_name: z.string().optional(),
    father_occupation: z.string().optional(),
    father_phone: z.string().optional(),
    father_income: z.number().optional(),
    mother_name: z.string().optional(),
    mother_occupation: z.string().optional(),
    mother_phone: z.string().optional(),
    mother_income: z.number().optional(),
    guardian_name: z.string().optional(),
    guardian_phone: z.string().optional(),
    guardian_relation: z.string().optional(),
    siblings_count: z.number().int().optional(),
    family_status: z.enum([
      "parents_together",
      "parents_separated",
      "single_parent",
      "orphan",
      "with_guardian"
    ]).optional(),
  }).optional(),
  // ข้อมูลสุขภาพ
  health: z.object({
    weight: z.number().positive().optional(),
    height: z.number().positive().optional(),
    allergies: z.array(z.string()).optional(),
    chronic_diseases: z.array(z.string()).optional(),
    disabilities: z.array(z.string()).optional(),
    special_needs: z.string().optional(),
  }).optional(),
});

type CreateStudentInput = z.infer<typeof createStudentSchema>;

export async function createStudent(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult>;
```

**Response (ActionResult):**

```typescript
// สำเร็จ
{
  success: true,
  message: "เพิ่มข้อมูลนักเรียนสำเร็จ",
  data: { id: "new-student-uuid" }
}

// ไม่สำเร็จ
{
  success: false,
  message: "ไม่สามารถเพิ่มข้อมูลได้",
  errors: {
    student_id: ["รหัสนักเรียนซ้ำ"],
    first_name: ["กรุณากรอกชื่อ"]
  }
}
```

---

### Server Action — `updateStudent`

**คำอธิบาย:** แก้ไขข้อมูลนักเรียน

**ไฟล์:** `app/actions/students.ts`

**สิทธิ์ที่ต้องการ:** `teacher` (เฉพาะนักเรียนในความดูแล), `admin`, `super_admin`

```typescript
"use server";

export async function updateStudent(
  studentId: UUID,
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult>;
```

> [!NOTE]
> ใช้ `.bind(null, studentId)` เมื่อส่งค่า `studentId` จาก client component:
> ```typescript
> const updateWithId = updateStudent.bind(null, studentId);
> const [state, formAction] = useActionState(updateWithId, initialState);
> ```

---

### Server Action — `deleteStudent`

**คำอธิบาย:** ลบข้อมูลนักเรียน (soft delete — เปลี่ยนสถานะเป็น `inactive`)

**ไฟล์:** `app/actions/students.ts`

**สิทธิ์ที่ต้องการ:** `admin`, `super_admin`

```typescript
"use server";

export async function deleteStudent(studentId: UUID): Promise<ActionResult>;
```

---

### POST `/api/students/import`

**คำอธิบาย:** นำเข้าข้อมูลนักเรียนจากไฟล์ CSV หรือ Excel (.xlsx)

**สิทธิ์ที่ต้องการ:** `admin`, `super_admin`

**Content-Type:** `multipart/form-data`

**Request Body:**

| Field | Type | คำอธิบาย |
|---|---|---|
| `file` | File | ไฟล์ CSV หรือ XLSX (required, max 5MB) |
| `academic_year` | number | ปีการศึกษา (required) |
| `classroom` | string | ห้องเรียน (required) |
| `skip_duplicates` | boolean | ข้ามรหัสนักเรียนที่ซ้ำ (default: false) |

**ตัวอย่าง Request (cURL):**

```bash
curl -X POST /api/students/import \
  -H "Authorization: Bearer <token>" \
  -F "file=@students.csv" \
  -F "academic_year=2568" \
  -F "classroom=ป.3/1" \
  -F "skip_duplicates=true"
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "total_rows": 30,
    "imported": 28,
    "skipped": 2,
    "errors": [
      {
        "row": 15,
        "field": "date_of_birth",
        "message": "รูปแบบวันเกิดไม่ถูกต้อง ต้องเป็น YYYY-MM-DD"
      },
      {
        "row": 22,
        "field": "student_id",
        "message": "รหัสนักเรียน 65015 มีอยู่ในระบบแล้ว (ข้าม)"
      }
    ]
  },
  "message": "นำเข้าข้อมูลสำเร็จ 28 จาก 30 รายการ"
}
```

**รูปแบบไฟล์ CSV ที่รองรับ:**

```csv
รหัสนักเรียน,คำนำหน้า,ชื่อ,นามสกุล,ชื่อเล่น,วันเกิด,เพศ,เลขบัตรประชาชน
65001,เด็กชาย,สมศักดิ์,มีสุข,เอก,2016-03-15,male,1234567890123
65002,เด็กหญิง,สมหญิง,ดีใจ,หนึ่ง,2016-06-20,female,1234567890124
```

---

## 3. Attendance Module

บันทึกและจัดการข้อมูลการเข้าเรียนของนักเรียน

---

### Server Action — `recordAttendance`

**คำอธิบาย:** บันทึกการเข้าเรียนประจำวัน (บันทึกพร้อมกันทั้งห้อง — bulk recording)

**ไฟล์:** `app/actions/attendance.ts`

**สิทธิ์ที่ต้องการ:** `teacher`, `admin`

```typescript
"use server";

interface AttendanceRecord {
  student_id: UUID;                // รหัส UUID นักเรียน (required)
  status: AttendanceStatus;        // สถานะ (required)
  note?: string;                   // หมายเหตุ
}

type AttendanceStatus = "present" | "absent" | "late" | "leave" | "sick";

interface RecordAttendanceInput {
  date: string;                    // วันที่ YYYY-MM-DD (required)
  classroom: string;               // ห้องเรียน เช่น "ป.3/1" (required)
  academic_year: number;           // ปีการศึกษา (required)
  semester: Semester;              // ภาคเรียน (required)
  period: "morning" | "afternoon"; // ช่วงเช้า/บ่าย (required)
  records: AttendanceRecord[];     // รายการเข้าเรียนของนักเรียน (required)
}

export async function recordAttendance(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult>;
```

**ตัวอย่างข้อมูลที่ส่ง (JSON ภายใน FormData):**

```json
{
  "date": "2026-06-09",
  "classroom": "ป.3/1",
  "academic_year": 2568,
  "semester": 1,
  "period": "morning",
  "records": [
    { "student_id": "uuid-1", "status": "present" },
    { "student_id": "uuid-2", "status": "present" },
    { "student_id": "uuid-3", "status": "absent", "note": "ผู้ปกครองแจ้งป่วย" },
    { "student_id": "uuid-4", "status": "late", "note": "มาสาย 15 นาที" },
    { "student_id": "uuid-5", "status": "leave", "note": "ลาพบแพทย์" }
  ]
}
```

**Response (ActionResult):**

```typescript
{
  success: true,
  message: "บันทึกการเข้าเรียนสำเร็จ ห้อง ป.3/1 วันที่ 9 มิ.ย. 2569",
  data: {
    recorded: 25,
    summary: {
      present: 22,
      absent: 1,
      late: 1,
      leave: 1
    }
  }
}
```

---

### GET `/api/attendance/student/:studentId`

**คำอธิบาย:** ดึงข้อมูลการเข้าเรียนของนักเรียนคนหนึ่ง

**สิทธิ์ที่ต้องการ:** `teacher`, `counselor`, `admin`, `super_admin`

**Path Parameters:**

| Parameter | Type | คำอธิบาย |
|---|---|---|
| `studentId` | UUID | รหัส UUID ของนักเรียน |

**Query Parameters:**

```typescript
interface AttendanceQueryParams {
  academic_year?: number;       // ปีการศึกษา (default: ปีปัจจุบัน)
  semester?: Semester;          // ภาคเรียน
  start_date?: string;         // วันที่เริ่มต้น (YYYY-MM-DD)
  end_date?: string;           // วันที่สิ้นสุด (YYYY-MM-DD)
  status?: AttendanceStatus;   // กรองตามสถานะ
  page?: number;
  limit?: number;
}
```

**ตัวอย่าง Request:**

```
GET /api/attendance/student/uuid-1?academic_year=2568&semester=1
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "student": {
      "id": "uuid-1",
      "name": "เด็กชายสมศักดิ์ มีสุข",
      "classroom": "ป.3/1"
    },
    "records": [
      {
        "id": "att-uuid-1",
        "date": "2026-06-09",
        "period": "morning",
        "status": "present",
        "note": null,
        "recorded_by": "สมศรี ใจดี",
        "recorded_at": "2026-06-09T08:30:00Z"
      },
      {
        "id": "att-uuid-2",
        "date": "2026-06-08",
        "period": "morning",
        "status": "absent",
        "note": "ไม่แจ้งลา",
        "recorded_by": "สมศรี ใจดี",
        "recorded_at": "2026-06-08T08:30:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5, "hasNext": true, "hasPrev": false }
  }
}
```

---

### GET `/api/attendance/statistics`

**คำอธิบาย:** ดึงสถิติการเข้าเรียน (ระดับนักเรียน, ห้อง, หรือโรงเรียน)

**สิทธิ์ที่ต้องการ:** `teacher`, `counselor`, `admin`, `super_admin`

**Query Parameters:**

```typescript
interface AttendanceStatsParams {
  level: "student" | "classroom" | "school";  // ระดับของสถิติ (required)
  student_id?: UUID;          // สำหรับ level=student
  classroom?: string;         // สำหรับ level=classroom เช่น "ป.3/1"
  academic_year: number;      // ปีการศึกษา (required)
  semester?: Semester;        // ภาคเรียน
  start_date?: string;       // วันที่เริ่มต้น
  end_date?: string;         // วันที่สิ้นสุด
}
```

**ตัวอย่าง Request:**

```
GET /api/attendance/statistics?level=classroom&classroom=ป.3/1&academic_year=2568&semester=1
```

**Response — `200 OK` (ระดับห้องเรียน):**

```json
{
  "success": true,
  "data": {
    "level": "classroom",
    "classroom": "ป.3/1",
    "academic_year": 2568,
    "semester": 1,
    "period": {
      "start_date": "2026-05-15",
      "end_date": "2026-06-09",
      "total_school_days": 20
    },
    "summary": {
      "total_students": 25,
      "average_attendance_rate": 93.2,
      "total_present": 466,
      "total_absent": 18,
      "total_late": 10,
      "total_leave": 6
    },
    "by_status": {
      "present": { "count": 466, "percentage": 93.2 },
      "absent": { "count": 18, "percentage": 3.6 },
      "late": { "count": 10, "percentage": 2.0 },
      "leave": { "count": 6, "percentage": 1.2 }
    },
    "daily_trend": [
      { "date": "2026-06-09", "present": 23, "absent": 1, "late": 1, "leave": 0, "rate": 92.0 },
      { "date": "2026-06-08", "present": 24, "absent": 0, "late": 0, "leave": 1, "rate": 96.0 }
    ],
    "students_at_risk": [
      {
        "student_id": "uuid-3",
        "name": "เด็กชายสมชาย ขยัน",
        "absent_count": 5,
        "attendance_rate": 75.0
      }
    ]
  }
}
```

---

### GET `/api/attendance/summary`

**คำอธิบาย:** ดึงสรุปภาพรวมการเข้าเรียนของทั้งโรงเรียน สำหรับ Dashboard

**สิทธิ์ที่ต้องการ:** `admin`, `super_admin`

**Query Parameters:**

```typescript
interface AttendanceSummaryParams {
  academic_year: number;    // ปีการศึกษา (required)
  semester?: Semester;
  date?: string;            // วันที่เฉพาะ (default: วันนี้)
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "date": "2026-06-09",
    "school_total_students": 120,
    "today": {
      "present": 110,
      "absent": 5,
      "late": 3,
      "leave": 2,
      "not_recorded": 0,
      "attendance_rate": 91.7
    },
    "by_class": [
      { "classroom": "ป.1/1", "total": 20, "present": 19, "absent": 1, "rate": 95.0 },
      { "classroom": "ป.2/1", "total": 22, "present": 20, "absent": 1, "late": 1, "rate": 90.9 },
      { "classroom": "ป.3/1", "total": 25, "present": 23, "absent": 1, "late": 1, "rate": 92.0 }
    ],
    "weekly_trend": [
      { "week": "2026-W23", "rate": 93.5 },
      { "week": "2026-W22", "rate": 91.2 },
      { "week": "2026-W21", "rate": 94.0 }
    ]
  }
}
```

---

## 4. Academic Performance Module

จัดการผลการเรียน คะแนนสอบ เกรดเฉลี่ย และทักษะพื้นฐาน

---

### Server Action — `recordScores`

**คำอธิบาย:** บันทึกคะแนนสอบ/คะแนนเก็บของนักเรียน

**ไฟล์:** `app/actions/academic.ts`

**สิทธิ์ที่ต้องการ:** `teacher`, `admin`

```typescript
"use server";

interface ScoreEntry {
  student_id: UUID;     // รหัส UUID นักเรียน (required)
  score: number;        // คะแนนที่ได้ (required, >= 0)
  note?: string;        // หมายเหตุ
}

interface RecordScoresInput {
  subject_id: UUID;                // รหัสวิชา (required)
  academic_year: number;           // ปีการศึกษา (required)
  semester: Semester;              // ภาคเรียน (required)
  assessment_type: AssessmentType; // ประเภทการประเมิน (required)
  assessment_name: string;         // ชื่อการประเมิน เช่น "สอบกลางภาค" (required)
  max_score: number;               // คะแนนเต็ม (required)
  classroom: string;               // ห้องเรียน (required)
  scores: ScoreEntry[];            // คะแนนรายคน (required)
}

type AssessmentType =
  | "exam_midterm"      // สอบกลางภาค
  | "exam_final"        // สอบปลายภาค
  | "quiz"              // แบบทดสอบย่อย
  | "assignment"        // การบ้าน/ใบงาน
  | "project"           // โครงงาน
  | "participation"     // คะแนนจิตพิสัย
  | "skill_assessment"; // ประเมินทักษะ

export async function recordScores(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult>;
```

**ตัวอย่างข้อมูล:**

```json
{
  "subject_id": "subj-uuid-thai",
  "academic_year": 2568,
  "semester": 1,
  "assessment_type": "exam_midterm",
  "assessment_name": "สอบกลางภาค ภาษาไทย",
  "max_score": 30,
  "classroom": "ป.3/1",
  "scores": [
    { "student_id": "uuid-1", "score": 25 },
    { "student_id": "uuid-2", "score": 28 },
    { "student_id": "uuid-3", "score": 15, "note": "ขาดข้อเขียน" }
  ]
}
```

**Response (ActionResult):**

```typescript
{
  success: true,
  message: "บันทึกคะแนนสอบกลางภาค ภาษาไทย สำเร็จ (25 คน)",
  data: {
    recorded: 25,
    statistics: {
      mean: 22.4,
      median: 23,
      min: 10,
      max: 30,
      std_dev: 4.8,
      pass_count: 22,
      fail_count: 3,
      pass_rate: 88.0
    }
  }
}
```

---

### GET `/api/academic/scores`

**คำอธิบาย:** ดึงข้อมูลคะแนนของนักเรียน/ห้องเรียน/วิชา

**สิทธิ์ที่ต้องการ:** `teacher`, `counselor`, `admin`, `super_admin`

**Query Parameters:**

```typescript
interface ScoresQueryParams {
  student_id?: UUID;          // กรองตามนักเรียน
  subject_id?: UUID;          // กรองตามวิชา
  classroom?: string;         // กรองตามห้องเรียน
  academic_year: number;      // ปีการศึกษา (required)
  semester?: Semester;        // ภาคเรียน
  assessment_type?: AssessmentType; // ประเภทการประเมิน
  page?: number;
  limit?: number;
}
```

**ตัวอย่าง Request:**

```
GET /api/academic/scores?student_id=uuid-1&academic_year=2568&semester=1
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "student": {
      "id": "uuid-1",
      "name": "เด็กชายสมศักดิ์ มีสุข"
    },
    "scores": [
      {
        "id": "score-uuid-1",
        "subject": {
          "id": "subj-uuid-thai",
          "name": "ภาษาไทย",
          "code": "TH101"
        },
        "assessment_type": "exam_midterm",
        "assessment_name": "สอบกลางภาค",
        "score": 25,
        "max_score": 30,
        "percentage": 83.3,
        "grade": null,
        "note": null,
        "recorded_by": "สมศรี ใจดี",
        "recorded_at": "2026-06-01T10:00:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 12, "totalPages": 1, "hasNext": false, "hasPrev": false }
  }
}
```

---

### GET `/api/academic/gpa/:studentId`

**คำอธิบาย:** คำนวณเกรดเฉลี่ย (GPA) ของนักเรียน

**สิทธิ์ที่ต้องการ:** `teacher`, `counselor`, `admin`, `super_admin`

**Path Parameters:**

| Parameter | Type | คำอธิบาย |
|---|---|---|
| `studentId` | UUID | รหัส UUID ของนักเรียน |

**Query Parameters:**

```typescript
interface GPAParams {
  academic_year?: number;   // ปีการศึกษา (default: ปีปัจจุบัน)
  semester?: Semester;      // ภาคเรียน (ถ้าไม่ระบุจะคำนวณทั้งปี)
  cumulative?: boolean;    // คำนวณ GPA สะสม (default: false)
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "student": {
      "id": "uuid-1",
      "name": "เด็กชายสมศักดิ์ มีสุข",
      "classroom": "ป.3/1"
    },
    "gpa": {
      "academic_year": 2568,
      "semester": 1,
      "semester_gpa": 3.25,
      "cumulative_gpa": 3.15,
      "credits_attempted": 14,
      "credits_earned": 14,
      "subjects": [
        {
          "subject": "ภาษาไทย",
          "credits": 2,
          "score": 78,
          "grade": "3",
          "grade_points": 6.0
        },
        {
          "subject": "คณิตศาสตร์",
          "credits": 2,
          "score": 85,
          "grade": "3.5",
          "grade_points": 7.0
        },
        {
          "subject": "วิทยาศาสตร์",
          "credits": 2,
          "score": 72,
          "grade": "2.5",
          "grade_points": 5.0
        },
        {
          "subject": "สังคมศึกษา",
          "credits": 2,
          "score": 80,
          "grade": "3",
          "grade_points": 6.0
        },
        {
          "subject": "ภาษาอังกฤษ",
          "credits": 2,
          "score": 90,
          "grade": "4",
          "grade_points": 8.0
        },
        {
          "subject": "ศิลปะ",
          "credits": 1,
          "score": 88,
          "grade": "3.5",
          "grade_points": 3.5
        },
        {
          "subject": "สุขศึกษา",
          "credits": 1,
          "score": 75,
          "grade": "2.5",
          "grade_points": 2.5
        },
        {
          "subject": "การงานอาชีพ",
          "credits": 2,
          "score": 82,
          "grade": "3",
          "grade_points": 6.0
        }
      ]
    },
    "trend": [
      { "academic_year": 2567, "semester": 1, "gpa": 3.00 },
      { "academic_year": 2567, "semester": 2, "gpa": 3.10 },
      { "academic_year": 2568, "semester": 1, "gpa": 3.25 }
    ]
  }
}
```

---

### GET `/api/academic/basic-skills/:studentId`

**คำอธิบาย:** ดึงผลประเมินทักษะพื้นฐาน (การอ่าน เขียน คิดคำนวณ) ของนักเรียน

**สิทธิ์ที่ต้องการ:** `teacher`, `counselor`, `admin`, `super_admin`

**Path Parameters:**

| Parameter | Type | คำอธิบาย |
|---|---|---|
| `studentId` | UUID | รหัส UUID ของนักเรียน |

**Query Parameters:**

```typescript
interface BasicSkillsParams {
  academic_year?: number;
  semester?: Semester;
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "student": {
      "id": "uuid-1",
      "name": "เด็กชายสมศักดิ์ มีสุข"
    },
    "academic_year": 2568,
    "semester": 1,
    "skills": {
      "reading": {
        "level": "good",
        "score": 85,
        "max_score": 100,
        "details": {
          "fluency": "good",
          "comprehension": "good",
          "vocabulary": "fair"
        },
        "assessed_at": "2026-05-20T09:00:00Z",
        "assessed_by": "สมศรี ใจดี"
      },
      "writing": {
        "level": "fair",
        "score": 68,
        "max_score": 100,
        "details": {
          "handwriting": "good",
          "spelling": "fair",
          "composition": "needs_improvement"
        },
        "assessed_at": "2026-05-20T09:00:00Z",
        "assessed_by": "สมศรี ใจดี"
      },
      "math": {
        "level": "good",
        "score": 80,
        "max_score": 100,
        "details": {
          "addition_subtraction": "good",
          "multiplication_division": "fair",
          "problem_solving": "good"
        },
        "assessed_at": "2026-05-20T09:00:00Z",
        "assessed_by": "สมศรี ใจดี"
      }
    },
    "overall_level": "good",
    "trend": [
      { "semester": "2567/1", "reading": 70, "writing": 55, "math": 65 },
      { "semester": "2567/2", "reading": 78, "writing": 62, "math": 72 },
      { "semester": "2568/1", "reading": 85, "writing": 68, "math": 80 }
    ]
  }
}
```

> [!NOTE]
> ระดับ (`level`) ประกอบด้วย: `"excellent"` (ดีมาก), `"good"` (ดี), `"fair"` (พอใช้), `"needs_improvement"` (ต้องปรับปรุง), `"critical"` (วิกฤต)

---

### Server Action — `recordBasicSkillAssessment`

**คำอธิบาย:** บันทึกผลประเมินทักษะพื้นฐาน (อ่าน เขียน คิดเลข)

**ไฟล์:** `app/actions/academic.ts`

**สิทธิ์ที่ต้องการ:** `teacher`, `admin`

```typescript
"use server";

interface BasicSkillInput {
  student_id: UUID;
  academic_year: number;
  semester: Semester;
  skill_type: "reading" | "writing" | "math";
  score: number;
  max_score: number;
  details: Record<string, SkillLevel>;
  note?: string;
}

type SkillLevel = "excellent" | "good" | "fair" | "needs_improvement" | "critical";

export async function recordBasicSkillAssessment(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult>;
```

---

### GET `/api/academic/trend/:studentId`

**คำอธิบาย:** วิเคราะห์แนวโน้มผลการเรียนของนักเรียน (Trend Analysis)

**สิทธิ์ที่ต้องการ:** `teacher`, `counselor`, `admin`, `super_admin`

**Path Parameters:**

| Parameter | Type | คำอธิบาย |
|---|---|---|
| `studentId` | UUID | รหัส UUID ของนักเรียน |

**Query Parameters:**

```typescript
interface TrendParams {
  subject_id?: UUID;       // ดูแนวโน้มเฉพาะวิชา
  periods?: number;        // จำนวนภาคเรียนย้อนหลัง (default: 6)
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "student": {
      "id": "uuid-1",
      "name": "เด็กชายสมศักดิ์ มีสุข"
    },
    "trend_analysis": {
      "direction": "improving",
      "change_rate": 5.2,
      "data_points": [
        {
          "academic_year": 2567,
          "semester": 1,
          "gpa": 3.00,
          "subjects": {
            "ภาษาไทย": 70,
            "คณิตศาสตร์": 75,
            "วิทยาศาสตร์": 65
          }
        },
        {
          "academic_year": 2567,
          "semester": 2,
          "gpa": 3.10,
          "subjects": {
            "ภาษาไทย": 75,
            "คณิตศาสตร์": 80,
            "วิทยาศาสตร์": 68
          }
        },
        {
          "academic_year": 2568,
          "semester": 1,
          "gpa": 3.25,
          "subjects": {
            "ภาษาไทย": 78,
            "คณิตศาสตร์": 85,
            "วิทยาศาสตร์": 72
          }
        }
      ],
      "insights": [
        "ผลการเรียนมีแนวโน้มดีขึ้นต่อเนื่อง 3 ภาคเรียน",
        "คณิตศาสตร์ เป็นวิชาที่มีพัฒนาการดีที่สุด (+10 คะแนน)",
        "วิทยาศาสตร์ ยังเป็นวิชาที่ต้องให้ความสนใจเพิ่มเติม"
      ]
    }
  }
}
```

---

## 5. Behavior Module

บันทึกพฤติกรรมนักเรียน (ทั้งพฤติกรรมดีและพฤติกรรมที่ต้องเฝ้าระวัง) และสถานะการส่งงาน

---

### Server Action — `recordBehavior`

**คำอธิบาย:** บันทึกพฤติกรรมนักเรียน (ดี/เฝ้าระวัง)

**ไฟล์:** `app/actions/behavior.ts`

**สิทธิ์ที่ต้องการ:** `teacher`, `counselor`, `admin`

```typescript
"use server";

interface RecordBehaviorInput {
  student_id: UUID;                        // รหัส UUID นักเรียน (required)
  type: "good" | "watch";                  // ประเภทพฤติกรรม (required)
  category: BehaviorCategory;             // หมวดหมู่ (required)
  description: string;                     // รายละเอียดพฤติกรรม (required)
  date: string;                            // วันที่เกิดเหตุ YYYY-MM-DD (required)
  severity?: "low" | "medium" | "high";    // ระดับความรุนแรง (สำหรับ type=watch)
  action_taken?: string;                   // การดำเนินการที่ทำ
  witnesses?: string[];                    // พยาน/ผู้เห็นเหตุการณ์
  notify_parent?: boolean;                 // แจ้งผู้ปกครอง (default: false)
}

type BehaviorCategory =
  // พฤติกรรมดี
  | "helpfulness"       // ช่วยเหลือผู้อื่น
  | "leadership"        // ความเป็นผู้นำ
  | "academic_effort"   // ความมุ่งมั่นทางวิชาการ
  | "good_manner"       // มารยาทดี
  | "creativity"        // ความคิดสร้างสรรค์
  | "sportsmanship"     // น้ำใจนักกีฬา
  | "volunteering"      // จิตอาสา
  // พฤติกรรมเฝ้าระวัง
  | "aggression"        // ก้าวร้าว/ทำร้ายผู้อื่น
  | "bullying"          // กลั่นแกล้ง
  | "truancy"           // หนีเรียน
  | "defiance"          // ไม่เชื่อฟัง
  | "substance"         // เกี่ยวข้องสารเสพติด
  | "isolation"         // เก็บตัว/แยกตัว
  | "emotional"         // ปัญหาอารมณ์
  | "other";            // อื่น ๆ

export async function recordBehavior(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult>;
```

**ตัวอย่างข้อมูล — พฤติกรรมดี:**

```json
{
  "student_id": "uuid-1",
  "type": "good",
  "category": "helpfulness",
  "description": "ช่วยเพื่อนที่หกล้มพาไปห้องพยาบาลและดูแลจนกว่าผู้ปกครองจะมารับ",
  "date": "2026-06-09"
}
```

**ตัวอย่างข้อมูล — พฤติกรรมเฝ้าระวัง:**

```json
{
  "student_id": "uuid-3",
  "type": "watch",
  "category": "aggression",
  "description": "ทะเลาะวิวาทกับเพื่อนร่วมชั้นเรียนระหว่างพักเที่ยง",
  "date": "2026-06-09",
  "severity": "medium",
  "action_taken": "เรียกพูดคุยตักเตือน และโทรแจ้งผู้ปกครอง",
  "witnesses": ["เด็กหญิงสมหญิง ดีใจ", "เด็กชายสมบูรณ์ มาก"],
  "notify_parent": true
}
```

---

### Server Action — `recordAssignmentSubmission`

**คำอธิบาย:** บันทึกสถานะการส่งงาน/การบ้าน

**ไฟล์:** `app/actions/behavior.ts`

**สิทธิ์ที่ต้องการ:** `teacher`, `admin`

```typescript
"use server";

interface AssignmentSubmissionInput {
  assignment_name: string;         // ชื่องาน (required)
  subject_id: UUID;               // รหัสวิชา (required)
  classroom: string;              // ห้องเรียน (required)
  due_date: string;               // วันกำหนดส่ง YYYY-MM-DD (required)
  academic_year: number;          // ปีการศึกษา (required)
  semester: Semester;             // ภาคเรียน (required)
  submissions: SubmissionEntry[]; // รายการส่งงาน (required)
}

interface SubmissionEntry {
  student_id: UUID;
  status: "submitted" | "late" | "not_submitted";
  submitted_date?: string;
  note?: string;
}

export async function recordAssignmentSubmission(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult>;
```

---

### GET `/api/behavior/student/:studentId`

**คำอธิบาย:** ดึงประวัติพฤติกรรมของนักเรียน

**สิทธิ์ที่ต้องการ:** `teacher`, `counselor`, `admin`, `super_admin`

**Path Parameters:**

| Parameter | Type | คำอธิบาย |
|---|---|---|
| `studentId` | UUID | รหัส UUID ของนักเรียน |

**Query Parameters:**

```typescript
interface BehaviorHistoryParams {
  type?: "good" | "watch";      // กรองตามประเภท
  category?: BehaviorCategory;  // กรองตามหมวดหมู่
  start_date?: string;          // วันที่เริ่มต้น
  end_date?: string;            // วันที่สิ้นสุด
  academic_year?: number;
  semester?: Semester;
  page?: number;
  limit?: number;
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "student": {
      "id": "uuid-1",
      "name": "เด็กชายสมศักดิ์ มีสุข"
    },
    "records": [
      {
        "id": "beh-uuid-1",
        "type": "good",
        "category": "helpfulness",
        "description": "ช่วยเพื่อนที่หกล้มพาไปห้องพยาบาล",
        "date": "2026-06-09",
        "severity": null,
        "action_taken": null,
        "recorded_by": "สมศรี ใจดี",
        "recorded_at": "2026-06-09T10:00:00Z"
      },
      {
        "id": "beh-uuid-2",
        "type": "watch",
        "category": "defiance",
        "description": "ไม่ทำตามกฎห้องเรียน พูดคุยขณะครูสอน",
        "date": "2026-06-05",
        "severity": "low",
        "action_taken": "ตักเตือนด้วยวาจา",
        "recorded_by": "สมศรี ใจดี",
        "recorded_at": "2026-06-05T14:00:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 15, "totalPages": 1, "hasNext": false, "hasPrev": false }
  }
}
```

---

### GET `/api/behavior/statistics`

**คำอธิบาย:** ดึงสถิติพฤติกรรมรวม (ระดับนักเรียน/ห้อง/โรงเรียน)

**สิทธิ์ที่ต้องการ:** `teacher`, `counselor`, `admin`, `super_admin`

**Query Parameters:**

```typescript
interface BehaviorStatsParams {
  level: "student" | "classroom" | "school";
  student_id?: UUID;
  classroom?: string;
  academic_year: number;
  semester?: Semester;
}
```

**Response — `200 OK` (ระดับนักเรียน):**

```json
{
  "success": true,
  "data": {
    "student": {
      "id": "uuid-1",
      "name": "เด็กชายสมศักดิ์ มีสุข"
    },
    "period": { "academic_year": 2568, "semester": 1 },
    "summary": {
      "total_records": 15,
      "good_behaviors": 12,
      "watch_behaviors": 3,
      "good_ratio": 80.0
    },
    "by_category": {
      "good": [
        { "category": "helpfulness", "count": 5 },
        { "category": "academic_effort", "count": 4 },
        { "category": "good_manner", "count": 3 }
      ],
      "watch": [
        { "category": "defiance", "count": 2 },
        { "category": "emotional", "count": 1 }
      ]
    },
    "assignment_submission": {
      "total_assignments": 30,
      "submitted": 27,
      "late": 2,
      "not_submitted": 1,
      "submission_rate": 90.0,
      "on_time_rate": 90.0
    },
    "monthly_trend": [
      { "month": "2026-05", "good": 4, "watch": 1 },
      { "month": "2026-06", "good": 3, "watch": 0 }
    ]
  }
}
```

---

## 6. Home Visit Module

จัดการข้อมูลการเยี่ยมบ้านนักเรียน พร้อมรูปถ่าย

---

### Server Action — `createHomeVisit`

**คำอธิบาย:** สร้างบันทึกการเยี่ยมบ้าน

**ไฟล์:** `app/actions/homevisit.ts`

**สิทธิ์ที่ต้องการ:** `teacher`, `counselor`, `admin`

```typescript
"use server";

interface CreateHomeVisitInput {
  student_id: UUID;                  // รหัส UUID นักเรียน (required)
  visit_date: string;               // วันที่เยี่ยมบ้าน YYYY-MM-DD (required)
  academic_year: number;            // ปีการศึกษา (required)
  semester: Semester;               // ภาคเรียน (required)
  visit_type: VisitType;           // ประเภทการเยี่ยมบ้าน (required)
  objectives: string[];             // วัตถุประสงค์ (required, min 1)
  findings: string;                 // สิ่งที่พบ/ข้อสังเกต (required)
  family_condition: FamilyCondition; // สภาพครอบครัว (required)
  living_condition: LivingCondition; // สภาพที่อยู่อาศัย (required)
  student_behavior_at_home: string;  // พฤติกรรมนักเรียนที่บ้าน
  parent_feedback: string;          // ความคิดเห็นของผู้ปกครอง
  recommendations: string[];        // ข้อเสนอแนะ
  follow_up_needed: boolean;        // ต้องติดตามต่อ
  follow_up_date?: string;          // วันที่นัดติดตาม
  coordinates?: {                   // พิกัด GPS
    lat: number;
    lng: number;
  };
}

type VisitType = "regular" | "follow_up" | "emergency" | "requested";

type FamilyCondition =
  | "stable"          // มั่นคง
  | "moderate"        // ปานกลาง
  | "unstable"        // ไม่มั่นคง
  | "critical";       // วิกฤต

type LivingCondition =
  | "good"            // ดี
  | "adequate"        // พอเพียง
  | "poor"            // แออัด/ชำรุด
  | "inadequate";     // ไม่เหมาะสม

export async function createHomeVisit(
  prevState: ActionResult,
  formData: FormData  // รวม images ใน FormData
): Promise<ActionResult>;
```

**ตัวอย่างข้อมูล:**

```json
{
  "student_id": "uuid-1",
  "visit_date": "2026-06-08",
  "academic_year": 2568,
  "semester": 1,
  "visit_type": "regular",
  "objectives": [
    "สำรวจสภาพความเป็นอยู่",
    "พูดคุยกับผู้ปกครองเรื่องผลการเรียน",
    "สังเกตสภาพแวดล้อมที่บ้าน"
  ],
  "findings": "นักเรียนอาศัยอยู่กับปู่ย่า บิดามารดาทำงานต่างจังหวัด สภาพบ้านปานกลาง มีอุปกรณ์การเรียนเพียงพอ",
  "family_condition": "moderate",
  "living_condition": "adequate",
  "student_behavior_at_home": "นักเรียนช่วยงานบ้าน ทำการบ้านสม่ำเสมอ แต่มีเวลาเล่นโทรศัพท์มากเกินไป",
  "parent_feedback": "ปู่ย่าต้องการให้ครูช่วยดูแลเรื่องการเรียนเพิ่มเติม",
  "recommendations": [
    "ส่งเสริมให้อ่านหนังสือเพิ่มขึ้น",
    "จำกัดเวลาใช้โทรศัพท์"
  ],
  "follow_up_needed": true,
  "follow_up_date": "2026-08-15",
  "coordinates": { "lat": 8.4304, "lng": 99.9631 }
}
```

**Response (ActionResult):**

```typescript
{
  success: true,
  message: "บันทึกการเยี่ยมบ้านสำเร็จ",
  data: { id: "visit-uuid-1" }
}
```

---

### POST `/api/homevisit/:visitId/images`

**คำอธิบาย:** อัปโหลดรูปถ่ายจากการเยี่ยมบ้าน

**สิทธิ์ที่ต้องการ:** `teacher`, `counselor`, `admin`

**Content-Type:** `multipart/form-data`

**Path Parameters:**

| Parameter | Type | คำอธิบาย |
|---|---|---|
| `visitId` | UUID | รหัส UUID ของการเยี่ยมบ้าน |

**Request Body:**

| Field | Type | คำอธิบาย |
|---|---|---|
| `images` | File[] | รูปถ่าย (max 10 ไฟล์, แต่ละไฟล์ max 5MB) |
| `captions` | string[] | คำบรรยายรูป (optional, ตรงกับลำดับรูป) |

**ตัวอย่าง Request (cURL):**

```bash
curl -X POST /api/homevisit/visit-uuid-1/images \
  -H "Authorization: Bearer <token>" \
  -F "images=@house_front.jpg" \
  -F "images=@house_inside.jpg" \
  -F "captions=ด้านหน้าบ้าน" \
  -F "captions=ภายในบ้าน"
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "uploaded": 2,
    "images": [
      {
        "id": "img-uuid-1",
        "url": "https://xxx.supabase.co/storage/v1/object/public/homevisits/visit-uuid-1/house_front.jpg",
        "caption": "ด้านหน้าบ้าน",
        "size": 1234567
      },
      {
        "id": "img-uuid-2",
        "url": "https://xxx.supabase.co/storage/v1/object/public/homevisits/visit-uuid-1/house_inside.jpg",
        "caption": "ภายในบ้าน",
        "size": 2345678
      }
    ]
  },
  "message": "อัปโหลดรูปถ่ายสำเร็จ 2 รูป"
}
```

**Error Responses:**

| Status | Code | สาเหตุ |
|---|---|---|
| `400` | `VALIDATION_ERROR` | ไม่มีไฟล์ หรือไฟล์ไม่ใช่รูปภาพ |
| `404` | `NOT_FOUND` | ไม่พบข้อมูลการเยี่ยมบ้าน |
| `413` | `FILE_TOO_LARGE` | ไฟล์มีขนาดใหญ่เกิน 5MB |

---

### GET `/api/homevisit/student/:studentId`

**คำอธิบาย:** ดึงประวัติการเยี่ยมบ้านของนักเรียน

**สิทธิ์ที่ต้องการ:** `teacher`, `counselor`, `admin`, `super_admin`

**Path Parameters:**

| Parameter | Type | คำอธิบาย |
|---|---|---|
| `studentId` | UUID | รหัส UUID ของนักเรียน |

**Query Parameters:**

```typescript
interface HomeVisitHistoryParams {
  academic_year?: number;
  semester?: Semester;
  visit_type?: VisitType;
  page?: number;
  limit?: number;
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "student": {
      "id": "uuid-1",
      "name": "เด็กชายสมศักดิ์ มีสุข"
    },
    "visits": [
      {
        "id": "visit-uuid-1",
        "visit_date": "2026-06-08",
        "visit_type": "regular",
        "objectives": ["สำรวจสภาพความเป็นอยู่", "พูดคุยกับผู้ปกครองเรื่องผลการเรียน"],
        "findings": "นักเรียนอาศัยอยู่กับปู่ย่า...",
        "family_condition": "moderate",
        "living_condition": "adequate",
        "follow_up_needed": true,
        "follow_up_date": "2026-08-15",
        "images": [
          {
            "id": "img-uuid-1",
            "url": "https://xxx.supabase.co/storage/v1/object/public/homevisits/visit-uuid-1/house_front.jpg",
            "caption": "ด้านหน้าบ้าน"
          }
        ],
        "visited_by": "สมศรี ใจดี",
        "created_at": "2026-06-08T16:00:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 3, "totalPages": 1, "hasNext": false, "hasPrev": false }
  }
}
```

---

### Server Action — `updateHomeVisit`

**คำอธิบาย:** แก้ไขข้อมูลการเยี่ยมบ้าน

**ไฟล์:** `app/actions/homevisit.ts`

**สิทธิ์ที่ต้องการ:** `teacher` (เฉพาะที่ตนเองบันทึก), `admin`, `super_admin`

```typescript
"use server";

export async function updateHomeVisit(
  visitId: UUID,
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult>;
```

---

### Server Action — `deleteHomeVisit`

**คำอธิบาย:** ลบข้อมูลการเยี่ยมบ้าน (soft delete)

**ไฟล์:** `app/actions/homevisit.ts`

**สิทธิ์ที่ต้องการ:** `admin`, `super_admin`

```typescript
"use server";

export async function deleteHomeVisit(visitId: UUID): Promise<ActionResult>;
```

---

## 7. Support/Assistance Module

จัดการข้อมูลการให้ความช่วยเหลือ/สนับสนุนนักเรียน ตั้งแต่การสร้างเคส ติดตาม ไปจนถึงปิดเคส

---

### Server Action — `createSupportCase`

**คำอธิบาย:** สร้างบันทึกการให้ความช่วยเหลือ/สนับสนุน

**ไฟล์:** `app/actions/support.ts`

**สิทธิ์ที่ต้องการ:** `teacher`, `counselor`, `admin`

```typescript
"use server";

interface CreateSupportCaseInput {
  student_id: UUID;                     // รหัส UUID นักเรียน (required)
  academic_year: number;               // ปีการศึกษา (required)
  semester: Semester;                   // ภาคเรียน (required)
  case_type: SupportCaseType;          // ประเภทการช่วยเหลือ (required)
  priority: "low" | "medium" | "high" | "urgent"; // ความเร่งด่วน (required)
  title: string;                        // หัวเรื่อง (required)
  description: string;                  // รายละเอียด (required)
  identified_issues: string[];          // ปัญหาที่พบ (required, min 1)
  initial_action: string;               // การดำเนินการเบื้องต้น
  referred_by?: UUID;                   // ผู้ส่งต่อ (ถ้ามี)
  assigned_to?: UUID;                   // มอบหมายให้ (ถ้าไม่ระบุ = ตนเอง)
}

type SupportCaseType =
  | "academic"         // ด้านวิชาการ (เรียนอ่อน สอนเสริม)
  | "financial"        // ด้านการเงิน (ทุนการศึกษา ค่าอาหาร)
  | "health"           // ด้านสุขภาพ
  | "mental_health"    // ด้านสุขภาพจิต
  | "family"           // ด้านครอบครัว
  | "social"           // ด้านสังคม (การเข้ากับเพื่อน)
  | "behavioral"       // ด้านพฤติกรรม
  | "safety"           // ด้านความปลอดภัย
  | "other";           // อื่น ๆ

export async function createSupportCase(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult>;
```

**ตัวอย่างข้อมูล:**

```json
{
  "student_id": "uuid-3",
  "academic_year": 2568,
  "semester": 1,
  "case_type": "academic",
  "priority": "medium",
  "title": "ผลการเรียนต่ำกว่าเกณฑ์ วิชาภาษาไทย และคณิตศาสตร์",
  "description": "นักเรียนมีผลการเรียนต่ำกว่าเกณฑ์ 2 วิชาติดต่อกัน 2 ภาคเรียน จำเป็นต้องได้รับการสอนเสริม",
  "identified_issues": [
    "อ่านไม่ออก เขียนไม่ได้",
    "คำนวณพื้นฐานยังไม่ถูกต้อง",
    "ขาดเรียนบ่อย ทำให้เรียนไม่ทัน"
  ],
  "initial_action": "จัดสอนเสริมหลังเลิกเรียน วันจันทร์-พุธ-ศุกร์"
}
```

**Response (ActionResult):**

```typescript
{
  success: true,
  message: "สร้างเคสช่วยเหลือสำเร็จ",
  data: {
    id: "case-uuid-1",
    case_number: "SP-2568-001"
  }
}
```

---

### Server Action — `updateSupportStatus`

**คำอธิบาย:** อัปเดตสถานะของเคสช่วยเหลือ

**ไฟล์:** `app/actions/support.ts`

**สิทธิ์ที่ต้องการ:** `teacher`, `counselor`, `admin`

```typescript
"use server";

interface UpdateSupportStatusInput {
  case_id: UUID;                       // รหัสเคส (required)
  status: SupportCaseStatus;           // สถานะใหม่ (required)
  note?: string;                       // หมายเหตุ
  resolution_summary?: string;         // สรุปการแก้ไข (required when status = "resolved")
}

type SupportCaseStatus =
  | "open"              // เปิดเคส
  | "in_progress"       // กำลังดำเนินการ
  | "pending"           // รอดำเนินการ/รอข้อมูลเพิ่ม
  | "referred"          // ส่งต่อ
  | "resolved"          // แก้ไขแล้ว
  | "closed";           // ปิดเคส

export async function updateSupportStatus(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult>;
```

---

### Server Action — `addFollowUp`

**คำอธิบาย:** บันทึกการติดตามผล

**ไฟล์:** `app/actions/support.ts`

**สิทธิ์ที่ต้องการ:** `teacher`, `counselor`, `admin`

```typescript
"use server";

interface AddFollowUpInput {
  case_id: UUID;                     // รหัสเคส (required)
  follow_up_date: string;           // วันที่ติดตาม YYYY-MM-DD (required)
  description: string;              // รายละเอียดการติดตาม (required)
  outcome: string;                  // ผลลัพธ์ (required)
  next_action?: string;             // แผนดำเนินการต่อไป
  next_follow_up_date?: string;     // วันที่นัดติดตามครั้งต่อไป
  progress_rating?: 1 | 2 | 3 | 4 | 5; // ระดับความก้าวหน้า (1=ไม่ดีขึ้น, 5=ดีขึ้นมาก)
}

export async function addFollowUp(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult>;
```

**ตัวอย่างข้อมูล:**

```json
{
  "case_id": "case-uuid-1",
  "follow_up_date": "2026-06-15",
  "description": "ติดตามผลหลังสอนเสริม 1 สัปดาห์ นักเรียนเข้าเรียนเสริมครบทุกวัน",
  "outcome": "สามารถอ่านคำง่าย ๆ ได้ดีขึ้น สะกดคำ 2 พยางค์ได้บ้าง",
  "next_action": "สอนเสริมต่อเนื่อง เพิ่มแบบฝึกหัดการอ่าน",
  "next_follow_up_date": "2026-06-30",
  "progress_rating": 3
}
```

---

### GET `/api/support/student/:studentId`

**คำอธิบาย:** ดึงประวัติการให้ความช่วยเหลือของนักเรียน

**สิทธิ์ที่ต้องการ:** `teacher`, `counselor`, `admin`, `super_admin`

**Path Parameters:**

| Parameter | Type | คำอธิบาย |
|---|---|---|
| `studentId` | UUID | รหัส UUID ของนักเรียน |

**Query Parameters:**

```typescript
interface SupportHistoryParams {
  status?: SupportCaseStatus;
  case_type?: SupportCaseType;
  academic_year?: number;
  page?: number;
  limit?: number;
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "student": {
      "id": "uuid-3",
      "name": "เด็กชายสมชาย ขยัน"
    },
    "cases": [
      {
        "id": "case-uuid-1",
        "case_number": "SP-2568-001",
        "case_type": "academic",
        "priority": "medium",
        "status": "in_progress",
        "title": "ผลการเรียนต่ำกว่าเกณฑ์ วิชาภาษาไทย และคณิตศาสตร์",
        "description": "นักเรียนมีผลการเรียนต่ำกว่าเกณฑ์...",
        "identified_issues": [
          "อ่านไม่ออก เขียนไม่ได้",
          "คำนวณพื้นฐานยังไม่ถูกต้อง"
        ],
        "assigned_to": {
          "id": "teacher-uuid",
          "name": "สมศรี ใจดี"
        },
        "follow_ups": [
          {
            "id": "fu-uuid-1",
            "follow_up_date": "2026-06-15",
            "description": "ติดตามผลหลังสอนเสริม 1 สัปดาห์...",
            "outcome": "สามารถอ่านคำง่าย ๆ ได้ดีขึ้น...",
            "progress_rating": 3,
            "recorded_by": "สมศรี ใจดี"
          }
        ],
        "created_at": "2026-06-01T08:00:00Z",
        "updated_at": "2026-06-15T15:00:00Z"
      }
    ],
    "summary": {
      "total_cases": 2,
      "open": 0,
      "in_progress": 1,
      "resolved": 1
    },
    "pagination": { "page": 1, "limit": 10, "total": 2, "totalPages": 1, "hasNext": false, "hasPrev": false }
  }
}
```

---

## 8. Risk Assessment Module (Early Warning)

ระบบคัดกรองและประเมินความเสี่ยงของนักเรียน (ระบบเตือนภัยล่วงหน้า)

---

### GET `/api/risk/student/:studentId`

**คำอธิบาย:** ดึงผลประเมินความเสี่ยงของนักเรียนรายบุคคล

**สิทธิ์ที่ต้องการ:** `teacher`, `counselor`, `admin`, `super_admin`

**Path Parameters:**

| Parameter | Type | คำอธิบาย |
|---|---|---|
| `studentId` | UUID | รหัส UUID ของนักเรียน |

**Query Parameters:**

```typescript
interface RiskAssessmentParams {
  academic_year?: number;
  semester?: Semester;
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "student": {
      "id": "uuid-3",
      "name": "เด็กชายสมชาย ขยัน",
      "classroom": "ป.3/1"
    },
    "assessment": {
      "id": "risk-uuid-1",
      "academic_year": 2568,
      "semester": 1,
      "risk_level": "high",
      "risk_score": 72,
      "assessed_at": "2026-06-09T06:00:00Z",
      "factors": {
        "attendance": {
          "score": 20,
          "max_score": 25,
          "details": "อัตราเข้าเรียน 75% (ต่ำกว่าเกณฑ์ 80%)",
          "flag": true
        },
        "academic": {
          "score": 22,
          "max_score": 25,
          "details": "GPA 1.5 ต่ำกว่าเกณฑ์ มีวิชาไม่ผ่าน 2 วิชา",
          "flag": true
        },
        "behavior": {
          "score": 15,
          "max_score": 25,
          "details": "พฤติกรรมเฝ้าระวัง 5 ครั้ง ไม่ส่งงาน 30%",
          "flag": true
        },
        "family": {
          "score": 15,
          "max_score": 25,
          "details": "อาศัยกับปู่ย่า รายได้ครัวเรือนต่ำกว่า 5,000 บาท/เดือน",
          "flag": true
        }
      },
      "risk_breakdown": {
        "total_score": 72,
        "max_total": 100,
        "interpretation": {
          "0-25": "low — ความเสี่ยงต่ำ",
          "26-50": "medium — ความเสี่ยงปานกลาง",
          "51-75": "high — ความเสี่ยงสูง",
          "76-100": "critical — ความเสี่ยงวิกฤต"
        }
      },
      "recommendations": [
        "จัดสอนเสริมวิชาที่ไม่ผ่าน",
        "เยี่ยมบ้านเพื่อพูดคุยกับผู้ปกครอง",
        "ส่งต่อให้ครูแนะแนวดูแลด้านพฤติกรรม",
        "พิจารณาทุนอาหารกลางวัน/อุปกรณ์การเรียน"
      ],
      "history": [
        { "semester": "2567/2", "risk_level": "medium", "risk_score": 45 },
        { "semester": "2568/1", "risk_level": "high", "risk_score": 72 }
      ]
    }
  }
}
```

---

### POST `/api/risk/calculate/:studentId`

**คำอธิบาย:** คำนวณคะแนนความเสี่ยงสำหรับนักเรียนรายบุคคล (Re-calculate)

**สิทธิ์ที่ต้องการ:** `teacher`, `counselor`, `admin`, `super_admin`

**Path Parameters:**

| Parameter | Type | คำอธิบาย |
|---|---|---|
| `studentId` | UUID | รหัส UUID ของนักเรียน |

**Request Body:**

```typescript
interface CalculateRiskInput {
  academic_year: number;    // ปีการศึกษา (required)
  semester: Semester;       // ภาคเรียน (required)
  force?: boolean;          // คำนวณใหม่แม้มีผลล่าสุดแล้ว (default: false)
}
```

```json
{
  "academic_year": 2568,
  "semester": 1,
  "force": true
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "student_id": "uuid-3",
    "previous": {
      "risk_level": "medium",
      "risk_score": 45
    },
    "current": {
      "risk_level": "high",
      "risk_score": 72
    },
    "change": "+27 (เพิ่มขึ้น)",
    "alert": true,
    "assessed_at": "2026-06-09T11:00:00Z"
  },
  "message": "คำนวณคะแนนความเสี่ยงสำเร็จ"
}
```

---

### GET `/api/risk/at-risk-students`

**คำอธิบาย:** ดึงรายชื่อนักเรียนที่มีความเสี่ยง

**สิทธิ์ที่ต้องการ:** `teacher`, `counselor`, `admin`, `super_admin`

**Query Parameters:**

```typescript
interface AtRiskParams {
  academic_year: number;             // ปีการศึกษา (required)
  semester?: Semester;
  risk_level?: RiskLevel;           // กรองตามระดับ ("medium" | "high" | "critical")
  classroom?: string;               // กรองตามห้อง
  min_score?: number;               // คะแนนความเสี่ยงขั้นต่ำ
  has_support?: boolean;            // มี/ไม่มีเคสช่วยเหลือ
  sort?: "risk_score" | "name";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}
```

**ตัวอย่าง Request:**

```
GET /api/risk/at-risk-students?academic_year=2568&risk_level=high&sort=risk_score&order=desc
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": "uuid-3",
        "student_id": "65003",
        "name": "เด็กชายสมชาย ขยัน",
        "classroom": "ป.3/1",
        "risk_level": "high",
        "risk_score": 72,
        "risk_factors": ["attendance", "academic", "behavior", "family"],
        "has_active_support": true,
        "has_idp": false,
        "teacher": "สมศรี ใจดี",
        "last_assessed_at": "2026-06-09T06:00:00Z"
      },
      {
        "id": "uuid-7",
        "student_id": "65007",
        "name": "เด็กหญิงสมหญิง เรียนดี",
        "classroom": "ป.4/1",
        "risk_level": "high",
        "risk_score": 65,
        "risk_factors": ["attendance", "family"],
        "has_active_support": false,
        "has_idp": false,
        "teacher": "สมาน รักดี",
        "last_assessed_at": "2026-06-09T06:00:00Z"
      }
    ],
    "summary": {
      "total_at_risk": 8,
      "by_level": {
        "critical": 1,
        "high": 4,
        "medium": 3
      },
      "with_support": 5,
      "without_support": 3
    },
    "pagination": { "page": 1, "limit": 20, "total": 8, "totalPages": 1, "hasNext": false, "hasPrev": false }
  }
}
```

---

### POST `/api/risk/recalculate-all`

**คำอธิบาย:** คำนวณคะแนนความเสี่ยงใหม่ทั้งหมด (ทุกนักเรียน) — ใช้สำหรับ batch processing

**สิทธิ์ที่ต้องการ:** `admin`, `super_admin`

**Request Body:**

```typescript
interface RecalculateAllInput {
  academic_year: number;   // ปีการศึกษา (required)
  semester: Semester;      // ภาคเรียน (required)
  classroom?: string;     // จำกัดเฉพาะห้อง (ถ้าไม่ระบุ = ทั้งหมด)
}
```

```json
{
  "academic_year": 2568,
  "semester": 1
}
```

**Response — `202 Accepted`:**

```json
{
  "success": true,
  "data": {
    "job_id": "job-uuid-1",
    "total_students": 120,
    "status": "processing",
    "estimated_time_seconds": 30
  },
  "message": "เริ่มคำนวณคะแนนความเสี่ยงใหม่ทั้งหมด กรุณารอสักครู่"
}
```

> [!IMPORTANT]
> การคำนวณใหม่ทั้งหมดทำงานแบบ asynchronous ตรวจสอบสถานะได้ที่ `GET /api/risk/recalculate-status/:jobId`

---

### GET `/api/risk/recalculate-status/:jobId`

**คำอธิบาย:** ตรวจสอบสถานะการคำนวณความเสี่ยงแบบ batch

**สิทธิ์ที่ต้องการ:** `admin`, `super_admin`

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "job_id": "job-uuid-1",
    "status": "completed",
    "total_students": 120,
    "processed": 120,
    "results": {
      "low": 85,
      "medium": 20,
      "high": 12,
      "critical": 3
    },
    "changes": {
      "increased": 5,
      "decreased": 8,
      "unchanged": 107
    },
    "completed_at": "2026-06-09T11:01:00Z"
  }
}
```

---

## 9. Individual Development Plan (IDP)

แผนพัฒนารายบุคคลสำหรับนักเรียนที่ต้องการการพัฒนาเฉพาะด้าน

---

### Server Action — `createDevelopmentPlan`

**คำอธิบาย:** สร้างแผนพัฒนารายบุคคล (IDP)

**ไฟล์:** `app/actions/idp.ts`

**สิทธิ์ที่ต้องการ:** `teacher`, `counselor`, `admin`

```typescript
"use server";

interface CreateIDPInput {
  student_id: UUID;                      // รหัส UUID นักเรียน (required)
  academic_year: number;                // ปีการศึกษา (required)
  semester: Semester;                    // ภาคเรียน (required)
  title: string;                         // ชื่อแผน (required)
  description: string;                   // รายละเอียดแผน (required)
  development_areas: DevelopmentArea[];  // ด้านที่ต้องพัฒนา (required, min 1)
  start_date: string;                    // วันที่เริ่มต้น (required)
  end_date: string;                      // วันที่สิ้นสุด (required)
  goals: IDPGoal[];                      // เป้าหมาย (required, min 1)
  related_support_case_id?: UUID;        // เคสช่วยเหลือที่เกี่ยวข้อง
}

type DevelopmentArea =
  | "academic"       // ด้านวิชาการ
  | "reading"        // ด้านการอ่าน
  | "writing"        // ด้านการเขียน
  | "math"           // ด้านคณิตศาสตร์
  | "behavioral"     // ด้านพฤติกรรม
  | "social"         // ด้านสังคม
  | "emotional"      // ด้านอารมณ์
  | "physical"       // ด้านร่างกาย
  | "life_skills";   // ด้านทักษะชีวิต

interface IDPGoal {
  title: string;                    // ชื่อเป้าหมาย (required)
  description: string;              // รายละเอียด (required)
  target_indicator: string;         // ตัวชี้วัดเป้าหมาย (required)
  target_value: string;             // ค่าเป้าหมาย (required)
  activities: IDPActivity[];        // กิจกรรมที่ต้องทำ (required, min 1)
}

interface IDPActivity {
  title: string;                    // ชื่อกิจกรรม (required)
  description: string;              // รายละเอียด
  responsible_person: string;       // ผู้รับผิดชอบ
  frequency: string;                // ความถี่ เช่น "3 ครั้ง/สัปดาห์"
  start_date: string;              // วันที่เริ่ม
  end_date: string;                // วันที่สิ้นสุด
  resources_needed?: string[];     // ทรัพยากรที่ต้องการ
}

export async function createDevelopmentPlan(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult>;
```

**ตัวอย่างข้อมูล:**

```json
{
  "student_id": "uuid-3",
  "academic_year": 2568,
  "semester": 1,
  "title": "แผนพัฒนาการอ่านออกเขียนได้ และคิดเลขเป็น",
  "description": "แผนพัฒนาทักษะพื้นฐานด้านการอ่าน การเขียน และคณิตศาสตร์ สำหรับ ด.ช.สมชาย ขยัน ที่มีผลประเมินทักษะต่ำกว่าเกณฑ์",
  "development_areas": ["reading", "writing", "math"],
  "start_date": "2026-06-15",
  "end_date": "2026-09-30",
  "goals": [
    {
      "title": "สามารถอ่านคำที่มี 2-3 พยางค์ได้คล่อง",
      "description": "นักเรียนสามารถอ่านคำที่มี 2-3 พยางค์ได้อย่างถูกต้องและคล่องแคล่ว",
      "target_indicator": "ผลทดสอบการอ่าน",
      "target_value": "ได้คะแนนไม่ต่ำกว่า 70%",
      "activities": [
        {
          "title": "ฝึกอ่านทุกวันหลังเลิกเรียน",
          "description": "ครูประจำชั้นฝึกอ่านกับนักเรียนทุกวัน วันละ 20 นาที",
          "responsible_person": "ครูสมศรี ใจดี",
          "frequency": "5 ครั้ง/สัปดาห์",
          "start_date": "2026-06-15",
          "end_date": "2026-09-30",
          "resources_needed": ["แบบฝึกหัดอ่าน ชุด ก-ฮ", "หนังสืออ่านเพิ่มเติม"]
        },
        {
          "title": "ใช้สื่อมัลติมีเดียประกอบการเรียน",
          "description": "ให้นักเรียนฝึกอ่านผ่านแอปพลิเคชัน",
          "responsible_person": "ครูสมศรี ใจดี",
          "frequency": "3 ครั้ง/สัปดาห์",
          "start_date": "2026-06-15",
          "end_date": "2026-09-30"
        }
      ]
    }
  ],
  "related_support_case_id": "case-uuid-1"
}
```

**Response (ActionResult):**

```typescript
{
  success: true,
  message: "สร้างแผนพัฒนารายบุคคลสำเร็จ",
  data: {
    id: "idp-uuid-1",
    plan_number: "IDP-2568-001"
  }
}
```

---

### Server Action — `addGoalToIDP`

**คำอธิบาย:** เพิ่มเป้าหมายและกิจกรรมในแผน IDP ที่มีอยู่

**ไฟล์:** `app/actions/idp.ts`

**สิทธิ์ที่ต้องการ:** `teacher`, `counselor`, `admin`

```typescript
"use server";

export async function addGoalToIDP(
  planId: UUID,
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult>;
```

---

### Server Action — `recordIDPEvaluation`

**คำอธิบาย:** บันทึกผลประเมิน/ความก้าวหน้าของแผน IDP

**ไฟล์:** `app/actions/idp.ts`

**สิทธิ์ที่ต้องการ:** `teacher`, `counselor`, `admin`

```typescript
"use server";

interface RecordIDPEvaluationInput {
  plan_id: UUID;                        // รหัสแผน (required)
  goal_id: UUID;                        // รหัสเป้าหมาย (required)
  evaluation_date: string;              // วันที่ประเมิน (required)
  current_value: string;                // ค่าปัจจุบัน (required)
  progress_percentage: number;          // ความก้าวหน้า % (required, 0-100)
  evaluation_result: EvaluationResult;  // ผลประเมิน (required)
  observations: string;                 // ข้อสังเกต (required)
  challenges?: string;                  // อุปสรรค
  adjustments?: string;                 // การปรับแผน
}

type EvaluationResult =
  | "achieved"           // บรรลุเป้าหมาย
  | "progressing"        // กำลังก้าวหน้า
  | "not_progressing"    // ไม่มีความก้าวหน้า
  | "regressing";        // ถดถอย

export async function recordIDPEvaluation(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult>;
```

**ตัวอย่างข้อมูล:**

```json
{
  "plan_id": "idp-uuid-1",
  "goal_id": "goal-uuid-1",
  "evaluation_date": "2026-07-15",
  "current_value": "ทดสอบอ่านคำ 2 พยางค์ได้ 55%",
  "progress_percentage": 55,
  "evaluation_result": "progressing",
  "observations": "นักเรียนมีพัฒนาการดีขึ้น สามารถอ่านคำ 2 พยางค์ที่คุ้นเคยได้ แต่คำใหม่ยังต้องสะกด",
  "challenges": "นักเรียนยังขาดเรียนเป็นบางวัน ทำให้ขาดความต่อเนื่อง",
  "adjustments": "เพิ่มแบบฝึกหัดให้ทำที่บ้าน มอบหมายเพื่อนช่วย buddy reading"
}
```

---

### GET `/api/idp/student/:studentId`

**คำอธิบาย:** ดึงแผนพัฒนารายบุคคลของนักเรียน

**สิทธิ์ที่ต้องการ:** `teacher`, `counselor`, `admin`, `super_admin`

**Path Parameters:**

| Parameter | Type | คำอธิบาย |
|---|---|---|
| `studentId` | UUID | รหัส UUID ของนักเรียน |

**Query Parameters:**

```typescript
interface IDPQueryParams {
  status?: IDPStatus;           // กรองตามสถานะ
  academic_year?: number;
  page?: number;
  limit?: number;
}

type IDPStatus = "draft" | "active" | "completed" | "cancelled";
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "student": {
      "id": "uuid-3",
      "name": "เด็กชายสมชาย ขยัน"
    },
    "plans": [
      {
        "id": "idp-uuid-1",
        "plan_number": "IDP-2568-001",
        "title": "แผนพัฒนาการอ่านออกเขียนได้ และคิดเลขเป็น",
        "status": "active",
        "development_areas": ["reading", "writing", "math"],
        "start_date": "2026-06-15",
        "end_date": "2026-09-30",
        "overall_progress": 45,
        "goals": [
          {
            "id": "goal-uuid-1",
            "title": "สามารถอ่านคำที่มี 2-3 พยางค์ได้คล่อง",
            "target_indicator": "ผลทดสอบการอ่าน",
            "target_value": "ได้คะแนนไม่ต่ำกว่า 70%",
            "current_value": "55%",
            "progress_percentage": 55,
            "status": "progressing",
            "activities": [
              {
                "id": "act-uuid-1",
                "title": "ฝึกอ่านทุกวันหลังเลิกเรียน",
                "frequency": "5 ครั้ง/สัปดาห์",
                "status": "in_progress"
              }
            ],
            "evaluations": [
              {
                "id": "eval-uuid-1",
                "evaluation_date": "2026-07-15",
                "progress_percentage": 55,
                "evaluation_result": "progressing",
                "evaluated_by": "สมศรี ใจดี"
              }
            ]
          }
        ],
        "created_by": "สมศรี ใจดี",
        "created_at": "2026-06-10T08:00:00Z",
        "updated_at": "2026-07-15T15:00:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1, "hasNext": false, "hasPrev": false }
  }
}
```

---

## 10. Dashboard & Reports

API สำหรับ Dashboard ภาพรวม และการสร้างรายงาน

---

### GET `/api/dashboard/overview`

**คำอธิบาย:** ดึงข้อมูลภาพรวมสำหรับหน้า Dashboard หลัก

**สิทธิ์ที่ต้องการ:** `teacher`, `admin`, `super_admin`

**Query Parameters:**

```typescript
interface DashboardOverviewParams {
  academic_year: number;    // ปีการศึกษา (required)
  semester?: Semester;
  classroom?: string;       // ห้องเรียน (สำหรับ teacher)
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "academic_year": 2568,
    "semester": 1,
    "students": {
      "total": 120,
      "active": 118,
      "new_this_year": 15,
      "by_class": [
        { "classroom": "ป.1/1", "count": 20 },
        { "classroom": "ป.2/1", "count": 22 },
        { "classroom": "ป.3/1", "count": 25 },
        { "classroom": "ป.4/1", "count": 18 },
        { "classroom": "ป.5/1", "count": 17 },
        { "classroom": "ป.6/1", "count": 16 }
      ]
    },
    "attendance_today": {
      "date": "2026-06-09",
      "present": 110,
      "absent": 5,
      "late": 3,
      "rate": 91.7,
      "not_recorded_classes": ["ป.6/1"]
    },
    "risk_overview": {
      "low": 85,
      "medium": 20,
      "high": 12,
      "critical": 3,
      "unassessed": 0
    },
    "academic_overview": {
      "average_gpa": 2.85,
      "below_standard_count": 15,
      "basic_skills_need_improvement": 8
    },
    "support_cases": {
      "total_active": 12,
      "open": 3,
      "in_progress": 8,
      "pending": 1,
      "resolved_this_month": 5
    },
    "home_visits": {
      "completed": 45,
      "target": 120,
      "completion_rate": 37.5,
      "upcoming": 3
    },
    "idp": {
      "active_plans": 8,
      "completed_this_semester": 2,
      "average_progress": 42.5
    },
    "recent_activities": [
      {
        "type": "attendance",
        "description": "บันทึกการเข้าเรียน ป.3/1",
        "user": "สมศรี ใจดี",
        "timestamp": "2026-06-09T08:30:00Z"
      },
      {
        "type": "behavior",
        "description": "บันทึกพฤติกรรมดี ด.ช.สมศักดิ์",
        "user": "สมศรี ใจดี",
        "timestamp": "2026-06-09T10:00:00Z"
      }
    ]
  }
}
```

---

### GET `/api/dashboard/risk-distribution`

**คำอธิบาย:** ดึงข้อมูลการกระจายความเสี่ยงสำหรับ chart

**สิทธิ์ที่ต้องการ:** `admin`, `super_admin`, `counselor`

**Query Parameters:**

```typescript
interface RiskDistributionParams {
  academic_year: number;
  semester?: Semester;
  group_by?: "classroom" | "class_level" | "gender"; // default: "classroom"
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "group_by": "classroom",
    "distribution": [
      {
        "group": "ป.1/1",
        "low": 15,
        "medium": 3,
        "high": 2,
        "critical": 0,
        "total": 20
      },
      {
        "group": "ป.2/1",
        "low": 16,
        "medium": 4,
        "high": 1,
        "critical": 1,
        "total": 22
      },
      {
        "group": "ป.3/1",
        "low": 18,
        "medium": 3,
        "high": 3,
        "critical": 1,
        "total": 25
      }
    ],
    "total": {
      "low": 85,
      "medium": 20,
      "high": 12,
      "critical": 3,
      "total": 120
    }
  }
}
```

---

### GET `/api/dashboard/attendance-chart`

**คำอธิบาย:** ดึงข้อมูลสำหรับกราฟ chart สรุปการเข้าเรียน

**สิทธิ์ที่ต้องการ:** `teacher`, `admin`, `super_admin`

**Query Parameters:**

```typescript
interface AttendanceChartParams {
  academic_year: number;
  semester?: Semester;
  classroom?: string;
  chart_type: "daily" | "weekly" | "monthly";   // ประเภท chart (required)
  start_date?: string;
  end_date?: string;
}
```

**Response — `200 OK` (weekly):**

```json
{
  "success": true,
  "data": {
    "chart_type": "weekly",
    "labels": ["W19", "W20", "W21", "W22", "W23"],
    "datasets": {
      "attendance_rate": [94.5, 92.3, 95.1, 91.8, 93.2],
      "present": [472, 461, 475, 459, 466],
      "absent": [12, 18, 10, 20, 15],
      "late": [8, 10, 7, 11, 9],
      "leave": [8, 11, 8, 10, 10]
    }
  }
}
```

---

### GET `/api/dashboard/academic-chart`

**คำอธิบาย:** ดึงข้อมูลสำหรับกราฟ chart ผลการเรียน

**สิทธิ์ที่ต้องการ:** `teacher`, `admin`, `super_admin`

**Query Parameters:**

```typescript
interface AcademicChartParams {
  academic_year: number;
  semester?: Semester;
  classroom?: string;
  chart_type: "gpa_distribution" | "subject_comparison" | "trend";
}
```

**Response — `200 OK` (gpa_distribution):**

```json
{
  "success": true,
  "data": {
    "chart_type": "gpa_distribution",
    "classroom": "ป.3/1",
    "distribution": [
      { "range": "0.00-0.99", "count": 1 },
      { "range": "1.00-1.49", "count": 2 },
      { "range": "1.50-1.99", "count": 3 },
      { "range": "2.00-2.49", "count": 5 },
      { "range": "2.50-2.99", "count": 4 },
      { "range": "3.00-3.49", "count": 6 },
      { "range": "3.50-4.00", "count": 4 }
    ],
    "statistics": {
      "mean": 2.85,
      "median": 2.90,
      "min": 0.75,
      "max": 4.00,
      "std_dev": 0.72
    }
  }
}
```

---

### GET `/api/dashboard/support-summary`

**คำอธิบาย:** ดึงข้อมูลสรุปเคสให้ความช่วยเหลือ สำหรับ Dashboard

**สิทธิ์ที่ต้องการ:** `counselor`, `admin`, `super_admin`

**Query Parameters:**

```typescript
interface SupportSummaryParams {
  academic_year: number;
  semester?: Semester;
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "by_status": {
      "open": 3,
      "in_progress": 8,
      "pending": 1,
      "referred": 2,
      "resolved": 15,
      "closed": 12
    },
    "by_type": [
      { "type": "academic", "count": 18, "active": 5 },
      { "type": "financial", "count": 8, "active": 3 },
      { "type": "behavioral", "count": 5, "active": 2 },
      { "type": "family", "count": 4, "active": 1 },
      { "type": "health", "count": 3, "active": 1 },
      { "type": "mental_health", "count": 2, "active": 0 },
      { "type": "social", "count": 1, "active": 0 }
    ],
    "by_priority": {
      "urgent": 1,
      "high": 4,
      "medium": 5,
      "low": 2
    },
    "monthly_trend": [
      { "month": "2026-01", "opened": 5, "resolved": 3 },
      { "month": "2026-02", "opened": 3, "resolved": 4 },
      { "month": "2026-03", "opened": 4, "resolved": 2 },
      { "month": "2026-04", "opened": 2, "resolved": 3 },
      { "month": "2026-05", "opened": 6, "resolved": 5 },
      { "month": "2026-06", "opened": 3, "resolved": 2 }
    ],
    "average_resolution_days": 21.5
  }
}
```

---

### GET `/api/reports/export`

**คำอธิบาย:** สร้างและดาวน์โหลดรายงานในรูปแบบ PDF หรือ Excel

**สิทธิ์ที่ต้องการ:** `teacher`, `admin`, `super_admin`

**Query Parameters:**

```typescript
interface ReportExportParams {
  report_type: ReportType;         // ประเภทรายงาน (required)
  format: "pdf" | "excel";        // รูปแบบไฟล์ (required)
  academic_year: number;          // ปีการศึกษา (required)
  semester?: Semester;
  classroom?: string;             // ห้องเรียน
  student_id?: UUID;              // นักเรียนเฉพาะคน
}

type ReportType =
  | "student_profile"            // รายงานข้อมูลนักเรียนรายบุคคล
  | "attendance_summary"         // รายงานสรุปการเข้าเรียน
  | "academic_summary"           // รายงานผลการเรียน
  | "behavior_summary"           // รายงานพฤติกรรม
  | "risk_assessment"            // รายงานคัดกรองความเสี่ยง
  | "home_visit"                 // รายงานการเยี่ยมบ้าน
  | "support_summary"            // รายงานการให้ความช่วยเหลือ
  | "idp_progress"               // รายงานความก้าวหน้า IDP
  | "comprehensive"              // รายงานภาพรวมทั้งหมด
  | "class_report";              // รายงานประจำห้อง

```

**ตัวอย่าง Request:**

```
GET /api/reports/export?report_type=risk_assessment&format=pdf&academic_year=2568&semester=1
```

**Response — `200 OK`:**

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="risk_assessment_2568_1.pdf"

(Binary PDF data)
```

**สำหรับ request ที่ใช้เวลานาน (รายงานขนาดใหญ่) — `202 Accepted`:**

```json
{
  "success": true,
  "data": {
    "job_id": "report-job-uuid-1",
    "status": "generating",
    "estimated_time_seconds": 60,
    "download_url": null
  },
  "message": "กำลังสร้างรายงาน กรุณารอสักครู่"
}
```

**ตรวจสอบสถานะ:**

```
GET /api/reports/status/:jobId
```

```json
{
  "success": true,
  "data": {
    "job_id": "report-job-uuid-1",
    "status": "completed",
    "download_url": "https://xxx.supabase.co/storage/v1/object/sign/reports/risk_assessment_2568_1.pdf?token=xxx&expires=3600",
    "expires_at": "2026-06-09T12:42:00Z",
    "file_size": 524288
  }
}
```

---

## 11. User Management (Admin)

จัดการผู้ใช้ระบบ บทบาท และการตั้งค่าระบบ

---

### GET `/api/admin/users`

**คำอธิบาย:** ดึงรายชื่อผู้ใช้ระบบทั้งหมด

**สิทธิ์ที่ต้องการ:** `admin`, `super_admin`

**Query Parameters:**

```typescript
interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;           // ค้นหาจากชื่อ อีเมล
  role?: UserRole;           // กรองตาม role
  status?: "active" | "inactive" | "locked";
  sort?: "name" | "email" | "created_at" | "last_login";
  order?: "asc" | "desc";
}
```

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "teacher@school.ac.th",
      "role": "teacher",
      "status": "active",
      "profile": {
        "first_name": "สมศรี",
        "last_name": "ใจดี",
        "phone": "081-234-5678",
        "position": "ครูประจำชั้น ป.3"
      },
      "assigned_classes": ["ป.3/1"],
      "students_count": 25,
      "last_login": "2026-06-09T04:30:00Z",
      "created_at": "2025-05-01T08:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 10, "totalPages": 1, "hasNext": false, "hasPrev": false }
}
```

---

### Server Action — `createUser`

**คำอธิบาย:** สร้างผู้ใช้ใหม่

**ไฟล์:** `app/actions/admin.ts`

**สิทธิ์ที่ต้องการ:** `admin`, `super_admin`

```typescript
"use server";

// ใช้ schema เดียวกับ POST /api/auth/register
export async function createUser(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult>;
```

---

### Server Action — `updateUser`

**คำอธิบาย:** แก้ไขข้อมูลผู้ใช้

**ไฟล์:** `app/actions/admin.ts`

**สิทธิ์ที่ต้องการ:** `admin`, `super_admin`

```typescript
"use server";

interface UpdateUserInput {
  role?: UserRole;
  status?: "active" | "inactive";
  profile?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    position?: string;
  };
  assigned_classes?: string[];
}

export async function updateUser(
  userId: UUID,
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult>;
```

---

### Server Action — `deleteUser`

**คำอธิบาย:** ลบผู้ใช้ (soft delete — เปลี่ยนสถานะเป็น `inactive`)

**ไฟล์:** `app/actions/admin.ts`

**สิทธิ์ที่ต้องการ:** `super_admin`

```typescript
"use server";

export async function deleteUser(userId: UUID): Promise<ActionResult>;
```

---

### Server Action — `assignRole`

**คำอธิบาย:** เปลี่ยนบทบาทของผู้ใช้

**ไฟล์:** `app/actions/admin.ts`

**สิทธิ์ที่ต้องการ:** `admin`, `super_admin`

```typescript
"use server";

interface AssignRoleInput {
  user_id: UUID;
  role: UserRole;
}

export async function assignRole(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult>;
```

> [!WARNING]
> การเปลี่ยน role เป็น `super_admin` ต้องใช้สิทธิ์ `super_admin` เท่านั้น

---

### GET `/api/admin/settings`

**คำอธิบาย:** ดึงค่าตั้งค่าระบบ

**สิทธิ์ที่ต้องการ:** `admin`, `super_admin`

**Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "school": {
      "name": "โรงเรียนบ้านในภู",
      "address": "หมู่ 3 ตำบลท่าศาลา อำเภอเมือง จังหวัดนครศรีธรรมราช 80000",
      "phone": "075-123-456",
      "logo_url": "https://xxx.supabase.co/storage/v1/object/public/settings/logo.png"
    },
    "academic": {
      "current_academic_year": 2568,
      "current_semester": 1,
      "class_levels": ["ป.1", "ป.2", "ป.3", "ป.4", "ป.5", "ป.6"],
      "classrooms": ["ป.1/1", "ป.2/1", "ป.3/1", "ป.4/1", "ป.5/1", "ป.6/1"]
    },
    "risk_assessment": {
      "attendance_weight": 25,
      "academic_weight": 25,
      "behavior_weight": 25,
      "family_weight": 25,
      "thresholds": {
        "low": { "min": 0, "max": 25 },
        "medium": { "min": 26, "max": 50 },
        "high": { "min": 51, "max": 75 },
        "critical": { "min": 76, "max": 100 }
      },
      "auto_recalculate": true,
      "recalculate_frequency": "weekly"
    },
    "notifications": {
      "enable_email": false,
      "enable_line": true,
      "line_notify_token": "***",
      "alert_on_high_risk": true,
      "alert_on_absent_streak": 3
    },
    "grading": {
      "scale": [
        { "grade": "4", "min_score": 80 },
        { "grade": "3.5", "min_score": 75 },
        { "grade": "3", "min_score": 70 },
        { "grade": "2.5", "min_score": 65 },
        { "grade": "2", "min_score": 60 },
        { "grade": "1.5", "min_score": 55 },
        { "grade": "1", "min_score": 50 },
        { "grade": "0", "min_score": 0 }
      ]
    }
  }
}
```

---

### Server Action — `updateSettings`

**คำอธิบาย:** อัปเดตค่าตั้งค่าระบบ

**ไฟล์:** `app/actions/admin.ts`

**สิทธิ์ที่ต้องการ:** `admin`, `super_admin`

```typescript
"use server";

export async function updateSettings(
  prevState: ActionResult,
  formData: FormData
): Promise<ActionResult>;
```

---

## Server Actions Reference

### สรุป Server Actions ทั้งหมดในระบบ

รายการ Server Actions ทั้งหมด จัดกลุ่มตาม module — ใช้สำหรับ form submissions และ mutations ภายในแอปพลิเคชัน

| Module | Action | ไฟล์ | คำอธิบาย |
|---|---|---|---|
| **Auth** | `updatePassword` | `app/actions/auth.ts` | เปลี่ยนรหัสผ่าน |
| **Students** | `createStudent` | `app/actions/students.ts` | เพิ่มนักเรียน |
| **Students** | `updateStudent` | `app/actions/students.ts` | แก้ไขข้อมูลนักเรียน |
| **Students** | `deleteStudent` | `app/actions/students.ts` | ลบนักเรียน (soft) |
| **Attendance** | `recordAttendance` | `app/actions/attendance.ts` | บันทึกการเข้าเรียน (bulk) |
| **Academic** | `recordScores` | `app/actions/academic.ts` | บันทึกคะแนน |
| **Academic** | `recordBasicSkillAssessment` | `app/actions/academic.ts` | บันทึกประเมินทักษะพื้นฐาน |
| **Behavior** | `recordBehavior` | `app/actions/behavior.ts` | บันทึกพฤติกรรม |
| **Behavior** | `recordAssignmentSubmission` | `app/actions/behavior.ts` | บันทึกการส่งงาน |
| **Home Visit** | `createHomeVisit` | `app/actions/homevisit.ts` | สร้างบันทึกเยี่ยมบ้าน |
| **Home Visit** | `updateHomeVisit` | `app/actions/homevisit.ts` | แก้ไขบันทึกเยี่ยมบ้าน |
| **Home Visit** | `deleteHomeVisit` | `app/actions/homevisit.ts` | ลบบันทึกเยี่ยมบ้าน |
| **Support** | `createSupportCase` | `app/actions/support.ts` | สร้างเคสช่วยเหลือ |
| **Support** | `updateSupportStatus` | `app/actions/support.ts` | อัปเดตสถานะเคส |
| **Support** | `addFollowUp` | `app/actions/support.ts` | บันทึกติดตามผล |
| **IDP** | `createDevelopmentPlan` | `app/actions/idp.ts` | สร้างแผนพัฒนารายบุคคล |
| **IDP** | `addGoalToIDP` | `app/actions/idp.ts` | เพิ่มเป้าหมาย |
| **IDP** | `recordIDPEvaluation` | `app/actions/idp.ts` | บันทึกผลประเมิน IDP |
| **Admin** | `createUser` | `app/actions/admin.ts` | สร้างผู้ใช้ |
| **Admin** | `updateUser` | `app/actions/admin.ts` | แก้ไขผู้ใช้ |
| **Admin** | `deleteUser` | `app/actions/admin.ts` | ลบผู้ใช้ |
| **Admin** | `assignRole` | `app/actions/admin.ts` | เปลี่ยนบทบาท |
| **Admin** | `updateSettings` | `app/actions/admin.ts` | อัปเดตตั้งค่าระบบ |

### รูปแบบการเรียกใช้ Server Action

#### Pattern 1: Form Action with `useActionState` (แนะนำ)

```typescript
"use client";

import { useActionState } from "react";
import { createStudent } from "@/app/actions/students";

const initialState: ActionResult = {
  success: false,
  message: "",
};

export function CreateStudentForm() {
  const [state, formAction, isPending] = useActionState(createStudent, initialState);

  return (
    <form action={formAction}>
      {/* form fields */}
      <input name="first_name" required />
      <input name="last_name" required />

      {/* error display */}
      {state.errors?.first_name && (
        <span className="text-red-500">{state.errors.first_name[0]}</span>
      )}

      {/* submit button */}
      <button type="submit" disabled={isPending}>
        {isPending ? "กำลังบันทึก..." : "บันทึก"}
      </button>

      {/* success message */}
      {state.success && (
        <div className="text-green-500">{state.message}</div>
      )}
    </form>
  );
}
```

#### Pattern 2: Programmatic Call (สำหรับ complex forms)

```typescript
"use client";

import { startTransition } from "react";
import { recordAttendance } from "@/app/actions/attendance";

function handleSubmit(data: AttendanceData) {
  const formData = new FormData();
  formData.append("data", JSON.stringify(data));

  startTransition(async () => {
    const result = await recordAttendance(initialState, formData);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  });
}
```

#### Pattern 3: Action with Bound Parameters

```typescript
"use client";

import { useActionState } from "react";
import { updateStudent } from "@/app/actions/students";

export function EditStudentForm({ studentId }: { studentId: string }) {
  // Bind studentId เป็น parameter แรก
  const updateWithId = updateStudent.bind(null, studentId);
  const [state, formAction, isPending] = useActionState(updateWithId, initialState);

  return <form action={formAction}>{/* ... */}</form>;
}
```

### ActionResult Type Definition

```typescript
interface ActionResult {
  success: boolean;
  message: string;
  data?: Record<string, any>;
  errors?: Record<string, string[]>;
}
```

---

## Supabase Realtime Subscriptions

ระบบใช้ **Supabase Realtime** สำหรับอัปเดตข้อมูลแบบ real-time ผ่าน WebSocket

### การตั้งค่า Supabase Client (Client-side)

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Channel 1: การเข้าเรียน Real-time

**คำอธิบาย:** อัปเดตข้อมูลการเข้าเรียนแบบ real-time เมื่อครูท่านอื่นบันทึก

```typescript
"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

function useAttendanceRealtime(classroom: string, date: string) {
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`attendance:${classroom}:${date}`)
      .on(
        "postgres_changes",
        {
          event: "*",              // INSERT, UPDATE, DELETE
          schema: "public",
          table: "attendance",
          filter: `classroom=eq.${classroom}&date=eq.${date}`,
        },
        (payload) => {
          console.log("Attendance updated:", payload);
          // อัปเดต state ด้วยข้อมูลใหม่
          // payload.new — ข้อมูลใหม่
          // payload.old — ข้อมูลเก่า
          // payload.eventType — "INSERT" | "UPDATE" | "DELETE"
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classroom, date]);
}
```

### Channel 2: แจ้งเตือนนักเรียนเสี่ยง

**คำอธิบาย:** รับแจ้งเตือนแบบ real-time เมื่อมีการอัปเดตระดับความเสี่ยง

```typescript
function useRiskAlertRealtime(userId: string) {
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("risk-alerts")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "risk_assessments",
          filter: `risk_level=in.(high,critical)`,
        },
        (payload) => {
          // แจ้งเตือนเมื่อมีนักเรียนระดับเสี่ยงสูงหรือวิกฤต
          const student = payload.new;
          showNotification({
            title: "⚠️ แจ้งเตือนนักเรียนเสี่ยง",
            message: `นักเรียน ${student.student_name} มีระดับความเสี่ยง: ${student.risk_level}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
}
```

### Channel 3: เคสช่วยเหลือ Real-time

**คำอธิบาย:** อัปเดตสถานะเคสช่วยเหลือแบบ real-time

```typescript
function useSupportCaseRealtime(caseId: string) {
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`support:${caseId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "support_cases",
          filter: `id=eq.${caseId}`,
        },
        (payload) => {
          // อัปเดตข้อมูลเคส
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_follow_ups",
          filter: `case_id=eq.${caseId}`,
        },
        (payload) => {
          // มีการบันทึกติดตามผลใหม่
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [caseId]);
}
```

### Channel 4: Broadcast — ประกาศจาก Admin

**คำอธิบาย:** ส่งข้อความประกาศถึงผู้ใช้ทุกคนแบบ real-time (ไม่ผ่าน database)

```typescript
// ส่งประกาศ (Admin)
async function sendBroadcast(message: string) {
  const supabase = createClient();
  const channel = supabase.channel("announcements");

  await channel.send({
    type: "broadcast",
    event: "announcement",
    payload: {
      message,
      timestamp: new Date().toISOString(),
    },
  });
}

// รับประกาศ (ทุกคน)
function useAnnouncementRealtime() {
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("announcements")
      .on("broadcast", { event: "announcement" }, (payload) => {
        showNotification({
          title: "📢 ประกาศ",
          message: payload.payload.message,
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
```

### สรุป Realtime Channels

| Channel | Table / Type | Event | การใช้งาน |
|---|---|---|---|
| `attendance:{classroom}:{date}` | `attendance` | `*` | อัปเดตการเข้าเรียน real-time |
| `risk-alerts` | `risk_assessments` | `UPDATE` | แจ้งเตือนนักเรียนเสี่ยง |
| `support:{caseId}` | `support_cases`, `support_follow_ups` | `*`, `INSERT` | ติดตามเคสช่วยเหลือ |
| `announcements` | Broadcast | `announcement` | ประกาศจาก Admin |
| `notifications:{userId}` | `notifications` | `INSERT` | แจ้งเตือนส่วนตัว |

> [!IMPORTANT]
> ต้องเปิดใช้ Realtime ใน Supabase Dashboard สำหรับ tables ที่ต้องการ:
> ```sql
> ALTER TABLE attendance REPLICA IDENTITY FULL;
> ALTER TABLE risk_assessments REPLICA IDENTITY FULL;
> ALTER TABLE support_cases REPLICA IDENTITY FULL;
> ALTER TABLE support_follow_ups REPLICA IDENTITY FULL;
> ALTER TABLE notifications REPLICA IDENTITY FULL;
> ```
> และตั้งค่า RLS policies ให้เหมาะสมกับ channel แต่ละอัน

---

## File Upload Handling

### ภาพรวมการจัดการไฟล์

ระบบใช้ **Supabase Storage** สำหรับจัดเก็บไฟล์ทุกประเภท

### Storage Buckets

| Bucket | การใช้งาน | Public | Max Size |
|---|---|---|---|
| `avatars` | รูปโปรไฟล์ผู้ใช้/นักเรียน | ✅ | 2 MB |
| `students` | รูปถ่ายนักเรียน | ✅ | 2 MB |
| `homevisits` | รูปถ่ายจากการเยี่ยมบ้าน | ❌ | 5 MB |
| `documents` | เอกสารทั่วไป | ❌ | 10 MB |
| `imports` | ไฟล์นำเข้า (CSV/Excel) | ❌ | 5 MB |
| `reports` | รายงานที่สร้างขึ้น | ❌ | 50 MB |

### รูปแบบไฟล์ที่รองรับ

| ประเภท | Extensions | MIME Types |
|---|---|---|
| รูปภาพ | `.jpg`, `.jpeg`, `.png`, `.webp` | `image/jpeg`, `image/png`, `image/webp` |
| เอกสาร | `.pdf`, `.doc`, `.docx` | `application/pdf`, `application/msword` |
| ข้อมูล | `.csv`, `.xlsx`, `.xls` | `text/csv`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |

### Upload Pattern — Server Action + Supabase Storage

```typescript
// app/actions/upload.ts
"use server";

import { createServerClient } from "@/lib/supabase/server";

export async function uploadImage(
  bucket: string,
  path: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createServerClient();
  const file = formData.get("file") as File;

  if (!file) {
    return { success: false, message: "กรุณาเลือกไฟล์" };
  }

  // ตรวจสอบขนาด
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { success: false, message: "ไฟล์มีขนาดใหญ่เกิน 5MB" };
  }

  // ตรวจสอบ MIME type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, message: "รองรับเฉพาะไฟล์ JPEG, PNG, WebP" };
  }

  // สร้างชื่อไฟล์ที่ไม่ซ้ำ
  const ext = file.name.split(".").pop();
  const fileName = `${path}/${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    return { success: false, message: "อัปโหลดไฟล์ไม่สำเร็จ" };
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    success: true,
    message: "อัปโหลดสำเร็จ",
    data: { url: publicUrl, path: data.path },
  };
}
```

### Client-side Upload Component

```typescript
"use client";

import { useState, useRef } from "react";

interface FileUploadProps {
  bucket: string;
  path: string;
  accept?: string;
  maxSize?: number; // bytes
  onUploadComplete?: (url: string) => void;
}

export function FileUpload({ bucket, path, accept, maxSize, onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    if (file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/upload?bucket=${bucket}&path=${path}`, {
        method: "POST",
        body: formData,
      });
      const result = await res.json();

      if (result.success) {
        onUploadComplete?.(result.data.url);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept={accept || "image/*"}
        onChange={handleUpload}
        disabled={uploading}
      />
      {preview && <img src={preview} alt="Preview" className="w-32 h-32 object-cover" />}
      {uploading && <p>กำลังอัปโหลด...</p>}
    </div>
  );
}
```

### Supabase Storage RLS Policies

```sql
-- Bucket: avatars — ทุกคนอ่านได้ เจ้าของแก้ไข/ลบได้
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Bucket: homevisits — เฉพาะผู้ที่มีสิทธิ์
CREATE POLICY "Home visit images accessible by authorized users"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'homevisits'
  AND auth.role() IN ('teacher', 'counselor', 'admin', 'super_admin')
);

CREATE POLICY "Teachers can upload home visit images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'homevisits'
  AND auth.role() IN ('teacher', 'counselor', 'admin')
);
```

---

## Rate Limiting

### นโยบาย Rate Limiting

ระบบใช้ rate limiting เพื่อป้องกันการใช้งาน API มากเกินไป

| Endpoint Group | Limit | Window | หมายเหตุ |
|---|---|---|---|
| `POST /api/auth/login` | 5 requests | 15 นาที | ป้องกัน brute-force |
| `POST /api/auth/reset-password` | 3 requests | 60 นาที | ป้องกัน spam |
| `GET /api/*` (read) | 100 requests | 1 นาที | อ่านข้อมูลทั่วไป |
| `POST/PUT/DELETE /api/*` (write) | 30 requests | 1 นาที | เขียนข้อมูล |
| `POST /api/students/import` | 5 requests | 60 นาที | นำเข้าข้อมูล |
| `POST /api/risk/recalculate-all` | 1 request | 60 นาที | คำนวณใหม่ทั้งหมด |
| `GET /api/reports/export` | 10 requests | 60 นาที | สร้างรายงาน |
| Server Actions | 60 requests | 1 นาที | ทุก action |

### Response Headers

ทุก response จะมี rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1749456060
```

### Rate Limit Exceeded Response — `429 Too Many Requests`

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "ส่ง request มากเกินไป กรุณารอสักครู่แล้วลองใหม่",
    "retry_after": 45
  }
}
```

### Middleware Implementation

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "60 s"),
  analytics: true,
  prefix: "api-ratelimit",
});

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "ส่ง request มากเกินไป กรุณารอสักครู่แล้วลองใหม่",
            retry_after: Math.ceil((reset - Date.now()) / 1000),
          },
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
```

---

## ภาคผนวก

### A. Database Schema Overview (ERD Reference)

```
┌─────────────┐   ┌──────────────┐   ┌──────────────────┐
│   users      │   │   students   │   │   attendance     │
│─────────────│   │──────────────│   │──────────────────│
│ id (PK)      │──┤ teacher_id   │   │ id (PK)          │
│ email        │   │ id (PK)      │──┤ student_id (FK)  │
│ role         │   │ student_id   │   │ date             │
│ profile      │   │ first_name   │   │ status           │
│ ...          │   │ last_name    │   │ period           │
└─────────────┘   │ classroom    │   │ recorded_by (FK) │
                   │ ...          │   └──────────────────┘
                   └──────┬───────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
┌─────────┴──────┐ ┌──────┴───────┐ ┌─────┴──────────┐
│   scores       │ │  behaviors   │ │  home_visits    │
│────────────────│ │──────────────│ │────────────────│
│ id (PK)        │ │ id (PK)      │ │ id (PK)        │
│ student_id(FK) │ │ student_id   │ │ student_id(FK) │
│ subject_id(FK) │ │ type         │ │ visit_date     │
│ score          │ │ category     │ │ findings       │
│ max_score      │ │ description  │ │ images[]       │
└────────────────┘ └──────────────┘ └────────────────┘
          │
          │
┌─────────┴──────────┐   ┌──────────────────┐   ┌──────────────┐
│ risk_assessments   │   │  support_cases   │   │     idp      │
│────────────────────│   │──────────────────│   │──────────────│
│ id (PK)            │   │ id (PK)          │   │ id (PK)      │
│ student_id (FK)    │   │ student_id (FK)  │   │ student_id   │
│ risk_level         │   │ case_type        │   │ title        │
│ risk_score         │   │ status           │   │ goals[]      │
│ factors            │   │ priority         │   │ status       │
│ assessed_at        │   │ follow_ups[]     │   │ progress     │
└────────────────────┘   └──────────────────┘   └──────────────┘
```

### B. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# App
NEXT_PUBLIC_APP_URL=https://student-care.school.ac.th
NODE_ENV=production

# LINE Notify (optional)
LINE_NOTIFY_TOKEN=xxx
```

### C. HTTP Status Codes Summary

| Status Code | ความหมาย | ใช้เมื่อ |
|---|---|---|
| `200` | OK | สำเร็จ (GET, PUT, DELETE) |
| `201` | Created | สร้างข้อมูลใหม่สำเร็จ (POST) |
| `202` | Accepted | รับ request แล้ว กำลังประมวลผล (async job) |
| `204` | No Content | สำเร็จแต่ไม่มี response body |
| `400` | Bad Request | ข้อมูลไม่ถูกต้อง |
| `401` | Unauthorized | ไม่ได้เข้าสู่ระบบ |
| `403` | Forbidden | ไม่มีสิทธิ์ |
| `404` | Not Found | ไม่พบข้อมูล |
| `409` | Conflict | ข้อมูลซ้ำ |
| `413` | Payload Too Large | ไฟล์ใหญ่เกินไป |
| `422` | Unprocessable Entity | ข้อมูลถูกต้องแต่ประมวลผลไม่ได้ |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | ข้อผิดพลาดภายในระบบ |

### D. Versioning Strategy

ระบบนี้ไม่ใช้ URL-based versioning (เช่น `/api/v1/`) เนื่องจากเป็นระบบภายในโรงเรียน หากต้องการ versioning ในอนาคต:

- ใช้ **Header-based versioning**: `X-API-Version: 2`
- หรือ **URL prefix**: `/api/v2/students`
- เก็บ backward compatibility อย่างน้อย 1 version

---

> **เอกสารนี้จัดทำเพื่อใช้เป็นแนวทางในการพัฒนาระบบดูแลช่วยเหลือนักเรียนและวิเคราะห์พัฒนาการรายบุคคล สำหรับโรงเรียนขนาดเล็ก**
>
> **ปรับปรุงล่าสุด:** 2026-06-09 | **เวอร์ชัน:** 1.0.0
