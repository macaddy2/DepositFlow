import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const tenancyId = formData.get('tenancy_id') as string
    const amount = parseFloat(formData.get('amount') as string)

    if (!tenancyId || isNaN(amount)) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
        // Fallback: mark repairs as booked without payment
        await supabase
            .from('tenancies')
            .update({ status: 'repairs_booked' })
            .eq('id', tenancyId)

        return NextResponse.redirect(new URL('/repairs/payment-success', request.url))
    }

    try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'gbp',
                    product_data: {
                        name: 'DepositGuard Inspection & Repairs',
                        description: 'Property inspection fee and approved repairs',
                    },
                    unit_amount: Math.round(amount * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${request.nextUrl.origin}/repairs/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${request.nextUrl.origin}/repairs`,
            metadata: {
                tenancy_id: tenancyId,
                user_id: user.id,
            },
        })

        return NextResponse.redirect(session.url)
    } catch (error) {
        console.error('Stripe checkout error:', error)
        return NextResponse.json({ error: 'Payment setup failed' }, { status: 500 })
    }
}
