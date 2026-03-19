'use server'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import { CONDITION_OPTIONS, calculateOffer, TDS_SCHEMES } from '@/lib/constants'
import { sendOfferCreatedEmail } from '@/lib/email'

export type ActionState = {
    error: string | Record<string, string[]> | null;
    success: boolean;
    tenancyId?: string;
}

const ApplicationSchema = z.object({
    address: z.string().min(5, 'Address is too short'),
    city: z.string().min(2, 'City is too short'),
    postcode: z.string().min(5, 'Invalid postcode'),
    depositAmount: z.coerce.number().min(100, 'Deposit must be at least £100'),
    tdsScheme: z.enum(Object.values(TDS_SCHEMES) as [string, ...string[]]),
    tdsReference: z.string().min(5, 'Invalid TDS reference'),
    landlordName: z.string().optional(),
    agentName: z.string().optional(),
    tenancyEndDate: z.string().refine((date) => new Date(date) > new Date(), {
        message: 'Tenancy end date must be in the future',
    }),
    noticeDate: z.string().optional(),
    cleaningNeeded: z.coerce.boolean(),
    paintingNeeded: z.coerce.boolean(),
    holesNeeded: z.coerce.boolean(),
    flooringNeeded: z.coerce.boolean(),
})

export async function submitApplication(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Not authenticated', success: false }
    }

    // Parse and validate form data
    const rawData = {
        address: formData.get('address'),
        city: formData.get('city'),
        postcode: formData.get('postcode'),
        depositAmount: formData.get('depositAmount'),
        tdsScheme: formData.get('tdsScheme'),
        tdsReference: formData.get('tdsReference'),
        landlordName: formData.get('landlordName') || undefined,
        agentName: formData.get('agentName') || undefined,
        tenancyEndDate: formData.get('tenancyEndDate'),
        noticeDate: formData.get('noticeDate') || undefined,
        cleaningNeeded: formData.get('cleaningNeeded') === 'true',
        paintingNeeded: formData.get('paintingNeeded') === 'true',
        holesNeeded: formData.get('holesNeeded') === 'true',
        flooringNeeded: formData.get('flooringNeeded') === 'true',
    }

    const validatedFields = ApplicationSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.flatten().fieldErrors,
            success: false
        }
    }

    const data = validatedFields.data

    // 1. Create Property
    const { data: property, error: propError } = await supabase
        .from('properties')
        .insert({
            address_line_1: data.address,
            city: data.city,
            postcode: data.postcode
        })
        .select()
        .single()

    if (propError) {
        return { error: propError.message, success: false }
    }

    // 2. Create Tenancy
    const { data: tenancy, error: tenError } = await supabase
        .from('tenancies')
        .insert({
            user_id: user.id,
            property_id: property.id,
            deposit_amount: data.depositAmount,
            landlord_name: data.landlordName || null,
            agent_name: data.agentName || null,
            tds_scheme: data.tdsScheme,
            tds_reference: data.tdsReference,
            tenancy_end_date: data.tenancyEndDate,
            notice_date: data.noticeDate || null,
            cleaning_needed: data.cleaningNeeded,
            painting_needed: data.paintingNeeded,
            holes_needed: data.holesNeeded,
            flooring_needed: data.flooringNeeded,
            status: 'registered'
        })
        .select()
        .single()

    if (tenError) {
        return { error: tenError.message, success: false }
    }

    // 3. Calculate Offer
    const conditions = []
    if (data.cleaningNeeded) conditions.push('cleaning')
    if (data.paintingNeeded) conditions.push('painting')
    if (data.holesNeeded) conditions.push('holes')
    if (data.flooringNeeded) conditions.push('flooring')

    const { estimatedRepairCost, serviceFee, advanceAmount } = calculateOffer(data.depositAmount, conditions)

    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

    const { error: offerError } = await supabase
        .from('offers')
        .insert({
            tenancy_id: tenancy.id,
            estimated_repair_cost: estimatedRepairCost,
            service_fee: serviceFee,
            advance_amount: advanceAmount,
            status: 'pending',
            expires_at: expiresAt,
        })

    if (offerError) {
        return { error: offerError.message, success: false }
    }

    // 4. Send offer notification email (best-effort, non-blocking)
    if (user.email) {
        sendOfferCreatedEmail({
            to: user.email,
            name: user.email,
            advanceAmount,
            offerExpiresAt: expiresAt,
        }).catch((err) => console.error('Failed to send offer-created email:', err))
    }

    return { error: null, success: true, tenancyId: tenancy.id }
}
