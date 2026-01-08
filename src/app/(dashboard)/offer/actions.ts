
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function acceptOffer(offerId: string) {
    const supabase = await createClient()

    // In a real app, this would trigger HelloSign API
    // For MVP, we simulate signing

    const { error } = await supabase
        .from('contracts')
        .insert({
            offer_id: offerId,
            status: 'signed',
            signed_at: new Date().toISOString()
        })

    if (error) throw new Error(error.message)

    // Update tenancy status
    // This would typically happen via webhook, but we do it manually for simulation
    // We need to find the tenancy_id from the offer first, but assuming we have it or can get it

    return redirect('/status')
}
