import Link from 'next/link'
import {
    Shield,
    ShieldCheck,
    ShieldAlert,
    AlertTriangle,
    ClipboardList,
    Clock,
    PoundSterling,
    Wrench,
    ChevronRight,
    Home,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

type RiskLevel = 'green' | 'amber' | 'red'

interface AssessmentItem {
    id: string
    room_type: string
    item_name: string
    description: string
    risk_level: RiskLevel
    estimated_deduction: number
    recommended_action: string | null
}

const riskConfig: Record<RiskLevel, { label: string; bgClass: string; textClass: string; dotClass: string; borderClass: string }> = {
    green: {
        label: 'No Risk',
        bgClass: 'bg-emerald-50',
        textClass: 'text-emerald-700',
        dotClass: 'bg-emerald-500',
        borderClass: 'border-emerald-200',
    },
    amber: {
        label: 'Recommend Repair',
        bgClass: 'bg-amber-50',
        textClass: 'text-amber-700',
        dotClass: 'bg-amber-500',
        borderClass: 'border-amber-200',
    },
    red: {
        label: 'Likely Deduction',
        bgClass: 'bg-red-50',
        textClass: 'text-red-700',
        dotClass: 'bg-red-500',
        borderClass: 'border-red-200',
    },
}

function RiskBadge({ level }: { level: RiskLevel }) {
    const config = riskConfig[level]
    return (
        <Badge className={`${config.bgClass} ${config.textClass} border ${config.borderClass} hover:${config.bgClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
            {config.label}
        </Badge>
    )
}

function groupByRoom(items: AssessmentItem[]): Record<string, AssessmentItem[]> {
    return items.reduce((acc, item) => {
        const room = item.room_type || 'General'

        if (!acc[room]) acc[room] = []
        acc[room].push(item)
        return acc
    }, {} as Record<string, AssessmentItem[]>)
}

export default async function AssessmentPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Attempt to fetch the user's latest tenancy → audit → assessment_items
    let assessmentItems: AssessmentItem[] = []
    let fetchError = false

    try {
        // Get the latest tenancy for the user
        const { data: tenancy } = await supabase
            .from('tenancies')
            .select('id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (tenancy) {
            // Get the latest audit for the tenancy
            const { data: audit } = await supabase
                .from('audits')
                .select('id')
                .eq('tenancy_id', tenancy.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (audit) {
                // Fetch assessment items for this audit
                const { data, error } = await supabase
                    .from('assessment_items')
                    .select('id, room_type, item_name, description, risk_level, estimated_deduction, recommended_action')
                    .eq('audit_id', audit.id)
                    .order('room', { ascending: true })

                if (error) {
                    // Table may not exist yet — gracefully handle
                    fetchError = true
                } else {
                    assessmentItems = (data as AssessmentItem[]) || []
                }
            }
        }
    } catch {
        // Gracefully handle any unexpected errors (e.g. table doesn't exist)
        fetchError = true
    }

    const hasData = !fetchError && assessmentItems.length > 0

    // Compute summary stats
    const greenCount = assessmentItems.filter(i => i.risk_level === 'green').length
    const amberCount = assessmentItems.filter(i => i.risk_level === 'amber').length
    const redCount = assessmentItems.filter(i => i.risk_level === 'red').length
    const totalDeductionRisk = assessmentItems
        .filter(i => i.risk_level === 'amber' || i.risk_level === 'red')
        .reduce((sum, i) => sum + (i.estimated_deduction || 0), 0)
    const hasActionableItems = amberCount > 0 || redCount > 0

    const roomGroups = groupByRoom(assessmentItems)

    // --- Pending State ---
    if (!hasData) {
        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#1A2332]">Risk Assessment</h1>
                    <p className="text-slate-500 mt-2">Your deposit protection report</p>
                </div>

                <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                    <CardContent className="flex flex-col items-center text-center py-16">
                        <div className="w-20 h-20 bg-[#028090]/10 rounded-full flex items-center justify-center mb-6">
                            <Clock className="w-10 h-10 text-[#028090]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#1A2332] mb-3">Assessment Pending</h2>
                        <p className="text-slate-500 max-w-md mb-2">
                            Your property risk assessment is being prepared. Once your property audit is complete,
                            we&apos;ll analyse the condition of each room and provide a detailed report on potential
                            deposit deductions.
                        </p>
                        <p className="text-slate-400 text-sm max-w-md mb-8">
                            This usually takes 1-2 business days after your audit is scheduled.
                            We&apos;ll notify you by email when your report is ready.
                        </p>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 text-[#028090] font-semibold hover:underline"
                        >
                            Back to Dashboard
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // --- Full Report ---
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <Shield className="w-8 h-8 text-[#028090]" />
                    <h1 className="text-3xl font-bold text-[#1A2332]">Risk Assessment Report</h1>
                </div>
                <p className="text-slate-500 mt-1">
                    A room-by-room breakdown of your deposit risk based on the property audit.
                </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-emerald-100 rounded-xl">
                            <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        </div>
                        <span className="text-slate-500 text-sm font-medium">No Risk</span>
                    </div>
                    <p className="text-2xl font-bold text-[#1A2332]">{greenCount}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-amber-100 rounded-xl">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <span className="text-slate-500 text-sm font-medium">Recommend Repair</span>
                    </div>
                    <p className="text-2xl font-bold text-[#1A2332]">{amberCount}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-red-100 rounded-xl">
                            <ShieldAlert className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="text-slate-500 text-sm font-medium">Likely Deduction</span>
                    </div>
                    <p className="text-2xl font-bold text-[#1A2332]">{redCount}</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-[#028090]/10 rounded-xl">
                            <PoundSterling className="w-5 h-5 text-[#028090]" />
                        </div>
                        <span className="text-slate-500 text-sm font-medium">Est. Deduction Risk</span>
                    </div>
                    <p className="text-2xl font-bold text-[#1A2332]">
                        £{totalDeductionRisk.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Alert for actionable items */}
            {hasActionableItems && (
                <Alert className="border-amber-200 bg-amber-50">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                        <strong>{amberCount + redCount} item{amberCount + redCount !== 1 ? 's' : ''}</strong> may
                        result in deposit deductions totalling up to{' '}
                        <strong>£{totalDeductionRisk.toLocaleString()}</strong>. Booking repairs before your
                        check-out can help you recover more of your deposit.
                    </AlertDescription>
                </Alert>
            )}

            {/* Room-by-Room Breakdown */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-[#1A2332] flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-[#028090]" />
                    Room-by-Room Breakdown
                </h2>

                {Object.entries(roomGroups).map(([room, items]) => (
                    <Card key={room} className="overflow-hidden">
                        <div className="bg-[#1A2332] px-6 py-4 flex items-center gap-3">
                            <Home className="w-5 h-5 text-[#02C39A]" />
                            <h3 className="text-white font-semibold text-lg">{room}</h3>
                            <span className="text-slate-400 text-sm ml-auto">
                                {items.length} item{items.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <CardContent className="divide-y p-0">
                            {items.map((item) => {
                                const config = riskConfig[item.risk_level]
                                return (
                                    <div
                                        key={item.id}
                                        className={`p-5 flex flex-col sm:flex-row sm:items-start gap-4 ${config.bgClass}/30`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1.5">
                                                <span className="font-semibold text-[#1A2332]">{item.item_name}</span>
                                                <RiskBadge level={item.risk_level} />
                                            </div>
                                            <p className="text-sm text-slate-600 mb-2">{item.description}</p>
                                            {item.recommended_action && (
                                                <div className="flex items-start gap-2 text-sm text-slate-500">
                                                    <Wrench className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#028090]" />
                                                    <span>{item.recommended_action}</span>
                                                </div>
                                            )}
                                        </div>
                                        {(item.risk_level === 'amber' || item.risk_level === 'red') && (
                                            <div className="sm:text-right shrink-0">
                                                <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Est. Deduction</p>
                                                <p className={`text-lg font-bold ${config.textClass}`}>
                                                    £{(item.estimated_deduction || 0).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Book Repairs CTA */}
            {hasActionableItems && (
                <Card className="bg-gradient-to-r from-[#028090] to-[#02C39A] border-0 shadow-lg shadow-[#028090]/25">
                    <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-6 py-8">
                        <div className="text-white">
                            <h3 className="text-xl font-bold mb-1">Protect Your Deposit</h3>
                            <p className="text-white/80 text-sm max-w-md">
                                Book professional repairs for the {amberCount + redCount} flagged
                                item{amberCount + redCount !== 1 ? 's' : ''} and potentially save up
                                to £{totalDeductionRisk.toLocaleString()} in deductions.
                            </p>
                        </div>
                        <Link href="/repairs">
                            <Button
                                className="bg-white text-[#028090] hover:bg-white/90 font-semibold px-8 py-3 rounded-xl shadow-md text-base h-auto"
                            >
                                <Wrench className="w-5 h-5" />
                                Book Repairs
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
