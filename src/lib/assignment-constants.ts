import type { Database } from "@/types/database.types"

export type SubmissionStatus = Database["public"]["Enums"]["submission_status"]

export const SUBMISSION_STATUSES: SubmissionStatus[] = [
  "submitted",
  "late_submitted",
  "not_submitted",
  "resubmitted",
]

const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  submitted: "ส่งแล้ว",
  late_submitted: "ส่งช้า",
  not_submitted: "ไม่ส่ง",
  resubmitted: "ส่งใหม่",
}

export function getSubmissionStatusLabel(status: SubmissionStatus): string {
  return SUBMISSION_STATUS_LABELS[status] ?? status
}
