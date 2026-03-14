import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // Simple email-based guard for MVP
    if (user.email !== process.env.ADMIN_EMAIL) {
        redirect('/dashboard')
    }

    const { data: tenancies } = await supabase
        .from('tenancies')
        .select(`
            id,
            created_at,
            status,
            deposit_amount,
            tds_scheme,
            profiles ( email, full_name ),
            properties ( address_line_1, city, postcode ),
            offers ( id, advance_amount, status, signed_at, expires_at ),
            audits ( id, created_at, risk_score, status )
        `)
        .order('created_at', { ascending: false })

    // Compute overview metrics
    const totalCases = tenancies?.length ?? 0
    const statusCounts: Record<string, number> = {}
    tenancies?.forEach((t) => {
        const s = (t as any).status ?? 'unknown'
        statusCounts[s] = (statusCounts[s] ?? 0) + 1
    })

    // Cases awaiting assessment (video_submitted status)
    const awaitingAssessment = tenancies?.filter(
        (t) => (t as any).status === 'video_submitted'
    ) ?? []

    const metricCards: { label: string; value: number; color: string }[] = [
        { label: 'Total Cases', value: totalCases, color: '#1A2332' },
        { label: 'Registered', value: statusCounts['registered'] ?? 0, color: '#028090' },
        { label: 'Video Submitted', value: statusCounts['video_submitted'] ?? 0, color: '#d97706' },
        { label: 'Under Assessment', value: statusCounts['under_assessment'] ?? 0, color: '#028090' },
        { label: 'Repairs Booked', value: statusCounts['repairs_booked'] ?? 0, color: '#7c3aed' },
        { label: 'Resolved', value: statusCounts['resolved'] ?? 0, color: '#02C39A' },
    ]

    return (
        <div className="min-h-screen" style={{ background: '#f1f5f9' }}>
            {/* Header */}
            <div style={{ background: '#1A2332' }} className="px-4 py-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold text-white">DepositGuard V3 — Assessor Dashboard</h1>
                    <p className="text-sm mt-1" style={{ color: '#02C39A' }}>
                        Logged in as {user.email}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
                {/* Overview Metrics */}
                <section>
                    <h2 className="text-lg font-semibold mb-4" style={{ color: '#1A2332' }}>
                        Overview
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {metricCards.map((m) => (
                            <div
                                key={m.label}
                                className="rounded-xl bg-white shadow-sm border border-slate-200 p-4 text-center"
                            >
                                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">{m.label}</p>
                                <p className="text-3xl font-bold" style={{ color: m.color }}>
                                    {m.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Assessment Queue */}
                <section>
                    <h2 className="text-lg font-semibold mb-1" style={{ color: '#1A2332' }}>
                        Assessment Queue
                    </h2>
                    <p className="text-sm text-slate-500 mb-4">
                        {awaitingAssessment.length} case{awaitingAssessment.length !== 1 ? 's' : ''} awaiting video assessment
                    </p>

                    {awaitingAssessment.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {awaitingAssessment.map((t) => {
                                const profile = t.profiles as any
                                const property = t.properties as any
                                const address = property
                                    ? `${property.address_line_1}, ${property.city}, ${property.postcode}`
                                    : 'No address'
                                return (
                                    <div
                                        key={t.id}
                                        className="rounded-xl bg-white shadow-sm border border-slate-200 p-5 flex flex-col justify-between"
                                    >
                                        <div>
                                            <p className="font-semibold text-sm" style={{ color: '#1A2332' }}>
                                                {address}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {profile?.email ?? 'No email'}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Submitted {new Date(t.created_at).toLocaleDateString('en-GB', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <Link
                                            href={`/admin/case/${t.id}`}
                                            className="inline-block mt-4 text-center text-sm font-semibold rounded-lg px-4 py-2 text-white"
                                            style={{ background: '#028090' }}
                                        >
                                            Review
                                        </Link>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-12 text-center">
                            <p className="text-slate-400">No cases awaiting assessment.</p>
                        </div>
                    )}
                </section>

                {/* All Applications Table */}
                <section>
                    <h2 className="text-lg font-semibold mb-4" style={{ color: '#1A2332' }}>
                        All Applications
                    </h2>
                    <div className="overflow-x-auto rounded-2xl border shadow-sm bg-white">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-xs tracking-wide uppercase" style={{ background: '#1A2332', color: '#94a3b8' }}>
                                    <th className="text-left px-5 py-3">Applicant</th>
                                    <th className="text-left px-5 py-3">Property</th>
                                    <th className="text-right px-5 py-3">Deposit</th>
                                    <th className="text-right px-5 py-3">Advance</th>
                                    <th className="text-left px-5 py-3">Case Status</th>
                                    <th className="text-left px-5 py-3">Offer Status</th>
                                    <th className="text-left px-5 py-3">Signed At</th>
                                    <th className="text-left px-5 py-3">Applied</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tenancies?.map((t) => {
                                    const offer = (t.offers as any[])?.[0]
                                    const profile = t.profiles as any
                                    const property = t.properties as any
                                    const offerStatus = offer?.status ?? 'no offer'
                                    const caseStatus = (t as any).status ?? 'unknown'

                                    const offerStatusColor: Record<string, string> = {
                                        pending: 'bg-yellow-100 text-yellow-700',
                                        accepted: 'bg-green-100 text-green-700',
                                        expired: 'bg-red-100 text-red-700',
                                        'no offer': 'bg-slate-100 text-slate-500',
                                    }

                                    const caseStatusColor: Record<string, string> = {
                                        registered: 'border-[#028090] text-[#028090] bg-[#028090]/10',
                                        video_submitted: 'border-amber-500 text-amber-700 bg-amber-50',
                                        under_assessment: 'border-[#028090] text-[#028090] bg-[#028090]/10',
                                        assessment_complete: 'border-violet-500 text-violet-700 bg-violet-50',
                                        repairs_booked: 'border-purple-500 text-purple-700 bg-purple-50',
                                        repairs_complete: 'border-[#02C39A] text-[#02C39A] bg-[#02C39A]/10',
                                        resolved: 'border-emerald-500 text-emerald-700 bg-emerald-50',
                                        unknown: 'border-slate-300 text-slate-500 bg-slate-50',
                                    }

                                    return (
                                        <tr key={t.id} className="hover:bg-slate-50 transition">
                                            <td className="px-5 py-3">
                                                <p className="font-medium text-slate-900">{profile?.full_name ?? '—'}</p>
                                                <p className="text-slate-400 text-xs">{profile?.email ?? '—'}</p>
                                            </td>
                                            <td className="px-5 py-3 text-slate-600">
                                                {property ? `${property.address_line_1}, ${property.city}` : '—'}
                                            </td>
                                            <td className="px-5 py-3 text-right font-medium text-slate-800">
                                                £{t.deposit_amount?.toLocaleString() ?? '—'}
                                            </td>
                                            <td className="px-5 py-3 text-right font-medium" style={{ color: '#028090' }}>
                                                {offer?.advance_amount ? `£${offer.advance_amount.toLocaleString()}` : '—'}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${caseStatusColor[caseStatus] ?? caseStatusColor['unknown']}`}>
                                                    {caseStatus.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${offerStatusColor[offerStatus] ?? 'bg-slate-100 text-slate-500'}`}>
                                                    {offerStatus}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-slate-500 text-xs">
                                                {offer?.signed_at ? new Date(offer.signed_at).toLocaleString('en-GB') : '—'}
                                            </td>
                                            <td className="px-5 py-3 text-slate-500 text-xs">
                                                {new Date(t.created_at).toLocaleDateString('en-GB')}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        {(!tenancies || tenancies.length === 0) && (
                            <p className="text-center py-12 text-slate-400">No applications yet.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    )
}
