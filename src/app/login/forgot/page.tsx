'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookMarked, CheckCircle2, Loader2 } from 'lucide-react'

import { createClient } from '@/utils/supabase/client'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('กรุณากรอกอีเมลที่ใช้สมัคร')
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset`,
      })
      if (resetError) {
        setError('ส่งลิงก์รีเซ็ตรหัสผ่านไม่สำเร็จ กรุณาตรวจสอบอีเมลแล้วลองอีกครั้ง')
        return
      }
      setSent(true)
    } catch {
      setError('ส่งลิงก์รีเซ็ตรหัสผ่านไม่สำเร็จ กรุณาลองอีกครั้ง')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <div aria-hidden="true" className="absolute -top-40 -left-40 size-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div aria-hidden="true" className="absolute -bottom-40 -right-40 size-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      <Card className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-lg relative z-10">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-primary/10 border-2 border-amber-400 shadow-xs">
            <BookMarked className="size-7 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            ลืมรหัสผ่าน
          </CardTitle>
          <CardDescription className="text-xs leading-relaxed text-muted-foreground mt-1">
            กรอกอีเมลที่ใช้สมัคร ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {sent ? (
            <div className="space-y-4 text-center">
              <CheckCircle2 className="mx-auto size-10 text-emerald-600" />
              <p className="text-sm font-medium text-foreground">
                ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                กรุณาตรวจสอบกล่องจดหมายของ <span className="font-semibold">{email.trim()}</span> แล้วทำตามขั้นตอนในอีเมล (ลิงก์มีอายุจำกัด)
              </p>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "outline" }), "w-full h-11 rounded-xl text-sm")}
              >
                <ArrowLeft className="size-4" />
                กลับไปหน้าเข้าสู่ระบบ
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="forgot-email">อีเมล</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  placeholder="teacher@school.ac.th"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl text-sm"
                />
              </div>

              {error ? (
                <p role="alert" className="text-xs font-medium text-destructive">
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                className="w-full h-11 rounded-xl text-sm font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    กำลังส่งลิงก์...
                  </>
                ) : (
                  'ส่งลิงก์รีเซ็ตรหัสผ่าน'
                )}
              </Button>

              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "ghost" }), "w-full h-10 rounded-xl text-sm")}
              >
                <ArrowLeft className="size-4" />
                กลับไปหน้าเข้าสู่ระบบ
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
