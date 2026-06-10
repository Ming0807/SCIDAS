import type { StatusTone } from "@/lib/design/status"

export type StudentListItem = {
  id: string
  name: string
  studentCode: string
  grade: string
  classroom: string
  status: StatusTone
  statusLabel: string
  guardian: string
  phone: string
  avatarUrl: string
}

export const studentRows: StudentListItem[] = [
  {
    id: "12345",
    name: "เด็กชายกฤษฎา ใจดี",
    studentCode: "12345",
    grade: "ป.5",
    classroom: "1",
    status: "normal",
    statusLabel: "ปกติ",
    guardian: "นางสาวอรพิน ใจดี",
    phone: "089-123-4567",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=boy1",
  },
  {
    id: "12346",
    name: "เด็กหญิงธัญญารัตน์ ฟ้าใส",
    studentCode: "12346",
    grade: "ป.5",
    classroom: "1",
    status: "watch",
    statusLabel: "ติดตาม",
    guardian: "นายวิวัฒน์ ฟ้าใส",
    phone: "081-234-5678",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=girl1",
  },
  {
    id: "12347",
    name: "เด็กชายณัฐพล ศรีสุข",
    studentCode: "12347",
    grade: "ป.5",
    classroom: "1",
    status: "high-risk",
    statusLabel: "เสี่ยงสูง",
    guardian: "นางสุภาพร ศรีสุข",
    phone: "087-345-6789",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=boy2",
  },
  {
    id: "12348",
    name: "เด็กหญิงปริมลุข อินทร์แก้ว",
    studentCode: "12348",
    grade: "ป.5",
    classroom: "2",
    status: "normal",
    statusLabel: "ปกติ",
    guardian: "นางจันทิมา อินทร์แก้ว",
    phone: "090-456-7890",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=girl2",
  },
  {
    id: "12349",
    name: "เด็กชายธนวัฒน์ คำปา",
    studentCode: "12349",
    grade: "ป.5",
    classroom: "2",
    status: "watch",
    statusLabel: "ติดตาม",
    guardian: "นายสมชาย คำปา",
    phone: "093-567-8901",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=boy3",
  },
]

export const studentSummary = {
  total: 642,
  normal: 398,
  watch: 156,
  highRisk: 88,
  specialCare: 32,
}
