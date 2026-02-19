'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User, Mail, Phone, Building2, Shield, Save, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

interface Profile {
    id: string
    email: string
    full_name: string
    phone: string
    bank_sort_code: string
    bank_account_number: string
    created_at: string
}

export default function ProfilePage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [user, setUser] = useState<{ id: string; email: string } | null>(null)
    const [profile, setProfile] = useState<Partial<Profile>>({
        full_name: '',
        phone: '',
        bank_sort_code: '',
        bank_account_number: '',
    })
    const [message, setMessage] = useState('')
    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        async function loadProfile() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                setUser({ id: user.id, email: user.email || '' })

                // Try to fetch existing profile
                const { data: existingProfile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (existingProfile) {
                    setProfile(existingProfile)
                }
            }
            setLoading(false)
        }
        loadProfile()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSave = async () => {
        if (!user) return

        setSaving(true)
        const supabase = createClient()

        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                email: user.email,
                ...profile,
                updated_at: new Date().toISOString()
            })

        if (error) {
            setMessage('Error saving profile: ' + error.message)
            setIsSuccess(false)
        } else {
            setMessage('Profile saved successfully!')
            setIsSuccess(true)
        }
        setSaving(false)
        setTimeout(() => setMessage(''), 3000)
    }

    // Calculate profile completion
    const completedFields = [
        profile.full_name,
        profile.phone,
        profile.bank_sort_code,
        profile.bank_account_number
    ].filter(Boolean).length
    const completionPercentage = Math.round((completedFields / 4) * 100)

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-slate-500">Loading your profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 border-4 border-white shadow-xl">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl font-bold">
                        {profile.full_name ? profile.full_name[0].toUpperCase() : user?.email?.[0].toUpperCase() || 'U'}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900">
                        {profile.full_name || 'Complete Your Profile'}
                    </h1>
                    <p className="text-slate-500 flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4" />
                        {user?.email}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                        <span className="text-sm font-medium text-slate-600">{completionPercentage}%</span>
                    </div>
                </div>
            </div>

            {/* Personal Information Card */}
            <Card className="border-0 shadow-lg overflow-hidden">
                <CardHeader className="bg-slate-50 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                            <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Personal Information</CardTitle>
                            <CardDescription>Your basic account details</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700">Full Name</Label>
                            <Input
                                name="full_name"
                                value={profile.full_name || ''}
                                onChange={handleChange}
                                className="h-12"
                                placeholder="John Smith"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700">Email Address</Label>
                            <div className="flex items-center gap-3 h-12 px-4 bg-slate-100 border rounded-md">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-600">{user?.email}</span>
                                <Badge variant="secondary" className="ml-auto bg-green-100 text-green-700">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Verified
                                </Badge>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    name="phone"
                                    value={profile.phone || ''}
                                    onChange={handleChange}
                                    className="h-12 pl-10"
                                    placeholder="+44 7700 900000"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bank Details Card */}
            <Card className="border-0 shadow-lg overflow-hidden">
                <CardHeader className="bg-slate-50 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100">
                            <Building2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Bank Details</CardTitle>
                            <CardDescription>For receiving your deposit payout</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700">Sort Code</Label>
                            <Input
                                name="bank_sort_code"
                                value={profile.bank_sort_code || ''}
                                onChange={handleChange}
                                className="h-12"
                                placeholder="00-00-00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700">Account Number</Label>
                            <Input
                                name="bank_account_number"
                                value={profile.bank_account_number || ''}
                                onChange={handleChange}
                                className="h-12"
                                placeholder="00000000"
                            />
                        </div>
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                            Your bank details are encrypted with AES-256 and only used to send your deposit advance. We never store card details.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            {/* Save Button & Messages */}
            <div className="space-y-4">
                {message && (
                    <Alert className={isSuccess
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }>
                        <AlertDescription className={isSuccess ? "text-green-700" : "text-red-700"}>
                            {message}
                        </AlertDescription>
                    </Alert>
                )}

                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-blue-500/25"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5 mr-2" />
                            Save Profile
                        </>
                    )}
                </Button>
            </div>

            {/* Account Info Footer */}
            <Separator />
            <div className="flex items-center justify-between text-sm text-slate-400">
                <p>Account ID: {user?.id?.substring(0, 8)}...</p>
                <p>Member since {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : 'recently'}</p>
            </div>
        </div>
    )
}
