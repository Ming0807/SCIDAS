'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookMarked, Loader2, ShieldCheck } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'

import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function mapAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) {
    return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง'
  }
  if (/email not confirmed/i.test(message)) {
    return 'อีเมลนี้ยังไม่ได้ยืนยัน กรุณาตรวจสอบกล่องจดหมาย'
  }
  if (/too many requests/i.test(message)) {
    return 'พยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่'
  }
  return 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง'
}

export default function LoginPage() {
  const router = useRouter()
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    try {
      setError(null)
      setIsGoogleLoading(true)
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/`,
        },
      })
    } catch {
      setIsGoogleLoading(false)
      setError('เข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองอีกครั้ง')
    }
  }

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน')
      return
    }
    setError(null)
    setIsEmailLoading(true)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      })
      if (signInError) {
        setError(mapAuthError(signInError.message))
        return
      }
      router.push('/')
      router.refresh()
    } catch {
      setError('เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง')
    } finally {
      setIsEmailLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Subtle ambient background aura */}
      <div aria-hidden="true" className="absolute -top-40 -left-40 size-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div aria-hidden="true" className="absolute -bottom-40 -right-40 size-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      <Card className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-lg relative z-10">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-primary/10 border-2 border-amber-400 shadow-xs">
            <BookMarked className="size-7 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            SCIDAS
          </CardTitle>
          <CardDescription className="text-xs leading-relaxed text-muted-foreground mt-1">
            ระบบวิเคราะห์และดูแลช่วยเหลือนักเรียนรายบุคคล
            <br />
            สำหรับโรงเรียนขนาดเล็ก
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="login-email">อีเมล</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="teacher@school.ac.th"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isEmailLoading}
                className="h-11 rounded-xl text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">รหัสผ่าน</Label>
                <Link
                  href="/login/forgot"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="กรอกรหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isEmailLoading}
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
              disabled={isEmailLoading || isGoogleLoading}
            >
              {isEmailLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </Button>
          </form>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span>หรือ</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            variant="outline"
            className="w-full h-11 flex items-center justify-center gap-2.5 rounded-xl border-border hover:bg-muted/50 font-medium text-sm transition-all"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isEmailLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FcGoogle className="size-5" />
            )}
            {isGoogleLoading ? "กำลังนำไปยัง Google..." : "เข้าสู่ระบบด้วย Google"}
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-micro text-muted-foreground pt-2">
            <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>คุ้มครองข้อมูลส่วนบุคคลตามมาตรฐาน PDPA</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
