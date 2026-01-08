
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PoundSterling, Wrench, Clock, FileSignature, Users, Home, RefreshCw } from 'lucide-react'
import AcceptOfferButton from './AcceptOfferButton'

export default async function OfferPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/login')

    // Fetch latest offer for user
    const { data: tenancy } = await supabase
        .from('tenancies')
        .select('*, offers(*), properties(*)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    const offer = tenancy?.offers?.[0]
    const property = tenancy?.properties

    if (!offer) {
        return (
            <div className="max-w-xl mx-auto text-center py-16">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-8 h-8 text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">No Offer Yet</h2>
                <p className="text-slate-500 mt-2 mb-6">We are still reviewing your application. Check back soon!</p>
                <Link href="/onboarding" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
                    Start New Application
                </Link>
            </div>
        )
    }

    const propertyAddress = property
        ? `${property.address_line_1}, ${property.city}, ${property.postcode}`
        : 'Your Property'

    return (
        <div className="max-w-xl mx-auto space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
                {/* Green Progress Bar */}
                <div className="h-1.5 bg-gradient-to-r from-green-400 to-green-500" />

                <div className="p-8 text-center">
                    {/* Icon */}
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
                        <PoundSterling className="w-8 h-8 text-white" />
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900">Your Instant Offer</h1>
                    <p className="text-green-600 font-medium">Available immediately</p>
                </div>

                {/* Breakdown */}
                <div className="px-8 pb-8 space-y-4">
                    {/* Total Deposit */}
                    <div className="flex justify-between items-center py-3 border-b">
                        <span className="text-slate-600">Total Deposit Value</span>
                        <span className="text-lg font-bold text-slate-900">£{tenancy.deposit_amount}</span>
                    </div>

                    {/* Deductions */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-2 text-slate-500">
                                <Wrench className="w-4 h-4" />
                                Est. Repairs & Cleaning
                            </span>
                            <span className="font-medium text-red-500">-£{offer.estimated_repair_cost}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-2 text-slate-500">
                                <Clock className="w-4 h-4" />
                                Service & Risk Fee
                            </span>
                            <span className="font-medium text-red-500">-£{offer.service_fee}</span>
                        </div>
                    </div>

                    {/* Cash to You */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mt-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <span className="text-slate-600 font-medium">Cash to You Today</span>
                                <p className="text-xs text-green-600 font-medium">No hidden fees</p>
                            </div>
                            <span className="text-4xl font-bold text-blue-600">£{offer.advance_amount}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* What Happens Next */}
            <div className="bg-white rounded-2xl shadow-lg border p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-6">What happens next?</h2>

                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                            1
                        </div>
                        <div>
                            <p className="text-slate-900 font-medium">Sign the digital agreement</p>
                            <p className="text-sm text-slate-500">Transfer your deposit rights via our secure Deed of Assignment</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                            2
                        </div>
                        <div>
                            <p className="text-slate-900 font-medium">We send our team to perform the repairs</p>
                            <p className="text-sm text-slate-500">You don&apos;t lift a finger - our Strike Team handles everything</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                            3
                        </div>
                        <div>
                            <p className="text-slate-900 font-medium">We attend checkout and recover the deposit</p>
                            <p className="text-sm text-slate-500">We deal with the landlord so you don&apos;t have to</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <AcceptOfferButton offerId={offer.id} tenancy={tenancy} advanceAmount={offer.advance_amount} />
                <Link
                    href="/onboarding"
                    className="flex-1 py-4 px-6 rounded-xl border-2 font-semibold text-slate-600 hover:bg-slate-50 transition flex items-center justify-center gap-2"
                >
                    <RefreshCw className="w-5 h-5" />
                    Recalculate
                </Link>
            </div>

            {/* Terms */}
            <p className="text-xs text-center text-slate-400">
                By accepting, you agree to assign your deposit rights to DepositFlow via our Deed of Assignment
            </p>
        </div>
    )
}
