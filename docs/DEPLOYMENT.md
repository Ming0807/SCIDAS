# 🚀 คู่มือการ Deploy ระบบ (Deployment Guide)

## ระบบสารสนเทศเพื่อวิเคราะห์และดูแลช่วยเหลือนักเรียนรายบุคคล (SCIDAS)

---

## สารบัญ

1. [ภาพรวม](#1-ภาพรวม)
2. [Prerequisites](#2-prerequisites)
3. [การตั้งค่า Supabase](#3-การตั้งค่า-supabase)
4. [การตั้งค่าโปรเจกต์ Local](#4-การตั้งค่าโปรเจกต์-local)
5. [การ Deploy บน Vercel](#5-การ-deploy-บน-vercel)
6. [การ Deploy ทางเลือก](#6-การ-deploy-ทางเลือก)
7. [Post-Deployment Checklist](#7-post-deployment-checklist)
8. [CI/CD Pipeline](#8-cicd-pipeline)
9. [Monitoring & Maintenance](#9-monitoring--maintenance)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. ภาพรวม

### Architecture Overview

```
                    ┌─────────────────┐
                    │     Vercel      │
                    │   (Frontend +   │
                    │  Server Actions │
                    │   + API Routes) │
                    └────────┬────────┘
                             │
                    HTTPS (TLS 1.3)
                             │
                    ┌────────┴────────┐
                    │    Supabase     │
                    │  ┌───────────┐  │
                    │  │   Auth    │  │
                    │  ├───────────┤  │
                    │  │ PostgreSQL│  │
                    │  │  + RLS    │  │
                    │  ├───────────┤  │
                    │  │  Storage  │  │
                    │  ├───────────┤  │
                    │  │ Realtime  │  │
                    │  └───────────┘  │
                    └─────────────────┘
```

### Deployment Stack

| Component | Service | Tier |
|-----------|---------|------|
| Frontend + API | **Vercel** | Free / Pro |
| Database | **Supabase PostgreSQL** | Free / Pro |
| Auth | **Supabase Auth** | Free |
| File Storage | **Supabase Storage** | Free (1GB) |
| Realtime | **Supabase Realtime** | Free |
| Domain | Custom domain (optional) | Varies |

---

## 2. Prerequisites

### ซอฟต์แวร์ที่ต้องติดตั้ง

```bash
# Node.js >= 20.x
node --version

# npm >= 10.x
npm --version

# Git
git --version

# Supabase CLI (optional, for local development)
npx supabase --version
```

### บัญชีที่ต้องมี

| บัญชี | URL | หมายเหตุ |
|-------|-----|---------|
| **Supabase** | https://supabase.com | Free tier เพียงพอ |
| **Vercel** | https://vercel.com | Free tier เพียงพอ |
| **GitHub** | https://github.com | สำหรับ Repository |

### Supabase Free Tier Limits

| Resource | Limit |
|----------|-------|
| Database | 500 MB |
| Storage | 1 GB |
| Bandwidth | 2 GB/month |
| Edge Functions | 500K invocations/month |
| Realtime | 200 concurrent connections |
| Auth | 50,000 MAU |

> **หมายเหตุ:** สำหรับโรงเรียนขนาดเล็ก (< 120 นักเรียน, < 20 ผู้ใช้) Free tier เพียงพอ

---

## 3. การตั้งค่า Supabase

### 3.1 สร้าง Supabase Project

1. ไปที่ https://supabase.com/dashboard
2. คลิก **"New Project"**
3. กรอกข้อมูล:
   - **Name:** `scidas-production` (หรือชื่อโรงเรียน)
   - **Database Password:** (จดไว้! ใช้ทีหลัง)
   - **Region:** `Southeast Asia (Singapore)` — ใกล้ประเทศไทยที่สุด
   - **Pricing Plan:** Free
4. คลิก **"Create new project"**
5. รอ ~2 นาที ให้ Project สร้างเสร็จ

### 3.2 ดึง API Keys

ไปที่ **Settings** → **API**:

```env
# ✅ ใช้ใน Frontend (Public)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...

# ⚠️ ใช้ใน Server-Side เท่านั้น (Secret!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...
```

> **⚠️ WARNING:** ห้ามเผยแพร่ `SUPABASE_SERVICE_ROLE_KEY` อย่างเด็ดขาด!

### 3.3 รัน Database Migrations

#### Option A: ใช้ Supabase SQL Editor (แนะนำ)

1. ไปที่ **SQL Editor** ใน Supabase Dashboard
2. Copy SQL จากไฟล์ `supabase/migrations/` ทีละไฟล์ เรียงตามลำดับ:
   ```
   001_create_enums.sql
   002_create_core_tables.sql
   003_create_module_tables.sql
   004_create_functions.sql
   005_create_triggers.sql
   006_create_rls_policies.sql
   007_create_indexes.sql
   008_seed_data.sql
   ```
3. รัน SQL ทีละไฟล์

#### Option B: ใช้ Supabase CLI

```bash
# Login
npx supabase login

# Link project
npx supabase link --project-ref your-project-ref

# Push migrations
npx supabase db push
```

### 3.4 ตั้งค่า Storage Bucket

1. ไปที่ **Storage** ใน Supabase Dashboard
2. คลิก **"New bucket"**
3. ตั้งชื่อ: `home-visit-images`
4. ✅ เปิด **Public bucket** (สำหรับแสดงรูปภาพ)
5. ตั้งค่า **Allowed MIME types**: `image/jpeg, image/png, image/webp`
6. ตั้งค่า **Max file size**: `5MB`

#### Storage Policies

ไปที่ **Policies** ของ bucket `home-visit-images`:

```sql
-- Policy: Authenticated users can upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'home-visit-images');

-- Policy: Authenticated users can view
CREATE POLICY "Authenticated users can view" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'home-visit-images');

-- Policy: Owners can delete
CREATE POLICY "Users can delete own images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'home-visit-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 3.5 ตั้งค่า Auth

1. ไปที่ **Authentication** → **Providers**
2. ตรวจสอบว่า **Email** provider เปิดอยู่
3. ไปที่ **Authentication** → **URL Configuration**:
   - **Site URL:** `https://your-domain.vercel.app`
   - **Redirect URLs:** `https://your-domain.vercel.app/**`

### 3.6 สร้าง Admin User ตัวแรก

ไปที่ **SQL Editor** → รัน:

```sql
-- สร้าง Admin user (ต้องสร้างผ่าน Auth ก่อน แล้วอัปเดต role)
-- 1. ไปที่ Authentication → Users → Invite user
-- 2. กรอก Email ของ Admin
-- 3. หลังจาก User สมัครแล้ว รัน SQL นี้:

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@yourschool.ac.th';
```

---

## 4. การตั้งค่าโปรเจกต์ Local

### 4.1 Clone & Install

```bash
# Clone repository
git clone https://github.com/your-org/scidas.git
cd scidas

# Install dependencies
npm install
```

### 4.2 Environment Variables

```bash
# Copy template
cp .env.example .env.local
```

แก้ไข `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJI...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=SCIDAS

# Storage
NEXT_PUBLIC_STORAGE_BUCKET=home-visit-images
```

### 4.3 Development Server

```bash
npm run dev
```

เปิด http://localhost:3000

### 4.4 Build Test

```bash
# ทดสอบ Build ก่อน Deploy
npm run build

# ทดสอบ Production build
npm start
```

---

## 5. การ Deploy บน Vercel

### 5.1 วิธีที่ 1: Vercel CLI (แนะนำ)

```bash
# ติดตั้ง Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (ครั้งแรก)
vercel

# Deploy Production
vercel --prod
```

### 5.2 วิธีที่ 2: GitHub Integration (แนะนำสำหรับทีม)

1. Push code ไปที่ GitHub Repository
2. ไปที่ https://vercel.com/new
3. Import GitHub Repository
4. ตั้งค่า:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

5. ตั้งค่า **Environment Variables** ใน Vercel:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | All |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | All |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` | Production |
| `NEXT_PUBLIC_APP_NAME` | `SCIDAS` | All |
| `NEXT_PUBLIC_STORAGE_BUCKET` | `home-visit-images` | All |

6. คลิก **"Deploy"**

### 5.3 Custom Domain (Optional)

1. ใน Vercel Dashboard → **Settings** → **Domains**
2. เพิ่ม Custom Domain: `scidas.yourschool.ac.th`
3. ตั้งค่า DNS:
   - **Type:** CNAME
   - **Name:** scidas
   - **Value:** cname.vercel-dns.com
4. รอ DNS propagation (~5-30 นาที)

> **หมายเหตุ:** อัปเดต Supabase Auth → URL Configuration ด้วย Custom Domain ใหม่

---

## 6. การ Deploy ทางเลือก

### 6.1 Railway

```bash
# ติดตั้ง Railway CLI
npm i -g @railway/cli

# Login & Deploy
railway login
railway init
railway up
```

### 6.2 Docker (Self-hosted)

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Build & Run
docker build -t scidas .
docker run -p 3000:3000 --env-file .env.local scidas
```

---

## 7. Post-Deployment Checklist

### ✅ Security Checklist

- [ ] HTTPS ทำงานปกติ (Vercel จัดการให้อัตโนมัติ)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` ไม่ได้อยู่ใน Client-side code
- [ ] RLS เปิดทุกตาราง
- [ ] Storage policies ตั้งค่าแล้ว
- [ ] Auth redirect URLs ถูกต้อง
- [ ] `.env.local` อยู่ใน `.gitignore`

### ✅ Functional Checklist

- [ ] Login/Logout ทำงานปกติ
- [ ] สร้างนักเรียนใหม่ได้
- [ ] บันทึกการมาเรียนได้
- [ ] อัปโหลดรูปภาพเยี่ยมบ้านได้
- [ ] Dashboard แสดงข้อมูลถูกต้อง
- [ ] Risk Score คำนวณถูกต้อง
- [ ] Notification ทำงาน
- [ ] Export PDF/Excel ทำงาน

### ✅ Performance Checklist

- [ ] Lighthouse Score >= 90
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 3s
- [ ] No layout shift (CLS < 0.1)

---

## 8. CI/CD Pipeline

### GitHub Actions (แนะนำ)

สร้างไฟล์ `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  deploy-preview:
    needs: lint-and-typecheck
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm i -g vercel
      - run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}
      - run: vercel build --token=${{ secrets.VERCEL_TOKEN }}
      - run: vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}

  deploy-production:
    needs: lint-and-typecheck
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm i -g vercel
      - run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      - run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      - run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

---

## 9. Monitoring & Maintenance

### 9.1 Vercel Analytics

- เปิด **Vercel Analytics** ใน Project Settings
- ดู Web Vitals: FCP, LCP, CLS, FID
- ดู Traffic และ Page Views

### 9.2 Supabase Dashboard

ตรวจสอบเป็นประจำ:

| เรื่อง | ตรวจอะไร | ความถี่ |
|-------|---------|--------|
| Database | Storage usage | รายสัปดาห์ |
| Auth | Active users | รายเดือน |
| Storage | Bucket usage | รายเดือน |
| Logs | Error logs | รายวัน |

### 9.3 Database Backup

Supabase Free tier มี:
- **Daily backups** (เก็บ 7 วัน)
- สามารถ Download backup ได้จาก Dashboard

สำหรับ Backup เพิ่มเติม:

```bash
# Manual backup via pg_dump
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup_$(date +%Y%m%d).sql
```

### 9.4 อัปเดตระบบ

```bash
# ตรวจสอบ dependencies ที่ต้องอัปเดต
npm outdated

# อัปเดต dependencies
npm update

# อัปเดต major versions (ระวัง!)
npx npm-check-updates -u
npm install
```

---

## 10. Troubleshooting

### ปัญหาที่พบบ่อย

#### 1. Login ไม่ได้

**สาเหตุ:** Auth redirect URL ไม่ตรงกับ domain ที่ Deploy

**แก้ไข:**
1. ไป Supabase → Authentication → URL Configuration
2. ตรวจสอบ Site URL และ Redirect URLs
3. อัปเดตให้ตรงกับ domain ที่ Deploy

#### 2. Data ไม่แสดง

**สาเหตุ:** RLS policies ไม่ถูกต้อง หรือ User ไม่มีสิทธิ์

**แก้ไข:**
1. ตรวจสอบ RLS policies ใน Supabase SQL Editor
2. ตรวจสอบ role ของ User ใน `profiles` table
3. ทดสอบ query ด้วย SQL Editor

#### 3. อัปโหลดรูปภาพไม่ได้

**สาเหตุ:** Storage policies ไม่ถูกต้อง หรือ Bucket ไม่มี

**แก้ไข:**
1. ตรวจสอบว่า bucket `home-visit-images` มีอยู่
2. ตรวจสอบ Storage policies
3. ตรวจสอบ CORS settings

#### 4. Build Error บน Vercel

**สาเหตุ:** Environment variables ไม่ครบ หรือ Type errors

**แก้ไข:**
1. ตรวจสอบ Environment variables บน Vercel
2. รัน `npm run build` ใน Local ก่อน
3. ตรวจสอบ Build logs บน Vercel Dashboard

#### 5. Performance ช้า

**สาเหตุ:** Query ไม่มี Index หรือ Component ไม่ได้ Optimize

**แก้ไข:**
1. ตรวจสอบ Supabase Query Performance
2. เพิ่ม Indexes ตามที่แนะนำใน `DATABASE_SCHEMA.md`
3. ใช้ React Server Components ให้มากที่สุด
4. ใช้ `Suspense` + `loading.tsx` สำหรับ Loading states

---

## 📝 Environment Variables Reference

| Variable | Required | Where | Description |
|----------|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Client + Server | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Server only | Supabase service role key |
| `NEXT_PUBLIC_APP_URL` | ✅ | Client + Server | Application URL |
| `NEXT_PUBLIC_APP_NAME` | ❌ | Client | Application name (default: SCIDAS) |
| `NEXT_PUBLIC_STORAGE_BUCKET` | ❌ | Client | Storage bucket name |

---

> **ต้องการความช่วยเหลือ?** เปิด Issue ใน GitHub Repository หรือติดต่อทีมพัฒนา
