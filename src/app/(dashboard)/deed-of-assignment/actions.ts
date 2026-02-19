'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { sendOfferCreatedEmail, sendDeedSignedEmail } from '@/lib/email'

export async function signDeed(offerId: string, signatureData: string) {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Unauthorized')
    }

    // 2. Verify ownership of the offer via the tenancy
    const { data: offer, error: fetchError } = await supabase
        .from('offers')
        .select(`
            *,
            tenancies (
                user_id,
                deposit_amount,
                profiles ( email, full_name )
            )
        `)
        .eq('id', offerId)
        .single()

    if (fetchError || !offer) {
        throw new Error('Offer not found')
    }

    // Check ownership
    if ((offer.tenancies as { user_id: string } | null)?.user_id !== user.id) {
        throw new Error('Unauthorized access to this offer')
    }

    // Check status
    if (offer.status !== 'pending') {
        if (offer.status === 'accepted') throw new Error('This offer has already been signed')
        throw new Error('This offer is no longer available')
    }

    // Check expiry
    if (offer.expires_at && new Date(offer.expires_at) < new Date()) {
        throw new Error('This offer has expired')
    }

    // 3. Mark offer as accepted and store the signature
    const { error: updateError } = await supabase
        .from('offers')
        .update({
            status: 'accepted',
            signed_at: new Date().toISOString(),
            signature_data: signatureData,
        })
        .eq('id', offerId)

    if (updateError) {
        throw new Error('Failed to record signature: ' + updateError.message)
    }

    // 4. Send confirmation email (best-effort)
    try {
        const tenancy = offer.tenancies as { deposit_amount: number; profiles?: { email?: string; full_name?: string } | null } | null
        const profile = tenancy?.profiles
        if (user.email) {
            await sendDeedSignedEmail({
                to: user.email,
                name: profile?.full_name ?? user.email,
                advanceAmount: offer.advance_amount,
            })
        }
    } catch (emailErr) {
        console.error('Failed to send deed-signed email:', emailErr)
    }

    revalidatePath('/dashboard')
    revalidatePath('/offer')

    redirect('/status?signed=true')
}
