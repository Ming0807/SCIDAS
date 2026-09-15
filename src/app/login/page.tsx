'use client'

import { useState } from 'react'
import { BookMarked, Loader2, ShieldCheck } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'

import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/`,
        },
      })
    } catch {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Subtle ambient background aura */}
      <div className="absolute -top-40 -left-40 size-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 size-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

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
          <Button 
            variant="outline" 
            className="w-full h-11 flex items-center justify-center gap-2.5 rounded-xl border-border hover:bg-muted/50 font-medium text-sm transition-all" 
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FcGoogle className="size-5" />
            )}
            {isLoading ? "กำลังนำไปยัง Google..." : "เข้าสู่ระบบด้วย Google"}
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
