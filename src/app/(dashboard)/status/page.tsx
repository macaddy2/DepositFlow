import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { CASE_STATUSES, getStatusInfo, getStatusIndex } from '@/lib/case-states'
import { CheckCircle2, Home, PoundSterling, Calendar, MapPin } from 'lucide-react'

export default async function StatusPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let tenancy: any = null
    let currentStatusIndex = 0
    let currentStatus: (typeof CASE_STATUSES)[number] = CASE_STATUSES[0]

    if (user) {
        const { data } = await supabase
            .from('tenancies')
            .select('*, offers(*), properties(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        tenancy = data

        if (tenancy?.status) {
            currentStatusIndex = getStatusIndex(tenancy.status)
            currentStatus = getStatusInfo(tenancy.status)
        }
    }

    const property = tenancy?.properties as any
    const offer = (tenancy?.offers as any[])?.[0]
    const propertyAddress = property
        ? `${property.address_line_1}, ${property.city}`
        : null

    return (
        <div className="max-w-2xl mx-auto space-y-8 py-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Case Status</h1>
                <p className="text-slate-500 mt-1">Track your deposit protection journey</p>
            </div>

            {/* Current Status Card */}
            <div className="bg-gradient-to-br from-[#028090]/5 to-[#02C39A]/5 rounded-2xl p-6 border border-[#028090]/10">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${currentStatus.bgColor} rounded-full flex items-center justify-center`}>
                        <currentStatus.icon className={`w-6 h-6 ${currentStatus.color}`} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-slate-500 font-medium">Current Status</p>
                        <p className="text-xl font-bold text-slate-900">{currentStatus.label}</p>
                        <p className="text-sm text-slate-600 mt-0.5">{currentStatus.description}</p>
                    </div>
                </div>
            </div>

            {/* Key Info */}
            {tenancy && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {propertyAddress && (
                        <div className="bg-white rounded-xl border p-4 flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-[#028090] mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs text-slate-400 font-medium">Property</p>
                                <p className="text-sm font-semibold text-slate-900">{propertyAddress}</p>
                            </div>
                        </div>
                    )}
                    {tenancy.deposit_amount && (
                        <div className="bg-white rounded-xl border p-4 flex items-start gap-3">
                            <PoundSterling className="w-5 h-5 text-[#028090] mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs text-slate-400 font-medium">Deposit</p>
                                <p className="text-sm font-semibold text-slate-900">
                                    &pound;{Number(tenancy.deposit_amount).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    )}
                    {tenancy.created_at && (
                        <div className="bg-white rounded-xl border p-4 flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-[#028090] mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs text-slate-400 font-medium">Started</p>
                                <p className="text-sm font-semibold text-slate-900">
                                    {new Date(tenancy.created_at).toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-lg border p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Case Timeline</h2>

                <div className="space-y-0">
                    {CASE_STATUSES.map((status, index) => {
                        const isCompleted = index < currentStatusIndex
                        const isCurrent = index === currentStatusIndex
                        const isFuture = index > currentStatusIndex
                        const isLast = index === CASE_STATUSES.length - 1
                        const StatusIcon = status.icon

                        return (
                            <div key={status.id} className="flex gap-4">
                                {/* Icon and connector line */}
                                <div className="relative flex flex-col items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                            isCompleted
                                                ? 'bg-[#02C39A] text-white'
                                                : isCurrent
                                                  ? `${status.bgColor} ring-2 ring-[#028090] ring-offset-2`
                                                  : 'bg-slate-100 text-slate-300'
                                        }`}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle2 className="w-5 h-5" />
                                        ) : (
                                            <StatusIcon
                                                className={`w-5 h-5 ${
                                                    isCurrent ? status.color : 'text-slate-300'
                                                }`}
                                            />
                                        )}
                                    </div>
                                    {!isLast && (
                                        <div
                                            className={`w-0.5 h-12 ${
                                                isCompleted ? 'bg-[#02C39A]' : 'bg-slate-200'
                                            }`}
                                        />
                                    )}
                                </div>

                                {/* Label and description */}
                                <div className="pt-2 pb-6">
                                    <p
                                        className={`font-semibold ${
                                            isFuture ? 'text-slate-300' : 'text-slate-900'
                                        }`}
                                    >
                                        {status.label}
                                    </p>
                                    <p
                                        className={`text-sm mt-0.5 ${
                                            isFuture ? 'text-slate-300' : 'text-slate-500'
                                        }`}
                                    >
                                        {status.description}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Help Section */}
            <div className="bg-slate-50 rounded-xl p-6 text-center">
                <p className="text-slate-600 text-sm">
                    Questions about your case? Contact us at{' '}
                    <a href="mailto:support@depositguard.co.uk" className="text-[#028090] hover:underline">
                        support@depositguard.co.uk
                    </a>
                </p>
            </div>

            {/* CTA */}
            <div className="text-center">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition"
                >
                    <Home className="w-5 h-5" />
                    Back to Dashboard
                </Link>
            </div>
        </div>
    )
}
