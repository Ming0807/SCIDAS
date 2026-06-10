export type StatusTone =
  | "neutral"
  | "primary"
  | "info"
  | "success"
  | "normal"
  | "warning"
  | "watch"
  | "danger"
  | "high-risk"

export type StatusToneClassNames = {
  badge: string
  indicator: string
  icon: string
  metric: string
}

export const statusToneLabels: Record<StatusTone, string> = {
  neutral: "Neutral",
  primary: "Primary",
  info: "Info",
  success: "Success",
  normal: "Normal",
  warning: "Warning",
  watch: "Watch",
  danger: "Danger",
  "high-risk": "High risk",
}

export const statusToneClassNames: Record<StatusTone, StatusToneClassNames> = {
  neutral: {
    badge: "border-border bg-muted text-foreground",
    indicator: "bg-muted-foreground",
    icon: "bg-muted text-muted-foreground",
    metric: "text-muted-foreground",
  },
  primary: {
    badge: "border-primary/20 bg-primary/10 text-primary",
    indicator: "bg-primary",
    icon: "bg-primary/10 text-primary",
    metric: "text-primary",
  },
  info: {
    badge:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300",
    indicator: "bg-blue-500",
    icon: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
    metric: "text-blue-700 dark:text-blue-300",
  },
  success: {
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
    indicator: "bg-emerald-500",
    icon:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    metric: "text-emerald-700 dark:text-emerald-300",
  },
  normal: {
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
    indicator: "bg-emerald-500",
    icon:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    metric: "text-emerald-700 dark:text-emerald-300",
  },
  warning: {
    badge:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
    indicator: "bg-amber-500",
    icon:
      "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    metric: "text-amber-800 dark:text-amber-300",
  },
  watch: {
    badge:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
    indicator: "bg-amber-500",
    icon:
      "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    metric: "text-amber-800 dark:text-amber-300",
  },
  danger: {
    badge:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300",
    indicator: "bg-red-500",
    icon: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
    metric: "text-red-700 dark:text-red-300",
  },
  "high-risk": {
    badge:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300",
    indicator: "bg-red-500",
    icon: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300",
    metric: "text-red-700 dark:text-red-300",
  },
}

const statusTones = Object.keys(statusToneLabels) as StatusTone[]

const statusAliases: Record<string, StatusTone> = {
  active: "success",
  absent: "danger",
  at_risk: "high-risk",
  "at-risk": "high-risk",
  critical: "high-risk",
  draft: "neutral",
  error: "danger",
  failed: "danger",
  healthy: "normal",
  high: "high-risk",
  high_risk: "high-risk",
  "high risk": "high-risk",
  low: "normal",
  medium: "watch",
  ok: "success",
  pending: "watch",
  present: "success",
  risk: "high-risk",
  urgent: "high-risk",
  watching: "watch",
}

export function getStatusTone(status?: StatusTone | string): StatusTone {
  if (!status) {
    return "neutral"
  }

  const normalized = status.trim().toLowerCase()

  if (statusTones.includes(normalized as StatusTone)) {
    return normalized as StatusTone
  }

  return statusAliases[normalized] ?? "neutral"
}

export function getStatusToneClassNames(
  status?: StatusTone | string
): StatusToneClassNames {
  return statusToneClassNames[getStatusTone(status)]
}

export function getStatusToneLabel(status?: StatusTone | string): string {
  return statusToneLabels[getStatusTone(status)]
}
