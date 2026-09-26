"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ImagePlus, Loader2, Trash2 } from "lucide-react"

import {
  removeStudentPhotoAction,
  uploadStudentPhotoAction,
} from "@/app/actions/student-photo.actions"
import { Button } from "@/components/ui/button"
import { compressImageFile } from "@/lib/image-compressor"

export function StudentPhotoEditor({
  studentId,
  studentName,
  hasPhoto,
  canEdit,
}: {
  studentId: string
  studentName: string
  hasPhoto: boolean
  canEdit: boolean
}) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  if (!canEdit) return null

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setMessage(null)
    setIsError(false)
    startTransition(async () => {
      try {
        const compressed = await compressImageFile(file, 640, 0.82)
        const res = await uploadStudentPhotoAction({ student_id: studentId, file: compressed })
        setIsError(!res.ok)
        setMessage(res.message)
        if (res.ok) router.refresh()
      } catch {
        setIsError(true)
        setMessage("ไม่สามารถอัปโหลดรูปได้ กรุณาลองใหม่")
      }
    })
  }

  function handleRemove() {
    if (!confirm(`ลบรูปโปรไฟล์ของ ${studentName}?`)) return
    setMessage(null)
    setIsError(false)
    startTransition(async () => {
      const res = await removeStudentPhotoAction({ student_id: studentId })
      setIsError(!res.ok)
      setMessage(res.message)
      if (res.ok) router.refresh()
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label={`เลือกรูปโปรไฟล์ของ ${studentName}`}
        onChange={handleFileChange}
        disabled={pending}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => fileRef.current?.click()}
        className="gap-1.5 text-xs"
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : <ImagePlus className="size-3.5" />}
        {pending ? "กำลังอัปโหลด..." : hasPhoto ? "เปลี่ยนรูป" : "เพิ่มรูปโปรไฟล์"}
      </Button>
      {hasPhoto ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={pending}
          onClick={handleRemove}
          className="gap-1.5 text-xs text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
          ลบรูป
        </Button>
      ) : null}
      {message ? (
        <p role={isError ? "alert" : "status"} className={`w-full text-xs ${isError ? "text-destructive" : "text-emerald-600"}`}>
          {message}
        </p>
      ) : null}
    </div>
  )
}
