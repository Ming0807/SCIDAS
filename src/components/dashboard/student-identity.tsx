import * as React from "react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import type { StatusTone } from "@/lib/design/status"
import { cn } from "@/lib/utils"

import { StatusBadge } from "./status-badge"

export type StudentIdentitySize = "sm" | "default"

export interface StudentIdentityProps
  extends React.ComponentPropsWithoutRef<"div"> {
  name: React.ReactNode
  avatarUrl?: string
  avatarAlt?: string
  initials?: string
  studentCode?: React.ReactNode
  grade?: React.ReactNode
  classroom?: React.ReactNode
  description?: React.ReactNode
  meta?: React.ReactNode
  status?: StatusTone | string
  statusLabel?: React.ReactNode
  size?: StudentIdentitySize
}

function getInitials(name: React.ReactNode, initials?: string) {
  if (initials) {
    return initials.slice(0, 2).toUpperCase()
  }

  if (typeof name !== "string") {
    return "ST"
  }

  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? "S"
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? "T"

  return `${first}${second}`.toUpperCase()
}

export function StudentIdentity({
  name,
  avatarUrl,
  avatarAlt,
  initials,
  studentCode,
  grade,
  classroom,
  description,
  meta,
  status,
  statusLabel,
  size = "default",
  className,
  ...props
}: StudentIdentityProps) {
  const details = [
    studentCode ? { key: "code", node: studentCode } : null,
    grade || classroom
      ? {
          key: "classroom",
          node: (
            <>
              {grade}
              {grade && classroom ? "/" : null}
              {classroom}
            </>
          ),
        }
      : null,
    description ? { key: "description", node: description } : null,
    meta ? { key: "meta", node: meta } : null,
  ].filter(Boolean) as Array<{ key: string; node: React.ReactNode }>

  return (
    <div
      data-slot="student-identity"
      data-size={size}
      className={cn(
        "flex min-w-0 items-center gap-3",
        size === "sm" && "gap-2",
        className
      )}
      {...props}
    >
      <Avatar size={size === "sm" ? "sm" : "default"}>
        {avatarUrl ? (
          <AvatarImage
            src={avatarUrl}
            alt={avatarAlt ?? (typeof name === "string" ? name : "Student")}
          />
        ) : null}
        <AvatarFallback>{getInitials(name, initials)}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <p
            className={cn(
              "min-w-0 truncate font-medium leading-tight text-foreground",
              size === "sm" ? "text-sm" : "text-base"
            )}
          >
            {name}
          </p>
          {status ? (
            <StatusBadge status={status} label={statusLabel} size="sm" />
          ) : null}
        </div>

        {details.length > 0 ? (
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            {details.map((item, index) => (
              <React.Fragment key={item.key}>
                {index > 0 ? (
                  <span aria-hidden="true" className="text-border">
                    /
                  </span>
                ) : null}
                <span className="min-w-0 truncate">{item.node}</span>
              </React.Fragment>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
