'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { FileSignature, Check, ArrowLeft, Loader2, PenTool, Shield } from 'lucide-react'
import Link from 'next/link'

export default function DeedOfAssignmentPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const [isDrawing, setIsDrawing] = useState(false)
    const [hasSigned, setHasSigned] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [agreed, setAgreed] = useState(false)
    const [fullName, setFullName] = useState('')

    const offerId = searchParams.get('offerId') || ''
    const depositAmount = searchParams.get('depositAmount') || '0'
    const advanceAmount = searchParams.get('advanceAmount') || '0'
    const tdsScheme = searchParams.get('tdsScheme') || ''
    const tdsReference = searchParams.get('tdsReference') || ''
    const propertyAddress = searchParams.get('propertyAddress') || ''

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set up canvas
        ctx.strokeStyle = '#1e40af'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
    }, [])

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        setIsDrawing(true)
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const rect = canvas.getBoundingClientRect()
        const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
        const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

        ctx.beginPath()
        ctx.moveTo(x, y)
    }

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return

        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const rect = canvas.getBoundingClientRect()
        const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
        const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

        ctx.lineTo(x, y)
        ctx.stroke()
        setHasSigned(true)
    }

    const stopDrawing = () => {
        setIsDrawing(false)
    }

    const clearSignature = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setHasSigned(false)
    }

    const handleSubmit = async () => {
        if (!hasSigned || !agreed || !fullName) {
            alert('Please complete all required fields and sign the deed')
            return
        }

        setSubmitting(true)

        const canvas = canvasRef.current
        if (!canvas) return

        const signatureData = canvas.toDataURL('image/png')

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            alert('Please log in to continue')
            router.push('/login')
            return
        }

        // Create the Deed of Assignment record
        const { error: deedError } = await supabase
            .from('deed_of_assignments')
            .insert({
                offer_id: offerId,
                tenant_id: user.id,
                assignee_name: 'DepositFlow Ltd',
                deposit_amount: parseFloat(depositAmount),
                advance_amount: parseFloat(advanceAmount),
                tds_scheme: tdsScheme,
                tds_reference: tdsReference,
                property_address: propertyAddress,
                tenant_signature: signatureData,
                tenant_signed_at: new Date().toISOString(),
                status: 'tenant_signed'
            })

        if (deedError) {
            alert('Error saving deed: ' + deedError.message)
            setSubmitting(false)
            return
        }

        // Update offer status
        await supabase
            .from('offers')
            .update({ status: 'accepted' })
            .eq('id', offerId)

        // Redirect to success/status page
        router.push('/status?signed=true')
    }

    const today = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <Link href="/offer" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Offer
            </Link>

            {/* Title */}
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                    <FileSignature className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Deed of Assignment</h1>
                <p className="text-slate-500 mt-1">Transfer your deposit rights to receive your advance</p>
            </div>

            {/* Deed Document */}
            <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
                <div className="bg-slate-50 p-4 border-b flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Legal Document</span>
                    <span className="text-xs text-slate-400">{today}</span>
                </div>

                <div className="p-6 space-y-6">
                    {/* Deed Content */}
                    <div className="prose prose-sm text-slate-700 max-w-none">
                        <h3 className="text-lg font-bold text-slate-900">DEED OF ASSIGNMENT OF DEPOSIT RIGHTS</h3>

                        <p className="text-sm leading-relaxed">
                            This Deed of Assignment (&quot;Deed&quot;) is made on <strong>{today}</strong>
                        </p>

                        <p className="text-sm leading-relaxed"><strong>BETWEEN:</strong></p>

                        <ol className="text-sm space-y-2 pl-4">
                            <li>
                                <strong>The Assignor</strong> (Tenant): The individual signing below, being the lawful tenant
                                and beneficial owner of the deposit referenced herein.
                            </li>
                            <li>
                                <strong>The Assignee</strong>: DepositFlow Ltd, a company registered in England and Wales.
                            </li>
                        </ol>

                        <p className="text-sm leading-relaxed"><strong>RECITALS:</strong></p>

                        <p className="text-sm leading-relaxed">
                            A. The Assignor has a tenancy deposit of <strong>£{depositAmount}</strong> held under the
                            <strong> {tdsScheme}</strong> scheme (Reference: <strong>{tdsReference}</strong>)
                            in respect of the property at <strong>{propertyAddress}</strong>.
                        </p>

                        <p className="text-sm leading-relaxed">
                            B. In consideration of an advance payment of <strong>£{advanceAmount}</strong>,
                            the Assignor agrees to assign all rights, title, and interest in the said deposit to the Assignee.
                        </p>

                        <p className="text-sm leading-relaxed"><strong>NOW THIS DEED WITNESSES:</strong></p>

                        <ol className="text-sm space-y-2 pl-4">
                            <li>
                                The Assignor hereby assigns to the Assignee absolutely all rights, title, and interest
                                in and to the deposit, including but not limited to the right to receive the deposit
                                upon release from the scheme.
                            </li>
                            <li>
                                The Assignor shall cooperate with the Assignee in all matters necessary to effect the
                                transfer of the deposit, including signing any additional documentation required by the
                                deposit protection scheme.
                            </li>
                            <li>
                                The Assignor warrants that they are the sole beneficial owner of the deposit and have
                                full authority to assign the same.
                            </li>
                        </ol>
                    </div>

                    {/* Full Name Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Full Legal Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name as it appears on your ID"
                            className="w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                    </div>

                    {/* Signature Pad */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <PenTool className="w-4 h-4" />
                                Your Signature
                            </label>
                            <button
                                type="button"
                                onClick={clearSignature}
                                className="text-xs text-blue-600 hover:underline"
                            >
                                Clear
                            </button>
                        </div>
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-1 bg-slate-50">
                            <canvas
                                ref={canvasRef}
                                width={500}
                                height={150}
                                className="w-full bg-white rounded-lg cursor-crosshair touch-none"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                            />
                        </div>
                        {!hasSigned && (
                            <p className="text-xs text-slate-400 text-center">Draw your signature above using mouse or touch</p>
                        )}
                    </div>

                    {/* Agreement Checkbox */}
                    <label className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl cursor-pointer">
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700">
                            I confirm that I have read and understood this Deed of Assignment, and I agree to transfer
                            my deposit rights to DepositFlow Ltd in exchange for the advance payment of <strong>£{advanceAmount}</strong>.
                        </span>
                    </label>
                </div>
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
                <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-800">
                    This document is legally binding and encrypted. Your signature will be timestamped and stored securely.
                </p>
            </div>

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={!hasSigned || !agreed || !fullName || submitting}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-200 transition transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {submitting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <Check className="w-5 h-5" />
                        Sign & Receive £{advanceAmount}
                    </>
                )}
            </button>
        </div>
    )
}
