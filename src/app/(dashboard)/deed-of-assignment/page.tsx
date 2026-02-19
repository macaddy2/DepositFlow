import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import SignaturePad from './SignaturePad'

export default async function DeedOfAssignmentPage({
    searchParams,
}: {
    searchParams: Promise<{ offerId?: string }>
}) {
    const { offerId } = await searchParams

    if (!offerId) {
        redirect('/dashboard')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch offer details securely
    const { data: offer, error } = await supabase
        .from('offers')
        .select(`
            *,
            tenancies(
                *,
                properties(*)
            )
        `)
        .eq('id', offerId)
        .single()

    // Check ownership
    if (error || !offer || offer.tenancies?.user_id !== user.id) {
        redirect('/dashboard')
    }

    // Calculate derived values for the UI
    const property = offer.tenancies?.properties
    const propertyAddress = property
        ? `${property.address_line_1}, ${property.city}, ${property.postcode}`
        : 'Property Address'

    const depositAmount = offer.tenancies?.deposit_amount || 0
    const advanceAmount = offer.advance_amount || 0
    const tdsScheme = offer.tenancies?.tds_scheme || 'TDS'
    const tdsReference = offer.tenancies?.tds_reference || ''

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-900">Deed of Assignment</h1>
                <p className="text-slate-500 mt-2">
                    Review and sign to receive your advance payment
                </p>
            </div>

            {/* Deed Content */}
            <div className="bg-white border rounded-2xl p-8 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Deed of Assignment of Tenancy Deposit</h2>

                <div className="prose prose-slate max-w-none text-sm text-justify space-y-4">
                    <p>
                        This Deed of Assignment (&quot;Deed&quot;) is made on{' '}
                        <strong>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                    </p>

                    <p><strong>Property:</strong> {propertyAddress}</p>
                    <p><strong>Deposit Amount:</strong> £{depositAmount.toLocaleString()}</p>
                    <p><strong>Advance Amount:</strong> £{advanceAmount.toLocaleString()}</p>
                    <p><strong>TDS Scheme:</strong> {tdsScheme}</p>
                    {tdsReference && <p><strong>TDS Reference:</strong> {tdsReference}</p>}

                    <h3 className="text-md font-bold text-slate-900 mt-6 mb-2">1. Assignment</h3>
                    <p>
                        The Assignor hereby assigns, transfers and sets over to the Assignee all of the Assignor&apos;s
                        right, title and interest in the Deposit of <strong>£{depositAmount.toLocaleString()}</strong>{' '}
                        currently held by <strong>{tdsScheme}</strong>, in consideration of the Assignee paying the
                        Assignor an advance of <strong>£{advanceAmount.toLocaleString()}</strong>.
                    </p>
                </div>

                {/* SignaturePad handles the rest: warranty, governing law, signature, and submit */}
                <SignaturePad offerId={offerId} />
            </div>
        </div>
    )
}
