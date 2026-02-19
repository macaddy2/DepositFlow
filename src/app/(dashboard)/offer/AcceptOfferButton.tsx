'use client'

import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface AcceptOfferButtonProps {
    offerId: string
    tenancy: {
        deposit_amount: number
        tds_scheme: string
        tds_reference: string
        properties?: {
            address_line_1: string
            city: string
            postcode: string
        }
    }
    advanceAmount: number
}

export default function AcceptOfferButton({ offerId, tenancy, advanceAmount }: AcceptOfferButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleAccept = () => {
        setLoading(true)
        // Navigate to Deed of Assignment page with ONLY offerId
        // The page will fetch the rest of the data securely server-side
        router.push(`/deed-of-assignment?offerId=${offerId}`)
    }

    return (
        <button
            onClick={handleAccept}
            disabled={loading}
            className="flex-[2] bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 transition transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
        >
            {loading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading...
                </>
            ) : (
                <>
                    <Check className="w-5 h-5" />
                    Accept & Get Paid
                </>
            )}
        </button>
    )
}
