import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
    const body = await request.text()

    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    const signature = request.headers.get('stripe-signature')

    let event
    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
        console.error('Webhook signature verification failed:', err)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object
        const tenancyId = session.metadata?.tenancy_id

        if (tenancyId) {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            )

            await supabase
                .from('tenancies')
                .update({ status: 'repairs_booked' })
                .eq('id', tenancyId)
        }
    }

    return NextResponse.json({ received: true })
}
