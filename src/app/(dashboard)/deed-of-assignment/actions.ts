'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signDeed(offerId: string, signatureData: string) {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Unauthorized')
    }

    // 2. Verify ownership of the offer via the tenancy
    // We need to join offers -> tenancies -> user_id to check ownership
    const { data: offer, error: fetchError } = await supabase
        .from('offers')
        .select(`
            *,
            tenancies (
                user_id
            )
        `)
        .eq('id', offerId)
        .single()

    if (fetchError || !offer) {
        throw new Error('Offer not found')
    }

    // Check ownership
    // @ts-ignore - Supabase query returns an object for single relation
    if (offer.tenancies?.user_id !== user.id) {
        throw new Error('Unauthorized access to this offer')
    }

    // Check status
    if (offer.status !== 'pending') {
        throw new Error('This offer is no longer pending')
    }

    // 3. Update offer status to accepted
    const { error: updateError } = await supabase
        .from('offers')
        .update({ status: 'accepted' })
        .eq('id', offerId)

    if (updateError) {
        throw new Error('Failed to update offer status')
    }

    // 4. Create signed contract record
    const { error: contractError } = await supabase
        .from('contracts')
        .insert({
            offer_id: offerId,
            status: 'signed',
            signed_at: new Date().toISOString()
            // In a real app, we'd store the signatureData image/blob here too
        })

    if (contractError) {
        // Rollback offer status if contract creation fails would be ideal here...
        // For MVP, we log and throw
        console.error('Failed to create contract record:', contractError)
        throw new Error('Failed to record signature')
    }

    revalidatePath('/dashboard')
    revalidatePath('/offer')

    redirect('/status?signed=true')
}
