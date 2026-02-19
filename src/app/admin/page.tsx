import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

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
            deposit_amount,
            tds_scheme,
            profiles ( email, full_name ),
            properties ( address_line_1, city, postcode ),
            offers ( id, advance_amount, status, signed_at, expires_at )
        `)
        .order('created_at', { ascending: false })

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Admin — All Applications</h1>
            <p className="text-slate-500 mb-8 text-sm">{tenancies?.length ?? 0} total applications</p>

            <div className="overflow-x-auto rounded-2xl border shadow-sm bg-white">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-slate-50 text-slate-500 uppercase text-xs tracking-wide">
                            <th className="text-left px-5 py-3">Applicant</th>
                            <th className="text-left px-5 py-3">Property</th>
                            <th className="text-right px-5 py-3">Deposit</th>
                            <th className="text-right px-5 py-3">Advance</th>
                            <th className="text-left px-5 py-3">Status</th>
                            <th className="text-left px-5 py-3">Signed At</th>
                            <th className="text-left px-5 py-3">Applied</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {tenancies?.map((t) => {
                            const offer = (t.offers as any[])?.[0]
                            const profile = t.profiles as any
                            const property = t.properties as any
                            const status = offer?.status ?? 'no offer'
                            const statusColor: Record<string, string> = {
                                pending: 'bg-yellow-100 text-yellow-700',
                                accepted: 'bg-green-100 text-green-700',
                                expired: 'bg-red-100 text-red-700',
                                'no offer': 'bg-slate-100 text-slate-500',
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
                                    <td className="px-5 py-3 text-right font-medium text-blue-700">
                                        {offer?.advance_amount ? `£${offer.advance_amount.toLocaleString()}` : '—'}
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor[status] ?? 'bg-slate-100 text-slate-500'}`}>
                                            {status}
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
        </div>
    )
}
