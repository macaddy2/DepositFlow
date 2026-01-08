
'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { Loader2, Mail } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

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
            setMessage('Error: ' + error.message)
        } else {
            setMessage('Check your email for the login link!')
        }
        setLoading(false)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Sign in to DepositFlow</h2>
                    <p className="mt-2 text-sm text-gray-600">Enter your email to receive a magic link</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none rounded-lg relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
                            {loading ? 'Sending Link...' : 'Sign In with Email'}
                        </button>
                    </div>

                    {message && (
                        <div className={`text-sm text-center ${message.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
                            {message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}
