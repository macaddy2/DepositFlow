import Link from 'next/link'
import { Plus, ArrowRight, Clock, CheckCircle2, AlertCircle, Building2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user's tenancies and offers
    const { data: tenancies } = await supabase
        .from('tenancies')
        .select(`
            *,
            offers (*),
            properties (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    const activeApplications = tenancies || []
    const offerCount = activeApplications.filter(t => t.offers?.length > 0).length
    const totalValue = activeApplications.reduce((sum, t) => {
        const offer = t.offers?.[0]
        return sum + (offer?.advance_amount || 0)
    }, 0)

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
                    <p className="text-slate-500 mt-2">Here&apos;s what&apos;s happening with your deposits.</p>
                </div>
                <Link
                    href="/onboarding"
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-500/25"
                >
                    <Plus className="w-5 h-5" />
                    New Application
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <span className="text-slate-500 font-medium">Active Applications</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{activeApplications.length}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-100 rounded-xl text-green-600">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <span className="text-slate-500 font-medium">Offers Received</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{offerCount}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <span className="text-slate-500 font-medium">Total Value</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">£{totalValue.toLocaleString()}</p>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900">Recent Applications</h2>
                    <Link href="#" className="text-blue-600 text-sm font-medium hover:underline">View all</Link>
                </div>

                <div className="divide-y text-start">
                    {activeApplications.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Building2 className="w-8 h-8 text-slate-400" />
                            </div>
                            <p>No applications yet. Start a new one to unlock your deposit!</p>
                            <Link href="/onboarding" className="text-blue-600 font-semibold hover:underline mt-2 inline-block">Start Application</Link>
                        </div>
                    ) : (
                        activeApplications.map((tenancy) => {
                            const property = tenancy.properties
                            const offer = tenancy.offers?.[0]
                            const status = offer?.status === 'accepted' ? 'Completed' : offer ? 'Offer Ready' : 'Processing'

                            return (
                                <div key={tenancy.id} className="p-6 hover:bg-slate-50 transition flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm transition">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">
                                                {property ? `${property.address_line_1}, ${property.postcode}` : 'Unknown Property'}
                                            </h3>
                                            <p className="text-sm text-slate-500 flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                {new Date(tenancy.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status === 'Completed' ? 'bg-green-100 text-green-700' :
                                            status === 'Offer Ready' ? 'bg-blue-100 text-blue-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                            {status}
                                        </span>
                                        <span className="font-bold text-slate-900">
                                            {offer ? `£${offer.advance_amount}` : '—'}
                                        </span>
                                        <Link
                                            href={offer?.status === 'accepted' ? '/status?signed=true' : offer ? '/offer' : '#'}
                                            className="p-2 text-slate-400 hover:text-blue-600 transition"
                                        >
                                            <ArrowRight className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
