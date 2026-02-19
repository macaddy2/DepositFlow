import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'DepositFlow <no-reply@depositflow.co.uk>'

interface OfferCreatedParams {
    to: string
    name: string
    advanceAmount: number
    offerExpiresAt: string
}

interface DeedSignedParams {
    to: string
    name: string
    advanceAmount: number
}

export async function sendOfferCreatedEmail({ to, name, advanceAmount, offerExpiresAt }: OfferCreatedParams) {
    const expiryDate = new Date(offerExpiresAt).toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
    })

    return resend.emails.send({
        from: FROM,
        to,
        subject: `Your DepositFlow offer: £${advanceAmount.toLocaleString()} is ready`,
        html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
                <h1 style="font-size:24px;font-weight:700;color:#0f172a;margin-bottom:8px;">
                    Your instant offer is ready 🎉
                </h1>
                <p style="color:#475569;margin-bottom:24px;">Hi ${name},</p>
                <p style="color:#475569;margin-bottom:24px;">
                    We've reviewed your application and we're ready to advance you
                    <strong style="color:#2563eb;font-size:20px;"> £${advanceAmount.toLocaleString()}</strong>
                    today.
                </p>
                <p style="color:#475569;margin-bottom:8px;">
                    ⏳ <strong>This offer expires:</strong> ${expiryDate}
                </p>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://depositflow.co.uk'}/offer"
                   style="display:inline-block;margin-top:24px;padding:14px 28px;background:#2563eb;color:#fff;font-weight:700;border-radius:10px;text-decoration:none;">
                    View &amp; Accept Offer →
                </a>
                <p style="color:#94a3b8;font-size:12px;margin-top:32px;">
                    Questions? Reply to this email or contact support@depositflow.co.uk
                </p>
            </div>
        `,
    })
}

export async function sendDeedSignedEmail({ to, name, advanceAmount }: DeedSignedParams) {
    return resend.emails.send({
        from: FROM,
        to,
        subject: 'Deed signed — your funds are on their way',
        html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
                <h1 style="font-size:24px;font-weight:700;color:#0f172a;margin-bottom:8px;">
                    Funds incoming! 💸
                </h1>
                <p style="color:#475569;margin-bottom:24px;">Hi ${name},</p>
                <p style="color:#475569;margin-bottom:24px;">
                    Your Deed of Assignment has been signed and your advance of
                    <strong style="color:#2563eb;font-size:20px;"> £${advanceAmount.toLocaleString()}</strong>
                    is being processed.
                </p>
                <p style="color:#475569;margin-bottom:8px;">
                    ⏱ Funds will arrive within 2 hours during business hours (Mon–Fri 9am–6pm).
                </p>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://depositflow.co.uk'}/status"
                   style="display:inline-block;margin-top:24px;padding:14px 28px;background:#16a34a;color:#fff;font-weight:700;border-radius:10px;text-decoration:none;">
                    View Status →
                </a>
                <p style="color:#94a3b8;font-size:12px;margin-top:32px;">
                    Questions? Reply to this email or contact support@depositflow.co.uk
                </p>
            </div>
        `,
    })
}
