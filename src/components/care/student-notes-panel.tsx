import type { SectionVariant } from "@/components/dashboard"
import { Section, StatusBadge } from "@/components/dashboard"
import { EmptyState } from "@/components/feedback"
import { formatThaiDateTime } from "@/lib/student-care-formatters"
import type { StudentNoteItem } from "@/lib/server/student-care-read-models"

import { StudentNoteForm } from "./student-note-form"

type StudentNotesPanelProps = {
  studentId: string | null
  notes: StudentNoteItem[]
  title?: string
  description?: string
  variant?: SectionVariant
  showForm?: boolean
}

function getNoteVisibilityLabel(visibility: StudentNoteItem["visibility"]) {
  const labels: Record<StudentNoteItem["visibility"], string> = {
    team: "ทีมดูแล",
    private: "ส่วนตัว",
    leadership: "ผู้บริหาร",
  }

  return labels[visibility]
}

export function StudentNotesPanel({
  studentId,
  notes,
  title = "บันทึกทีมดูแล",
  description = "เก็บบริบทล่าสุดของนักเรียน เพื่อให้ทีมเห็นภาพเดียวกันก่อนติดตามต่อ",
  variant = "plain",
  showForm = true,
}: StudentNotesPanelProps) {
  return (
    <Section
      variant={variant}
      title={title}
      description={description}
      contentClassName="space-y-4"
    >
      {studentId ? (
        <>
          {showForm ? <StudentNoteForm studentId={studentId} /> : null}
          {notes.length > 0 ? (
            <div className="space-y-3">
              {notes.map((note) => (
                <article
                  key={note.id}
                  className="rounded-lg border border-border bg-card p-3 text-card-foreground"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{note.authorName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatThaiDateTime(note.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status="info" label={note.category} size="sm" />
                      <StatusBadge
                        status="neutral"
                        label={getNoteVisibilityLabel(note.visibility)}
                        size="sm"
                      />
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground">
                    {note.body}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              size="compact"
              title="ยังไม่มีบันทึกของนักเรียนคนนี้"
              description="เพิ่มบันทึกแรกเพื่อให้ทีมเห็นบริบทและขั้นตอนถัดไปตรงกัน"
            />
          )}
        </>
      ) : (
        <EmptyState
          title="เลือกนักเรียนเพื่อเพิ่มบันทึก"
          description="เลือกรายชื่อเพื่อดูประวัติและเพิ่มบันทึกของทีมดูแล"
        />
      )}
    </Section>
  )
}
