'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BookMarked, CheckCircle2, Loader2 } from 'lucide-react'

import { createClient } from '@/utils/supabase/client'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }
    if (password !== confirm) {
      setError('รหัสผ่านทั้งสองช่องไม่ตรงกัน')
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError('ตั้งรหัสผ่านใหม่ไม่สำเร็จ ลิงก์อาจหมดอายุ กรุณาขอลิงก์ใหม่')
        return
      }
      setDone(true)
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 1500)
    } catch {
      setError('ตั้งรหัสผ่านใหม่ไม่สำเร็จ กรุณาลองอีกครั้ง')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 size-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 size-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      <Card className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-lg relative z-10">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-primary/10 border-2 border-amber-400 shadow-xs">
            <BookMarked className="size-7 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            ตั้งรหัสผ่านใหม่
          </CardTitle>
          <CardDescription className="text-xs leading-relaxed text-muted-foreground mt-1">
            กำหนดรหัสผ่านใหม่อย่างน้อย 6 ตัวอักษร
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {done ? (
            <div className="space-y-4 text-center">
              <CheckCircle2 className="mx-auto size-10 text-emerald-600" />
              <p className="text-sm font-medium text-foreground">
                ตั้งรหัสผ่านใหม่เรียบร้อย กำลังพาไปหน้าหลัก...
              </p>
              <Link
                href="/"
                className={cn(buttonVariants({ variant: "outline" }), "w-full h-11 rounded-xl text-sm")}
              >
                ไปหน้าหลักทันที
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="reset-password">รหัสผ่านใหม่</Label>
                <Input
                  id="reset-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-11 rounded-xl text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="reset-confirm">ยืนยันรหัสผ่านใหม่</Label>
                <Input
                  id="reset-confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
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
                    กำลังบันทึก...
                  </>
                ) : (
                  'บันทึกรหัสผ่านใหม่'
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
