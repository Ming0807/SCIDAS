"use client"

import { useState } from "react"
import { BookOpen, Check, Copy, ExternalLink, Phone, Search, Building2, Hospital } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { REFERRAL_AGENCY_DIRECTORY, type AgencyDirectoryEntry } from "@/lib/referral-constants"

export function AgencyDirectoryModal({
  onSelectAgency,
  triggerButtonText = "ทำเนียบหน่วยงานส่งต่อ (Agency Directory)",
}: {
  onSelectAgency?: (agencyName: string) => void
  triggerButtonText?: string
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<"all" | "internal" | "external">("all")

  const filteredAgencies = REFERRAL_AGENCY_DIRECTORY.filter((agency) => {
    if (filterType !== "all" && agency.type !== filterType) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      agency.name.toLowerCase().includes(q) ||
      agency.description.toLowerCase().includes(q) ||
      (agency.hotline && agency.hotline.includes(q))
    )
  })

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs h-9 rounded-xl border-dashed"
          />
        }
      >
        <BookOpen className="size-3.5 mr-1.5 text-primary" />
        {triggerButtonText}
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold">
            <BookOpen className="size-5 text-primary" />
            ทำเนียบเครือข่ายและหน่วยงานส่งต่อ (Agency Directory)
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            รายชื่อหน่วยงานส่งต่อทั้งภายในและภายนอกสถานศึกษา สายด่วนฉุกเฉิน และเวลาทำการ ตามระบบดูแลช่วยเหลือนักเรียน สพฐ.
          </DialogDescription>
        </DialogHeader>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อหน่วยงาน, บริการ, เบอร์โทร..."
              className="pl-8 text-xs h-9 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              ทั้งหมด
            </button>
            <button
              type="button"
              onClick={() => setFilterType("internal")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === "internal"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              ภายในโรงเรียน
            </button>
            <button
              type="button"
              onClick={() => setFilterType("external")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterType === "external"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              ภายนอก
            </button>
          </div>
        </div>

        {/* Directory List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 pt-2">
          {filteredAgencies.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              ไม่พบหน่วยงานที่ตรงกับคำค้นหา
            </div>
          ) : (
            filteredAgencies.map((agency: AgencyDirectoryEntry) => (
              <div
                key={agency.id}
                className="p-3.5 rounded-xl border border-border bg-card/60 hover:bg-muted/30 transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                          agency.type === "external"
                            ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800"
                            : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
                        }`}
                      >
                        {agency.type === "external" ? (
                          <>
                            <Hospital className="size-3" />
                            ภายนอก
                          </>
                        ) : (
                          <>
                            <Building2 className="size-3" />
                            ภายในโรงเรียน
                          </>
                        )}
                      </span>

                      <h4 className="text-xs font-semibold text-foreground">
                        {agency.name}
                      </h4>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {agency.description}
                    </p>
                  </div>

                  {onSelectAgency ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        onSelectAgency(agency.name)
                        setOpen(false)
                      }}
                      className="text-xs shrink-0 h-8 rounded-lg"
                    >
                      เลือกหน่วยงานนี้
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(agency.id, agency.name)}
                      className="text-xs shrink-0 h-8 rounded-lg"
                    >
                      {copiedId === agency.id ? (
                        <>
                          <Check className="size-3 mr-1 text-emerald-600" />
                          คัดลอกแล้ว
                        </>
                      ) : (
                        <>
                          <Copy className="size-3 mr-1" />
                          คัดลอกชื่อ
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1 border-t border-border/50">
                  {agency.hotline ? (
                    <span className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                      <Phone className="size-3" />
                      สายด่วน: {agency.hotline}
                    </span>
                  ) : null}

                  {agency.operatingHours ? (
                    <span className="flex items-center gap-1">
                      เวลาทำการ: {agency.operatingHours}
                    </span>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
