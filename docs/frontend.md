# Frontend & UI/UX Guidelines (Impeccable Standards)

เอกสารนี้กำหนดมาตรฐานการออกแบบ (Design System) และโครงสร้าง Frontend สำหรับ SCIDAS อ้างอิงตามเป้าหมายระดับ **Production SaaS** และทักษะการออกแบบระดับสูง (Impeccable Skill)

## 1. Product Strategy & Register
- **Register:** Product (SaaS Dashboard)
- **Target Audience:** โรงเรียนขนาดเล็ก (ครู, ผู้บริหาร) ก่อนขยายเป็น SaaS เต็มรูปแบบในอนาคต
- **Purpose:** เครื่องมือวิเคราะห์และดูแลช่วยเหลือนักเรียน เน้นการใช้งานจริง ไม่ใช่แค่โชว์ข้อมูล 
- **Personality:** น่าเชื่อถือ (Professional), ใช้งานง่าย (Accessible), และสบายตา (Clean & Calm)

## 2. Color Palette & Theming
อ้างอิงจากแบบ Mockup UI ล่าสุด
- **Primary Brand (Sidebar & Action):** Deep Blue/Navy (เทียบเท่า `slate-900` หรือ `#0f2e60`) สำหรับ Sidebar และปุ่มหลัก
- **Active State:** Bright Blue (เทียบเท่า `blue-600`) สำหรับเมนูที่ถูกเลือก
- **Background:** Light Gray (เทียบเท่า `slate-50` หรือ `gray-50`) เพื่อให้ Card สีขาวโดดเด่น
- **Surface (Cards):** White (`bg-white`)
- **Text (Ink):**
  - Primary: `slate-800` หรือ `gray-900`
  - Secondary: `slate-500`
- **Semantic/Status Colors:**
  - **Normal / Success:** Green (`emerald-500`) - สีเขียวปกติ
  - **Watch / Warning:** Amber (`amber-500`) - สีเหลืองเฝ้าระวัง
  - **High Risk / Danger:** Red (`red-500` หรือ `rose-500`) - สีแดงเสี่ยงสูง
  - *เทคนิค:* ใช้ Soft Badge (พื้นหลังสีอ่อน + ตัวหนังสือสีเข้ม) เช่น `bg-red-50 text-red-600`

## 3. Typography
- **Font Family:** `Inter` (EN) และ ฟอนต์ไทยที่อ่านง่าย เช่น `Kanit` หรือ `Prompt` (ผ่าน `next/font/google`)
- **Hierarchy:** 
  - ใช้ขนาดและน้ำหนัก (Scale + Weight) ในการแยกความสำคัญ
  - ห้ามใช้ตัวพิมพ์ใหญ่ทั้งหมด (All-caps) ในประโยคยาวๆ

## 4. UI Components & Layout
- **Cards:** ใช้ `rounded-xl` หรือ `rounded-2xl` (ไม่เกิน 16px) และเงาแบบนุ่มนวล (`shadow-sm` หรือ `box-shadow: 0 4px 20px rgba(0,0,0,0.05)`)
- **Icons:** ไอคอนใน Card สรุปผล ให้วางในวงกลมที่มีพื้นหลังสีอ่อน (Tinted Background) เพื่อความสวยงาม
- **Sidebar:** พื้นหลังสีน้ำเงินเข้ม ตัวหนังสือสีขาวขุ่น เมื่อ Active จะเป็นพื้นหลังสีน้ำเงินสว่างขอบมน (`rounded-lg` หรือ `rounded-xl`)
- **Grid Layout:** ใช้ CSS Grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`) เพื่อความยืดหยุ่นในการจัดหน้าจอแบบ Responsive
- **Data Tables:** สะอาดตา ไม่มีเส้นขอบหนาๆ (No heavy borders) เน้นใช้พื้นที่ว่าง (Whitespace) ในการแยกคอลัมน์

## 5. Absolute Bans (ข้อห้ามเด็ดขาด)
1. ❌ **ห้ามใช้ Glassmorphism** (แผ่นใสเบลอ) เป็นค่าเริ่มต้น ให้เน้นสีทึบ (Solid) อ่านง่าย
2. ❌ **ห้ามใช้เส้นขอบสีหนาๆ ด้านข้าง (Side-stripe borders)** เช่น `border-left-4` ยกเว้นจำเป็นจริงๆ เพื่อแจ้งเตือน
3. ❌ **ห้ามใช้ Gradient Text** ในส่วนที่ต้องอ่านข้อมูล
4. ❌ **ห้ามใช้ Card ที่โค้งมนเกินไป** (เกิน 24px ขึ้นไปจะดูเหมือนของเล่น ไม่ใช่ SaaS)
5. ❌ **หลีกเลี่ยง Gray text บน Gray background** ต้องตรวจสอบ Contrast เสมอ (Text ต้องชัดกว่า Background)

## 6. Implementation Rule
สำหรับการพัฒนาหน้าต่าง ๆ จากนี้ไป (รวมถึง **Phase 9: IDP** และการปรับปรุงหน้า Dashboard):
- ให้ยึด Design Tokens ตามไฟล์นี้เป็น **"กฎหลัก"**
- การพัฒนาทุกหน้าจะต้องเช็ค Responsive, ใช้งาน `shadcn/ui` ที่ปรับแต่งแล้ว, และต้องเป็น Production-grade Code เสมอ
