import { CheckCircle2 } from "lucide-react"

import { setActionItemStatusFormAction } from "@/app/actions/care.actions"
import { Button } from "@/components/ui/button"
import type { ActionQueueItem } from "@/lib/server/student-care-read-models"

type ActionStatusControlsProps = {
  item: ActionQueueItem
}

export function ActionStatusControls({ item }: ActionStatusControlsProps) {
  return (
    <div className="flex justify-end gap-1">
      {item.status === "todo" ? (
        <form action={setActionItemStatusFormAction}>
          <input type="hidden" name="actionItemId" value={item.id} />
          <input type="hidden" name="status" value="in_progress" />
          <Button type="submit" size="sm" variant="outline">
            เริ่มทำ
          </Button>
        </form>
      ) : null}
      {item.status !== "done" && item.status !== "cancelled" ? (
        <form action={setActionItemStatusFormAction}>
          <input type="hidden" name="actionItemId" value={item.id} />
          <input type="hidden" name="status" value="done" />
          <Button type="submit" size="sm" variant="secondary">
            <CheckCircle2 /> ปิดงาน
          </Button>
        </form>
      ) : null}
    </div>
  )
}
