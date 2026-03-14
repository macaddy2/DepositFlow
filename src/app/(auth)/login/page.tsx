'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { Loader2, Mail, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        const supabase = createClient()
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${location.origin}/auth/callback`,
            },
        })

        if (error) {
            setMessage(error.message)
            setIsSuccess(false)
        } else {
            setMessage('Check your email for the magic link!')
            setIsSuccess(true)
        }
        setLoading(false)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            {/* Ambient glow effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#028090]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#02C39A]/20 rounded-full blur-3xl" />

            <Card className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader className="text-center space-y-4 pb-2">
                    {/* Logo */}
                    <div className="mx-auto flex items-center justify-center gap-2">
                        <div className="relative">
                            <Sparkles className="w-8 h-8 text-[#02C39A]" />
                            <div className="absolute inset-0 blur-sm bg-[#02C39A]/50 rounded-full" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-[#028090] to-[#02C39A] bg-clip-text text-transparent">
                            DepositGuard
                        </span>
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold text-white">Welcome back</CardTitle>
                        <CardDescription className="text-slate-300 mt-2">
                            Enter your email to receive a magic link
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="pt-4">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-200">
                                Email address
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-[#02C39A] focus:ring-[#02C39A]/20"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#028090] hover:bg-[#026d7a] text-white font-semibold py-5 shadow-lg shadow-[#028090]/25 transition-all duration-300 hover:shadow-[#028090]/40 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? 'Sending link...' : 'Sign in with Email'}
                        </Button>

                        {message && (
                            <Alert className={isSuccess
                                ? "bg-green-500/20 border-green-500/30 text-green-300"
                                : "bg-red-500/20 border-red-500/30 text-red-300"
                            }>
                                <AlertDescription>{message}</AlertDescription>
                            </Alert>
                        )}

                        <p className="text-center text-sm text-slate-400">
                            No password needed. We&apos;ll send you a secure link.
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
