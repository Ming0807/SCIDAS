import { MessageSquarePlus } from "lucide-react"

import { addStudentNoteFormAction } from "@/app/actions/care.actions"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type StudentNoteFormProps = {
  studentId: string
  className?: string
}

export function StudentNoteForm({ studentId, className }: StudentNoteFormProps) {
  return (
    <form action={addStudentNoteFormAction} className={cn("space-y-3", className)}>
      <input type="hidden" name="studentId" value={studentId} />
      <textarea
        name="body"
        required
        rows={4}
        placeholder="บันทึกสิ่งที่พบ การประสานงาน หรือขั้นตอนถัดไป..."
        className="min-h-28 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/50"
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <label className="text-sm">
            <span className="sr-only">หมวดบันทึก</span>
            <select
              name="category"
              defaultValue="support"
              className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
            >
              <option value="support">ดูแลช่วยเหลือ</option>
              <option value="risk">ความเสี่ยง</option>
              <option value="attendance">การมาเรียน</option>
              <option value="family">ครอบครัว</option>
              <option value="home_visit">เยี่ยมบ้าน</option>
              <option value="idp">แผนพัฒนา</option>
              <option value="general">ทั่วไป</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="sr-only">การมองเห็น</span>
            <select
              name="visibility"
              defaultValue="team"
              className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
            >
              <option value="team">ทีมดูแล</option>
              <option value="private">ส่วนตัว</option>
              <option value="leadership">ผู้บริหาร</option>
            </select>
          </label>
        </div>
        <Button type="submit">
          <MessageSquarePlus /> เพิ่มบันทึก
        </Button>
      </div>
    </form>
  )
}
