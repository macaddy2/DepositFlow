import Link from 'next/link'
import { CheckCircle2, ArrowRight, Home } from 'lucide-react'

export default function PaymentSuccessPage() {
    return (
        <div className="max-w-lg mx-auto py-16 text-center space-y-8">
            {/* Green Checkmark */}
            <div className="w-20 h-20 bg-gradient-to-br from-[#02C39A] to-[#028090] rounded-full flex items-center justify-center mx-auto shadow-lg shadow-[#028090]/20">
                <CheckCircle2 className="w-10 h-10 text-white" />
            </div>

            {/* Heading */}
            <div className="space-y-3">
                <h1 className="text-3xl font-bold text-slate-900">
                    Payment Confirmed
                </h1>
                <p className="text-lg text-slate-600">
                    Your repairs have been booked. Our team will be in touch shortly to schedule the work.
                </p>
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-4">
                <Link
                    href="/repairs"
                    className="inline-flex items-center gap-2 bg-[#028090] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#026f7d] transition shadow-md shadow-[#028090]/20"
                >
                    Track Repairs
                    <ArrowRight className="w-5 h-5" />
                </Link>

                <div>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition text-sm font-medium"
                    >
                        <Home className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}
