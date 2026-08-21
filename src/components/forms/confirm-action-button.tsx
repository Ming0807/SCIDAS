"use client"

import { useState, useTransition } from "react"
import { LoaderCircle } from "lucide-react"
import { useRouter } from "next/navigation"

import type { ActionResult } from "@/lib/server/action-result"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { ActionFeedback } from "./action-feedback"

type ConfirmActionButtonProps = {
  action: () => Promise<ActionResult<unknown>>
  label: string
  title: string
  description: string
  confirmLabel?: string
  pendingLabel?: string
  variant?: "default" | "destructive" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg"
  onSuccessHref?: string
}

export function ConfirmActionButton({
  action,
  label,
  title,
  description,
  confirmLabel = "ยืนยัน",
  pendingLabel = "กำลังดำเนินการ",
  variant = "destructive",
  size = "sm",
  onSuccessHref,
}: ConfirmActionButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [result, setResult] = useState<ActionResult<unknown> | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleConfirm = () => {
    setResult(null)
    startTransition(async () => {
      const nextResult = await action()
      setResult(nextResult)

      if (nextResult.ok) {
        setOpen(false)
        if (onSuccessHref) router.push(onSuccessHref)
        else router.refresh()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant={variant} size={size} />}>
        {label}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <ActionFeedback result={result} />

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" disabled={isPending} />}>
            ยกเลิก
          </DialogClose>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
            ) : null}
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
