export type ActionErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"

export type FieldErrors = Record<string, string[]>

export type ActionResult<TData = unknown> =
  | {
      ok: true
      message: string
      data?: TData
      revalidated?: string[]
      redirectTo?: string
    }
  | {
      ok: false
      message: string
      code: ActionErrorCode
      fieldErrors?: FieldErrors
      formErrors?: string[]
    }

export function actionOk<TData>(
  message: string,
  options: Omit<Extract<ActionResult<TData>, { ok: true }>, "ok" | "message"> = {},
): ActionResult<TData> {
  return { ok: true, message, ...options }
}

export function actionFail<TData = unknown>(
  code: ActionErrorCode,
  message: string,
  options: Omit<Extract<ActionResult<TData>, { ok: false }>, "ok" | "code" | "message"> = {},
): ActionResult<TData> {
  return { ok: false, code, message, ...options }
}
