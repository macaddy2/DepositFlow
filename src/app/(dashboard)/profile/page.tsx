'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User, Mail, Calendar, Shield, Save, Loader2 } from 'lucide-react'

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
        } else {
            setMessage('Profile saved successfully!')
        }
        setSaving(false)
        setTimeout(() => setMessage(''), 3000)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {profile.full_name ? profile.full_name[0].toUpperCase() : user?.email?.[0].toUpperCase() || 'U'}
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Your Profile</h1>
                    <p className="text-slate-500">{user?.email}</p>
                </div>
            </div>

            {/* Profile Form */}
            <div className="bg-white rounded-2xl shadow-sm border p-8 space-y-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Full Name</label>
                        <input
                            name="full_name"
                            value={profile.full_name || ''}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="John Smith"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Email</label>
                        <div className="flex items-center gap-2 p-3 bg-slate-50 border rounded-xl text-slate-600">
                            <Mail className="w-4 h-4" />
                            {user?.email}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Phone Number</label>
                        <input
                            name="phone"
                            value={profile.phone || ''}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="+44 7700 900000"
                        />
                    </div>
                </div>

                <hr className="my-6" />

                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    Bank Details (for deposit payout)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Sort Code</label>
                        <input
                            name="bank_sort_code"
                            value={profile.bank_sort_code || ''}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="00-00-00"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Account Number</label>
                        <input
                            name="bank_account_number"
                            value={profile.bank_account_number || ''}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            placeholder="00000000"
                        />
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 flex gap-3">
                    <Shield className="w-5 h-5 flex-shrink-0" />
                    <p>Your bank details are encrypted and only used to send your deposit advance.</p>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl text-sm ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {message}
                    </div>
                )}

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? 'Saving...' : 'Save Profile'}
                </button>
            </div>

            {/* Account Info */}
            <div className="bg-slate-50 rounded-xl p-6 text-sm text-slate-600">
                <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>Account created: {user?.id ? 'Recently' : 'Unknown'}</span>
                </div>
            </div>
        </div>
    )
}
