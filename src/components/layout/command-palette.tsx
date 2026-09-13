"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  CalendarCheck,
  ClipboardCheck,
  ClipboardList,
  Compass,
  FileSpreadsheet,
  HeartHandshake,
  Home,
  House,
  Moon,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Smile,
  Sun,
  Users,
  X,
  Zap,
} from "lucide-react"
import { useTheme } from "next-themes"

export type CommandAction = {
  id: string
  title: string
  subtitle?: string
  category: "navigation" | "action"
  icon: typeof Home
  keywords?: string[]
  perform: () => void
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const actions: CommandAction[] = useMemo(
    () => [
      // Navigation
      {
        id: "nav-home",
        title: "ภาพรวมระบบ (Dashboard)",
        subtitle: "หน้าหลักและกระดานสรุปสถานะการดูแล",
        category: "navigation",
        icon: Home,
        keywords: ["home", "dashboard", "หน้าแรก", "ภาพรวม"],
        perform: () => router.push("/"),
      },
      {
        id: "nav-students",
        title: "รายชื่อนักเรียน (Students)",
        subtitle: "ค้นหา ดูข้อมูล และจัดการระเบียนนักเรียน",
        category: "navigation",
        icon: Users,
        keywords: ["students", "นักเรียน", "รายชื่อ", "เด็ก"],
        perform: () => router.push("/students"),
      },
      {
        id: "nav-attendance",
        title: "บันทึกการมาเรียน (Attendance)",
        subtitle: "เช็คชื่อประจำวันรายห้องเรียน",
        category: "navigation",
        icon: CalendarCheck,
        keywords: ["attendance", "เช็คชื่อ", "มาเรียน", "ขาด", "สาย"],
        perform: () => router.push("/attendance"),
      },
      {
        id: "nav-academics",
        title: "ผลการเรียนและคะแนน (Academics)",
        subtitle: "บันทึกคะแนนเก็บ กลางภาค และปลายภาค",
        category: "navigation",
        icon: BookOpen,
        keywords: ["academics", "คะแนน", "เกรด", "วิชาการ"],
        perform: () => router.push("/academics"),
      },
      {
        id: "nav-behavior",
        title: "บันทึกพฤติกรรม (Behavior)",
        subtitle: "ความประพฤติเชิงบวกและบันทึกเหตุการณ์เสี่ยง",
        category: "navigation",
        icon: Smile,
        keywords: ["behavior", "พฤติกรรม", "ความดี", "คะแนนความประพฤติ"],
        perform: () => router.push("/behavior"),
      },
      {
        id: "nav-home-visits",
        title: "การเยี่ยมบ้าน (Home Visits)",
        subtitle: "บันทึกสภาพความเป็นอยู่และรูปถ่ายการเยี่ยมบ้าน",
        category: "navigation",
        icon: House,
        keywords: ["home visits", "เยี่ยมบ้าน", "ผู้ปกครอง", "สภาพแวดล้อม"],
        perform: () => router.push("/home-visits"),
      },
      {
        id: "nav-support",
        title: "การช่วยเหลือและดูแลเคส (Support)",
        subtitle: "บันทึกมาตรการช่วยเหลือและเคสเร่งด่วน",
        category: "navigation",
        icon: HeartHandshake,
        keywords: ["support", "ช่วยเหลือ", "เคส", "ดูแล"],
        perform: () => router.push("/support"),
      },
      {
        id: "nav-referrals",
        title: "ระบบส่งต่อนักเรียน (Referral Center)",
        subtitle: "การส่งต่อภายในและหน่วยงานภายนอก (สพฐ. ขั้นที่ 5)",
        category: "navigation",
        icon: Share2,
        keywords: ["referral", "ส่งต่อ", "โรงพยาบาล", "แนะแนว", "รพสต", "พมจ"],
        perform: () => router.push("/referrals"),
      },
      {
        id: "nav-screening",
        title: "ศูนย์กลางการคัดกรองนักเรียน (Screening Hub)",
        subtitle: "ภาพรวมการคัดกรอง SDQ, 5 ด้าน สพฐ., และทักษะพื้นฐาน 3R",
        category: "navigation",
        icon: ClipboardCheck,
        keywords: ["screening", "คัดกรอง", "sdq", "3r", "สพฐ", "5 ด้าน"],
        perform: () => router.push("/screening"),
      },
      {
        id: "nav-sdq",
        title: "แบบประเมินพฤติกรรม SDQ (Strengths & Difficulties)",
        subtitle: "ประเมินพฤติกรรม 25 ข้อ 5 มิติ มาตรฐานกรมสุขภาพจิต/สพฐ.",
        category: "navigation",
        icon: ClipboardCheck,
        keywords: ["sdq", "คัดกรอง", "ประเมินพฤติกรรม", "25 ข้อ", "5 ด้าน"],
        perform: () => router.push("/screening/sdq"),
      },
      {
        id: "nav-idp",
        title: "แผนพัฒนาการรายบุคคล (IDP)",
        subtitle: "เป้าหมายการพัฒนาและประเมินผลการเรียนรู้",
        category: "navigation",
        icon: ClipboardList,
        keywords: ["idp", "แผนพัฒนาการ", "เป้าหมาย", "ศักยภาพ"],
        perform: () => router.push("/development-plans"),
      },
      {
        id: "nav-risk",
        title: "วิเคราะห์ความเสี่ยง (Risk Analysis)",
        subtitle: "ระบบแจ้งเตือนล่วงหน้า (Early Warning System)",
        category: "navigation",
        icon: Compass,
        keywords: ["risk", "ความเสี่ยง", "early warning", "เตือนภัย"],
        perform: () => router.push("/risk-analysis"),
      },
      {
        id: "nav-reports",
        title: "รายงานและส่งออกเอกสาร (Reports)",
        subtitle: "ดาวน์โหลดเอกสาร PDF และ Excel ทางการ",
        category: "navigation",
        icon: FileSpreadsheet,
        keywords: ["reports", "รายงาน", "pdf", "excel", "ส่งออก"],
        perform: () => router.push("/reports"),
      },
      {
        id: "nav-settings",
        title: "ตั้งค่าระบบ (Settings)",
        subtitle: "จัดการโปรไฟล์ ปีการศึกษา และโครงสร้างโรงเรียน",
        category: "navigation",
        icon: Settings,
        keywords: ["settings", "ตั้งค่า", "ปีการศึกษา", "ห้องเรียน"],
        perform: () => router.push("/settings"),
      },
      {
        id: "nav-staff",
        title: "จัดการบุคลากรและครูประจำชั้น (Staff Management)",
        subtitle: "กำหนดสิทธิ์ผู้ดูแล ผู้อำนวยการ ครูแนะแนว และมอบหมายห้องเรียน",
        category: "navigation",
        icon: Users,
        keywords: ["staff", "บุคลากร", "ครู", "ครูประจำชั้น", "สิทธิ์", "admin", "บทบาท"],
        perform: () => router.push("/settings/staff"),
      },
      {
        id: "nav-audit-logs",
        title: "ประวัติการเข้าถึงและการตรวจสอบ (PDPA Audit Logs)",
        subtitle: "ตรวจสอบบันทึกความปลอดภัย การเข้าสู่ระบบ และการแก้ไขข้อมูล",
        category: "navigation",
        icon: ShieldCheck,
        keywords: ["audit", "logs", "pdpa", "ความปลอดภัย", "ตรวจสอบ", "ประวัติ"],
        perform: () => router.push("/settings/audit-logs"),
      },

      // Quick Actions
      {
        id: "action-new-referral",
        title: "สร้างเคสส่งต่อนักเรียน (Referral)",
        subtitle: "ส่งต่อไปยังฝ่ายแนะแนวหรือหน่วยงานภายนอก",
        category: "action",
        icon: Share2,
        keywords: ["ส่งต่อ", "referral", "สร้างเคส"],
        perform: () => router.push("/referrals/new"),
      },
      {
        id: "action-sdq",
        title: "ทำแบบประเมิน SDQ 25 ข้อ",
        subtitle: "เปิดหน้าคัดกรองพฤติกรรมนักเรียนรายบุคคล",
        category: "action",
        icon: ClipboardCheck,
        keywords: ["sdq", "ประเมิน", "คัดกรอง"],
        perform: () => router.push("/screening/sdq"),
      },
      {
        id: "action-new-behavior",
        title: "บันทึกคะแนนพฤติกรรมทันที",
        subtitle: "เพิ่มความดีหรือตัดคะแนนพฤติกรรม",
        category: "action",
        icon: Zap,
        keywords: ["บันทึกพฤติกรรม", "ตัดแต้ม", "บวกคะแนน"],
        perform: () => router.push("/behavior/record"),
      },
      {
        id: "action-new-visit",
        title: "บันทึกการเยี่ยมบ้านใหม่",
        subtitle: "กรอกข้อมูลและอัปโหลดรูปภาพลงพื้นที่",
        category: "action",
        icon: House,
        keywords: ["เยี่ยมบ้านใหม่", "ลงพื้นที่"],
        perform: () => router.push("/home-visits/new"),
      },
      {
        id: "action-new-support",
        title: "เปิดเคสการช่วยเหลือใหม่",
        subtitle: "สร้างรายการส่งเสริมหรือช่วยเหลือเฉพาะราย",
        category: "action",
        icon: HeartHandshake,
        keywords: ["เคสใหม่", "ช่วยเหลือด่วน"],
        perform: () => router.push("/support/new"),
      },
      {
        id: "action-new-idp",
        title: "สร้างแผนพัฒนาการ (IDP) ใหม่",
        subtitle: "กำหนดเป้าหมายการเรียนรู้และพัฒนาการ",
        category: "action",
        icon: ClipboardList,
        keywords: ["สร้าง idp", "แผนใหม่"],
        perform: () => router.push("/development-plans/new"),
      },
      {
        id: "action-toggle-theme",
        title: theme === "dark" ? "เปลี่ยนเป็นโหมดสว่าง (Light Mode)" : "เปลี่ยนเป็นโหมดมืด (Dark Mode)",
        subtitle: "สลับชุดสีการแสดงผลของระบบ",
        category: "action",
        icon: theme === "dark" ? Sun : Moon,
        keywords: ["theme", "dark", "light", "โหมดมืด", "โหมดสว่าง", "สี"],
        perform: () => setTheme(theme === "dark" ? "light" : "dark"),
      },
    ],
    [router, theme, setTheme]
  )

  const filteredActions = useMemo(() => {
    if (!query.trim()) return actions
    const q = query.toLowerCase().trim()
    return actions.filter((action) => {
      const matchTitle = action.title.toLowerCase().includes(q)
      const matchSub = action.subtitle?.toLowerCase().includes(q)
      const matchKey = action.keywords?.some((k) => k.toLowerCase().includes(q))
      return matchTitle || matchSub || matchKey
    })
  }, [actions, query])

  const safeIndex = selectedIndex >= filteredActions.length ? 0 : selectedIndex

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleClose = useCallback(() => {
    setQuery("")
    setSelectedIndex(0)
    onClose()
  }, [onClose])

  // Keyboard navigation inside palette
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredActions.length))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev <= 0 ? filteredActions.length - 1 : prev - 1
        )
      } else if (e.key === "Enter") {
        e.preventDefault()
        const selected = filteredActions[safeIndex]
        if (selected) {
          selected.perform()
          handleClose()
        }
      } else if (e.key === "Escape") {
        e.preventDefault()
        handleClose()
      }
    },
    [filteredActions, safeIndex, handleClose]
  )

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="ค้นหาและสั่งการด่วน"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-20 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
          <Search className="size-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            placeholder="ค้นหาเมนู, คำสั่งด่วน, หรือหน้าจอ..."
            className="w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("")
                setSelectedIndex(0)
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <ul
          ref={listRef}
          role="listbox"
          className="max-h-80 overflow-y-auto p-2 text-sm focus:outline-none divide-y divide-border/30"
        >
          {filteredActions.length === 0 ? (
            <li className="py-8 text-center text-sm text-muted-foreground">
              ไม่พบรายการที่ตรงกับคำค้นหา &ldquo;{query}&rdquo;
            </li>
          ) : (
            filteredActions.map((action, index) => {
              const Icon = action.icon
              const isSelected = index === safeIndex

              return (
                <li
                  key={action.id}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => {
                    action.perform()
                    handleClose()
                  }}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                        isSelected
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{action.title}</p>
                      {action.subtitle ? (
                        <p
                          className={`truncate text-xs ${
                            isSelected
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground"
                          }`}
                        >
                          {action.subtitle}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <span
                    className={`shrink-0 text-xs font-mono px-1.5 py-0.5 rounded ${
                      isSelected
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {action.category === "action" ? "Action" : "Page"}
                  </span>
                </li>
              )
            })
          )}
        </ul>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-border bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border border-border bg-card px-1 py-0.5 font-mono text-xs">
                ↑
              </kbd>{" "}
              <kbd className="rounded border border-border bg-card px-1 py-0.5 font-mono text-xs">
                ↓
              </kbd>{" "}
              เลื่อนเลือก
            </span>
            <span>
              <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-xs">
                ↵
              </kbd>{" "}
              ดำเนินการ
            </span>
          </div>
          <span className="font-sans">SCIDAS Command Palette</span>
        </div>
      </div>
    </div>
  )
}
