import type { StatusTone } from "@/lib/design/status"

export type AttendanceStatus = "present" | "late" | "absent" | "leave"

export type AttendanceRow = {
  id: string
  name: string
  studentCode: string
  grade: string
  classroom: string
  status: AttendanceStatus
  statusLabel: string
  statusTone: StatusTone
  time: string
  note: string
  recorder: string
  avatarUrl: string
}

export const attendanceSummary = {
  total: 128,
  present: 118,
  absent: 8,
  leave: 2,
  late: 6,
  presentRate: 92.2,
}

export const attendanceRows: AttendanceRow[] = [
  {
    id: "66001",
    name: "เด็กชายกฤษฎา ใจดี",
    studentCode: "66001",
    grade: "ป.5",
    classroom: "1",
    status: "present",
    statusLabel: "มาเรียน",
    statusTone: "success",
    time: "07:58 น.",
    note: "-",
    recorder: "ครูประจำชั้น",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=boy1",
  },
  {
    id: "66002",
    name: "เด็กหญิงวริศรา คำดี",
    studentCode: "66002",
    grade: "ป.4",
    classroom: "1",
    status: "late",
    statusLabel: "มาสาย",
    statusTone: "info",
    time: "08:19 น.",
    note: "ติดธุระส่วนตัว",
    recorder: "ครูประจำชั้น",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=girl1",
  },
  {
    id: "66003",
    name: "เด็กชายพนมภัทร รักษ์มั่นคง",
    studentCode: "66003",
    grade: "ป.6",
    classroom: "1",
    status: "absent",
    statusLabel: "ขาด",
    statusTone: "danger",
    time: "-",
    note: "ป่วย",
    recorder: "ครูประจำชั้น",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=boy2",
  },
  {
    id: "66004",
    name: "เด็กหญิงญาดาเพชร เพชรดี",
    studentCode: "66004",
    grade: "ป.3",
    classroom: "1",
    status: "leave",
    statusLabel: "ลา",
    statusTone: "warning",
    time: "-",
    note: "กิจกรรมครอบครัว",
    recorder: "ครูประจำชั้น",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=girl2",
  },
  {
    id: "66005",
    name: "เด็กชายพงศกร ไชยมั่น",
    studentCode: "66005",
    grade: "ป.5",
    classroom: "2",
    status: "present",
    statusLabel: "มาเรียน",
    statusTone: "success",
    time: "07:54 น.",
    note: "-",
    recorder: "ครูประจำชั้น",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=boy3",
  },
  {
    id: "66006",
    name: "เด็กหญิงปภัสสร อำนาจแย้ม",
    studentCode: "66006",
    grade: "ป.4",
    classroom: "2",
    status: "present",
    statusLabel: "มาเรียน",
    statusTone: "success",
    time: "07:50 น.",
    note: "-",
    recorder: "ครูประจำชั้น",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=girl3",
  },
]
