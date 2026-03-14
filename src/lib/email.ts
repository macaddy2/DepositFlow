import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'DepositGuard <no-reply@depositguard.co.uk>'

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
        subject: `Your DepositGuard offer: £${advanceAmount.toLocaleString()} is ready`,
        html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
                <h1 style="font-size:24px;font-weight:700;color:#0f172a;margin-bottom:8px;">
                    Your instant offer is ready 🎉
                </h1>
                <p style="color:#475569;margin-bottom:24px;">Hi ${name},</p>
                <p style="color:#475569;margin-bottom:24px;">
                    We've reviewed your application and we're ready to advance you
                    <strong style="color:#028090;font-size:20px;"> £${advanceAmount.toLocaleString()}</strong>
                    today.
                </p>
                <p style="color:#475569;margin-bottom:8px;">
                    ⏳ <strong>This offer expires:</strong> ${expiryDate}
                </p>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://depositguard.co.uk'}/offer"
                   style="display:inline-block;margin-top:24px;padding:14px 28px;background:#028090;color:#fff;font-weight:700;border-radius:10px;text-decoration:none;">
                    View &amp; Accept Offer →
                </a>
                <p style="color:#94a3b8;font-size:12px;margin-top:32px;">
                    Questions? Reply to this email or contact support@depositguard.co.uk
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
                    <strong style="color:#028090;font-size:20px;"> £${advanceAmount.toLocaleString()}</strong>
                    is being processed.
                </p>
                <p style="color:#475569;margin-bottom:8px;">
                    ⏱ Funds will arrive within 2 hours during business hours (Mon–Fri 9am–6pm).
                </p>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://depositguard.co.uk'}/status"
                   style="display:inline-block;margin-top:24px;padding:14px 28px;background:#16a34a;color:#fff;font-weight:700;border-radius:10px;text-decoration:none;">
                    View Status →
                </a>
                <p style="color:#94a3b8;font-size:12px;margin-top:32px;">
                    Questions? Reply to this email or contact support@depositguard.co.uk
                </p>
            </div>
        `,
    })
}

// --- DepositGuard V3 Lifecycle Emails ---

export async function sendCaseRegisteredEmail({ to, name }: { to: string; name: string }) {
    return resend.emails.send({
        from: FROM,
        to,
        subject: 'Welcome to DepositGuard — Your Case Is Registered',
        html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
                <div style="margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #028090;">
                    <h1 style="font-size:24px;font-weight:700;color:#0f172a;margin-bottom:8px;">
                        Welcome to DepositGuard
                    </h1>
                </div>
                <p style="color:#475569;margin-bottom:24px;">Hi ${name},</p>
                <p style="color:#475569;margin-bottom:24px;">
                    Your case has been successfully registered with DepositGuard. We're here to protect your deposit
                    and ensure a fair outcome for your tenancy.
                </p>
                <p style="color:#475569;margin-bottom:8px;font-weight:600;">What happens next?</p>
                <ul style="color:#475569;margin-bottom:24px;padding-left:20px;">
                    <li style="margin-bottom:8px;">Complete your video walkthrough of the property</li>
                    <li style="margin-bottom:8px;">Our assessors will review your submission</li>
                    <li style="margin-bottom:8px;">You'll receive a full risk assessment report</li>
                </ul>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://depositguard.co.uk'}/dashboard"
                   style="display:inline-block;margin-top:24px;padding:14px 28px;background:#028090;color:#fff;font-weight:700;border-radius:10px;text-decoration:none;">
                    Submit Video Walkthrough →
                </a>
                <p style="color:#94a3b8;font-size:12px;margin-top:32px;">
                    Questions? Reply to this email or contact support@depositguard.co.uk
                </p>
            </div>
        `,
    })
}

export async function sendVideoSubmittedEmail({ to, name }: { to: string; name: string }) {
    return resend.emails.send({
        from: FROM,
        to,
        subject: 'Video Walkthrough Received',
        html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
                <div style="margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #028090;">
                    <h1 style="font-size:24px;font-weight:700;color:#0f172a;margin-bottom:8px;">
                        Video Walkthrough Received
                    </h1>
                </div>
                <p style="color:#475569;margin-bottom:24px;">Hi ${name},</p>
                <p style="color:#475569;margin-bottom:24px;">
                    We've received your video walkthrough. Our assessors will now review the footage and
                    prepare a detailed risk assessment of the property condition.
                </p>
                <p style="color:#475569;margin-bottom:24px;">
                    You can expect your assessment to be completed within
                    <strong style="color:#028090;">48 hours</strong>.
                    We'll email you as soon as it's ready.
                </p>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://depositguard.co.uk'}/dashboard"
                   style="display:inline-block;margin-top:24px;padding:14px 28px;background:#028090;color:#fff;font-weight:700;border-radius:10px;text-decoration:none;">
                    View Case Status →
                </a>
                <p style="color:#94a3b8;font-size:12px;margin-top:32px;">
                    Questions? Reply to this email or contact support@depositguard.co.uk
                </p>
            </div>
        `,
    })
}

export async function sendAssessmentCompleteEmail({ to, name, riskItems, totalRisk }: { to: string; name: string; riskItems: number; totalRisk: number }) {
    return resend.emails.send({
        from: FROM,
        to,
        subject: 'Your Risk Assessment Is Ready',
        html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
                <div style="margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #028090;">
                    <h1 style="font-size:24px;font-weight:700;color:#0f172a;margin-bottom:8px;">
                        Your Risk Assessment Is Ready
                    </h1>
                </div>
                <p style="color:#475569;margin-bottom:24px;">Hi ${name},</p>
                <p style="color:#475569;margin-bottom:24px;">
                    Our assessors have completed their review of your property walkthrough. Here's a summary:
                </p>
                <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin-bottom:24px;">
                    <p style="color:#475569;margin-bottom:12px;">
                        Risk items identified: <strong style="color:#0f172a;font-size:18px;">${riskItems}</strong>
                    </p>
                    <p style="color:#475569;margin-bottom:0;">
                        Total risk exposure: <strong style="color:#028090;font-size:18px;">£${totalRisk.toLocaleString()}</strong>
                    </p>
                </div>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://depositguard.co.uk'}/report"
                   style="display:inline-block;margin-top:24px;padding:14px 28px;background:#028090;color:#fff;font-weight:700;border-radius:10px;text-decoration:none;">
                    View Full Report →
                </a>
                <p style="color:#94a3b8;font-size:12px;margin-top:32px;">
                    Questions? Reply to this email or contact support@depositguard.co.uk
                </p>
            </div>
        `,
    })
}

