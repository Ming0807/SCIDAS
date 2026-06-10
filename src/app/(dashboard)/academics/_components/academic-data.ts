import type { StatusTone } from "@/lib/design/status"

export type AcademicStudent = {
  id: string
  name: string
  classroom: string
  gpa: number
  previousGpa: number
  weakSubject: string
  status: string
  statusTone: StatusTone
  avatarUrl: string
}

export const academicSummary = {
  averageGpa: 3.48,
  previousGpa: 3.22,
  goodStudents: 28,
  watchStudents: 32,
  topSubject: "ภาษาไทย",
  topSubjectAverage: 3.41,
  totalStudents: 152,
}

export const academicRiskStudents: AcademicStudent[] = [
  {
    id: "A001",
    name: "เด็กชายธนวัฒน์ ใจดี",
    classroom: "ม.2/1",
    gpa: 1.62,
    previousGpa: 1.75,
    weakSubject: "คณิตศาสตร์",
    status: "ต้องติดตามใกล้ชิด",
    statusTone: "high-risk",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=boy1",
  },
  {
    id: "A002",
    name: "เด็กหญิงปนิดา วงศ์คำ",
    classroom: "ม.3/2",
    gpa: 1.75,
    previousGpa: 1.88,
    weakSubject: "คณิตศาสตร์, วิทยาศาสตร์",
    status: "ต้องติดตามใกล้ชิด",
    statusTone: "high-risk",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=girl1",
  },
  {
    id: "A003",
    name: "เด็กชายกฤตภาส วงศ์ต๊ะ",
    classroom: "ม.2/3",
    gpa: 1.78,
    previousGpa: 1.92,
    weakSubject: "ภาษาอังกฤษ",
    status: "ต้องติดตามใกล้ชิด",
    statusTone: "high-risk",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=boy2",
  },
  {
    id: "A004",
    name: "เด็กหญิงศศิธร แซ่ลี้",
    classroom: "ม.1/1",
    gpa: 1.82,
    previousGpa: 1.95,
    weakSubject: "คณิตศาสตร์",
    status: "ต้องติดตามใกล้ชิด",
    statusTone: "high-risk",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=girl2",
  },
  {
    id: "A005",
    name: "เด็กชายพีรพัฒน์ คำมา",
    classroom: "ม.2/2",
    gpa: 1.88,
    previousGpa: 1.96,
    weakSubject: "ภาษาอังกฤษ",
    status: "ต้องติดตามใกล้ชิด",
    statusTone: "high-risk",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=boy3",
  },
]

export const academicTopStudents: AcademicStudent[] = [
  {
    id: "T001",
    name: "เด็กหญิงกมลลักษณ์ อินทร์คำ",
    classroom: "ม.3/1",
    gpa: 3.96,
    previousGpa: 3.84,
    weakSubject: "-",
    status: "ดีเด่น",
    statusTone: "success",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=girl3",
  },
  {
    id: "T002",
    name: "เด็กชายพชรพล แซ่ตั้ง",
    classroom: "ม.3/1",
    gpa: 3.92,
    previousGpa: 3.79,
    weakSubject: "-",
    status: "ดีเด่น",
    statusTone: "success",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=boy4",
  },
  {
    id: "T003",
    name: "เด็กหญิงณัฐธิดา ชัยวงค์",
    classroom: "ม.3/2",
    gpa: 3.89,
    previousGpa: 3.76,
    weakSubject: "-",
    status: "ดีเด่น",
    statusTone: "success",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=girl4",
  },
]
