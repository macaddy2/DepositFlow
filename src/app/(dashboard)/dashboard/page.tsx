import Link from 'next/link'
import { Plus, ArrowRight, Building2, ShieldCheck, TrendingUp } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CASE_STATUSES, getStatusIndex, getStatusInfo, getNextAction } from '@/lib/case-states'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: tenancies } = await supabase
        .from('tenancies')
        .select(`
            *,
            offers (*),
            properties (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const allCases = tenancies || []
    const casesInProgress = allCases.filter(t => {
        const info = getStatusInfo(t.status)
        return info.id !== 'resolved'
    })
    const completedCases = allCases.filter(t => {
        const info = getStatusInfo(t.status)
        return info.id === 'resolved'
    })
    const totalDepositValue = allCases.reduce((sum, t) => {
        return sum + (t.deposit_amount || 0)
    }, 0)

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold" style={{ color: '#1A2332' }}>
                        Welcome back
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Track your deposit protection cases and next steps.
                    </p>
                </div>
                <Link
                    href="/onboarding"
                    className="bg-[#028090] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#026d7a] transition flex items-center gap-2 shadow-lg shadow-[#028090]/25"
                >
                    <Plus className="w-5 h-5" />
                    New Case
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="pt-0">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-[#028090]/10 rounded-xl text-[#028090]">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <span className="text-slate-500 font-medium">Cases in Progress</span>
                        </div>
                        <p className="text-3xl font-bold" style={{ color: '#1A2332' }}>
                            {casesInProgress.length}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-0">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-[#02C39A]/10 rounded-xl text-[#02C39A]">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <span className="text-slate-500 font-medium">Completed Cases</span>
                        </div>
                        <p className="text-3xl font-bold" style={{ color: '#1A2332' }}>
                            {completedCases.length}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-0">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-[#028090]/10 rounded-xl text-[#028090]">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <span className="text-slate-500 font-medium">Total Deposit Value Protected</span>
                        </div>
                        <p className="text-3xl font-bold" style={{ color: '#1A2332' }}>
                            &pound;{totalDepositValue.toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Case Cards */}
            {allCases.length === 0 ? (
                <Card>
                    <CardContent>
                        <div className="py-12 text-center text-slate-500">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Building2 className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-lg font-medium mb-2">No cases yet</p>
                            <p className="mb-4">
                                Start a new case to protect your deposit and track the resolution process.
                            </p>
                            <Link
                                href="/onboarding"
                                className="inline-flex items-center gap-2 bg-[#028090] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#026d7a] transition shadow-lg shadow-[#028090]/25"
                            >
                                <Plus className="w-5 h-5" />
                                Start Your First Case
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                allCases.map((tenancy) => {
                    const property = tenancy.properties
                    const statusInfo = getStatusInfo(tenancy.status)
                    const currentIndex = getStatusIndex(tenancy.status)
                    const nextAction = getNextAction(tenancy.status)
                    const StatusIcon = statusInfo.icon
                    const address = property
                        ? `${property.address_line_1}, ${property.postcode}`
                        : 'Unknown Property'

                    return (
                        <Card key={tenancy.id}>
                            <CardHeader className="border-b pb-4">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{address}</CardTitle>
                                            <p className="text-sm text-slate-500 mt-0.5">
                                                Case opened {new Date(tenancy.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge
                                            className={`${statusInfo.bgColor} ${statusInfo.color} border-0`}
                                        >
                                            <StatusIcon className="w-3 h-3" />
                                            {statusInfo.label}
                                        </Badge>
                                        {nextAction && (
                                            <Link
                                                href={nextAction.href}
                                                className="inline-flex items-center gap-1.5 bg-[#028090] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#026d7a] transition"
                                            >
                                                {nextAction.label}
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            {/* Progress Tracker */}
                            <CardContent>
                                <div className="relative flex items-start justify-between">
                                    {/* Connector line */}
                                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200" />
                                    <div
                                        className="absolute top-5 left-0 h-0.5 bg-[#02C39A] transition-all"
                                        style={{
                                            width: currentIndex >= CASE_STATUSES.length - 1
                                                ? '100%'
                                                : `${(currentIndex / (CASE_STATUSES.length - 1)) * 100}%`,
                                        }}
                                    />

                                    {CASE_STATUSES.map((stage, index) => {
                                        const StageIcon = stage.icon
                                        const isCompleted = index < currentIndex
                                        const isCurrent = index === currentIndex
                                        const isFuture = index > currentIndex

                                        return (
                                            <div
                                                key={stage.id}
                                                className="relative flex flex-col items-center text-center z-10"
                                                style={{ width: `${100 / CASE_STATUSES.length}%` }}
                                            >
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                                        isCompleted
                                                            ? 'bg-[#02C39A] border-[#02C39A] text-white'
                                                            : isCurrent
                                                                ? 'bg-white border-[#028090] text-[#028090] ring-4 ring-[#028090]/20'
                                                                : 'bg-white border-slate-200 text-slate-400'
                                                    }`}
                                                >
                                                    <StageIcon className="w-4 h-4" />
                                                </div>
                                                <span
                                                    className={`mt-2 text-xs font-medium leading-tight max-w-[80px] ${
                                                        isCurrent
                                                            ? 'text-[#028090] font-semibold'
                                                            : isCompleted
                                                                ? 'text-[#02C39A]'
                                                                : 'text-slate-400'
                                                    }`}
                                                >
                                                    {stage.label}
                                                </span>
                                                {isCurrent && (
                                                    <span className="mt-1 text-[10px] text-slate-500 max-w-[90px] leading-tight">
                                                        {stage.description}
                                                    </span>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })
            )}
        </div>
    )
}
