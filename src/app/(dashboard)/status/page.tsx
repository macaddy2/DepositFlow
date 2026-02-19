
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { CheckCircle, Clock, Users, Home, Banknote, PartyPopper, PoundSterling } from 'lucide-react'

export default async function StatusPage({
    searchParams
}: {
    searchParams: Promise<{ signed?: string }>
}) {
    const { signed } = await searchParams
    const justSigned = signed === 'true'

    // Fetch the user's accepted offer for real data
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let advanceAmount: number | null = null
    let propertyAddress: string | null = null

    if (user) {
        const { data: tenancy } = await supabase
            .from('tenancies')
            .select('*, offers(*), properties(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        const offer = (tenancy?.offers as any[])?.[0]
        if (offer?.status === 'accepted') {
            advanceAmount = offer.advance_amount
        }
        const property = tenancy?.properties as any
        if (property) {
            propertyAddress = `${property.address_line_1}, ${property.city}`
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 py-8">
            {/* Success Header */}
            <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
                    {justSigned ? (
                        <PartyPopper className="w-10 h-10 text-white" />
                    ) : (
                        <CheckCircle className="w-10 h-10 text-white" />
                    )}
                </div>
                <h1 className="text-3xl font-bold text-slate-900">
                    {justSigned ? 'Congratulations!' : "You're All Set!"}
                </h1>
                <p className="text-lg text-slate-600 mt-2">
                    {justSigned
                        ? 'Your Deed of Assignment has been signed. Funds are on their way!'
                        : 'Your deposit transfer is in progress.'}
                </p>
            </div>

            {/* Payment Status Card */}
            {advanceAmount !== null && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Banknote className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-slate-900">Payment Processing</p>
                            <p className="text-sm text-slate-600">Funds will arrive within 2 hours during business hours</p>
                            {propertyAddress && (
                                <p className="text-xs text-slate-400 mt-1">{propertyAddress}</p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400 mb-0.5">Advance</p>
                            <p className="text-2xl font-bold text-blue-600">£{advanceAmount.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-lg border p-8">
                <h2 className="text-lg font-bold text-slate-900 mb-6">What happens next</h2>

                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="relative">
                            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-5 h-5" />
                            </div>
                            <div className="absolute top-10 left-1/2 w-0.5 h-12 bg-slate-200 -translate-x-1/2" />
                        </div>
                        <div className="pt-1">
                            <p className="font-semibold text-slate-900">Deed of Assignment Signed</p>
                            <p className="text-sm text-slate-500 mt-1">Your deposit rights have been transferred to DepositFlow</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="relative">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div className="absolute top-10 left-1/2 w-0.5 h-12 bg-slate-200 -translate-x-1/2" />
                        </div>
                        <div className="pt-1">
                            <p className="font-semibold text-slate-900">Landlord Notification</p>
                            <p className="text-sm text-slate-500 mt-1">We will notify your landlord of the assignment and arrange checkout</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="relative">
                            <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5" />
                            </div>
                            <div className="absolute top-10 left-1/2 w-0.5 h-12 bg-slate-200 -translate-x-1/2" />
                        </div>
                        <div className="pt-1">
                            <p className="font-semibold text-slate-900">Strike Team Dispatch</p>
                            <p className="text-sm text-slate-500 mt-1">Our team will contact you to schedule the cleaning and repairs</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div>
                            <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
                                <Home className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="pt-1">
                            <p className="font-semibold text-slate-900">Checkout Complete</p>
                            <p className="text-sm text-slate-500 mt-1">We handle the checkout and recover the deposit from the landlord</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Help Section */}
            <div className="bg-slate-50 rounded-xl p-6 text-center">
                <p className="text-slate-600 text-sm">
                    Questions? Contact us at{' '}
                    <a href="mailto:support@depositflow.co.uk" className="text-blue-600 hover:underline">
                        support@depositflow.co.uk
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
                    Return to Dashboard
                </Link>
            </div>
        </div>
    )
}
