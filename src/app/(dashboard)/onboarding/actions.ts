
'use server'

import { createClient } from '@/utils/supabase/server'

export async function submitApplication(prevState: any, formData: FormData) {
    console.log('--- submitApplication STARTED ---')
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.log('submitApplication: No user found')
        return { error: 'Not authenticated', success: false }
    }
    console.log('submitApplication: User authenticated', user.id)

    const address = formData.get('address') as string
    const city = formData.get('city') as string
    const postcode = formData.get('postcode') as string
    const depositAmount = parseFloat(formData.get('depositAmount') as string) || 0
    const tdsScheme = formData.get('tdsScheme') as string
    const tdsReference = formData.get('tdsReference') as string
    const tenancyEndDate = formData.get('tenancyEndDate') as string

    console.log('submitApplication: Form data parsed', { address, depositAmount })

    // Condition flags
    const cleaningNeeded = formData.get('cleaningNeeded') === 'true'
    const paintingNeeded = formData.get('paintingNeeded') === 'true'
    const holesNeeded = formData.get('holesNeeded') === 'true'
    const flooringNeeded = formData.get('flooringNeeded') === 'true'

    // 1. Create Property
    console.log('submitApplication: Creating property...')
    const { data: property, error: propError } = await supabase
        .from('properties')
        .insert({
            address_line_1: address,
            city,
            postcode
        })
        .select()
        .single()

    if (propError) {
        console.error('submitApplication: Property error', propError)
        return { error: propError.message, success: false }
    }
    console.log('submitApplication: Property created', property.id)

    // 2. Create Tenancy with condition flags
    console.log('submitApplication: Creating tenancy...')
    const { data: tenancy, error: tenError } = await supabase
        .from('tenancies')
        .insert({
            user_id: user.id,
            property_id: property.id,
            deposit_amount: depositAmount,
            tds_scheme: tdsScheme,
            tds_reference: tdsReference,
            tenancy_end_date: tenancyEndDate,
            cleaning_needed: cleaningNeeded,
            painting_needed: paintingNeeded,
            holes_needed: holesNeeded,
            flooring_needed: flooringNeeded,
            status: 'offer_generated'
        })
        .select()
        .single()

    if (tenError) {
        console.error('submitApplication: Tenancy error', tenError)
        return { error: tenError.message, success: false }
    }
    console.log('submitApplication: Tenancy created', tenancy.id)

    // 3. Calculate and create instant offer
    let estimatedRepairCost = 0
    if (cleaningNeeded) estimatedRepairCost += 150
    if (paintingNeeded) estimatedRepairCost += 200
    if (holesNeeded) estimatedRepairCost += 100
    if (flooringNeeded) estimatedRepairCost += 250

    const serviceFee = Math.round(depositAmount * 0.12)
    const advanceAmount = Math.max(0, depositAmount - estimatedRepairCost - serviceFee)

    console.log('submitApplication: Creating offer...')
    const { error: offerError } = await supabase
        .from('offers')
        .insert({
            tenancy_id: tenancy.id,
            estimated_repair_cost: estimatedRepairCost,
            service_fee: serviceFee,
            advance_amount: advanceAmount,
            status: 'pending',
            expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 48 hours
        })

    if (offerError) {
        console.error('submitApplication: Offer error', offerError)
        return { error: offerError.message, success: false }
    }
    console.log('submitApplication: Offer created. Success.')

    // Return success state instead of redirect (redirect doesn't work with useActionState)
    return { success: true, tenancyId: tenancy.id }
}