export async function sendRepairsBookedEmail({ to, name, repairCount }: { to: string; name: string; repairCount: number }) {
    return resend.emails.send({
        from: FROM,
        to,
        subject: 'Repairs Confirmed',
        html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
                <div style="margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #028090;">
                    <h1 style="font-size:24px;font-weight:700;color:#0f172a;margin-bottom:8px;">
                        Repairs Confirmed
                    </h1>
                </div>
                <p style="color:#475569;margin-bottom:24px;">Hi ${name},</p>
                <p style="color:#475569;margin-bottom:24px;">
                    Great news — <strong style="color:#028090;">${repairCount} repair${repairCount !== 1 ? 's' : ''}</strong>
                    ${repairCount !== 1 ? 'have' : 'has'} been booked for your property.
                </p>
                <p style="color:#475569;margin-bottom:8px;font-weight:600;">What to expect:</p>
                <ul style="color:#475569;margin-bottom:24px;padding-left:20px;">
                    <li style="margin-bottom:8px;">A qualified contractor will carry out the repairs</li>
                    <li style="margin-bottom:8px;">Photographic evidence will be collected for each repair</li>
                    <li style="margin-bottom:8px;">You'll be notified when all repairs are complete</li>
                </ul>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://depositguard.co.uk'}/dashboard"
                   style="display:inline-block;margin-top:24px;padding:14px 28px;background:#028090;color:#fff;font-weight:700;border-radius:10px;text-decoration:none;">
                    View Repairs →
                </a>
                <p style="color:#94a3b8;font-size:12px;margin-top:32px;">
                    Questions? Reply to this email or contact support@depositguard.co.uk
                </p>
            </div>
        `,
    })
}

export async function sendRepairsCompleteEmail({ to, name }: { to: string; name: string }) {
    return resend.emails.send({
        from: FROM,
        to,
        subject: 'All Repairs Complete — Evidence Package Ready',
        html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
                <div style="margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #028090;">
                    <h1 style="font-size:24px;font-weight:700;color:#0f172a;margin-bottom:8px;">
                        All Repairs Complete
                    </h1>
                </div>
                <p style="color:#475569;margin-bottom:24px;">Hi ${name},</p>
                <p style="color:#475569;margin-bottom:24px;">
                    All scheduled repairs have been completed and verified. Your evidence package — including
                    before and after photos, contractor reports, and cost summaries — is now ready to view.
                </p>
                <p style="color:#475569;margin-bottom:24px;">
                    This documentation provides a comprehensive record to support your deposit protection case.
                </p>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://depositguard.co.uk'}/evidence"
                   style="display:inline-block;margin-top:24px;padding:14px 28px;background:#02C39A;color:#fff;font-weight:700;border-radius:10px;text-decoration:none;">
                    View Evidence Package →
                </a>
                <p style="color:#94a3b8;font-size:12px;margin-top:32px;">
                    Questions? Reply to this email or contact support@depositguard.co.uk
                </p>
            </div>
        `,
    })
}

export async function sendCaseResolvedEmail({ to, name, depositAmount }: { to: string; name: string; depositAmount: number }) {
    return resend.emails.send({
        from: FROM,
        to,
        subject: 'Deposit Protected — Case Resolved',
        html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
                <div style="margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #02C39A;">
                    <h1 style="font-size:24px;font-weight:700;color:#0f172a;margin-bottom:8px;">
                        Deposit Protected — Case Resolved
                    </h1>
                </div>
                <p style="color:#475569;margin-bottom:24px;">Hi ${name},</p>
                <p style="color:#475569;margin-bottom:24px;">
                    Your case has been successfully resolved. Your deposit of
                    <strong style="color:#02C39A;font-size:20px;"> £${depositAmount.toLocaleString()}</strong>
                    is now fully protected.
                </p>
                <p style="color:#475569;margin-bottom:24px;">
                    All assessment reports, repair evidence, and case documentation are available in your dashboard
                    for your records.
                </p>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://depositguard.co.uk'}/dashboard"
                   style="display:inline-block;margin-top:24px;padding:14px 28px;background:#02C39A;color:#fff;font-weight:700;border-radius:10px;text-decoration:none;">
                    View Summary →
                </a>
                <p style="color:#94a3b8;font-size:12px;margin-top:32px;">
                    Thank you for using DepositGuard. Questions? Contact support@depositguard.co.uk
                </p>
            </div>
        `,
    })
}
