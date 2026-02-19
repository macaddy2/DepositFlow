'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Eraser, PenLine, AlertCircle } from 'lucide-react'
import { signDeed } from './actions'

export default function SignaturePad({ offerId }: { offerId: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [hasSignature, setHasSignature] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        setIsDrawing(true)
        const { clientX, clientY } = 'touches' in e ? e.touches[0] : e
        const rect = canvas.getBoundingClientRect()
        ctx.beginPath()
        ctx.moveTo(clientX - rect.left, clientY - rect.top)
    }

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const { clientX, clientY } = 'touches' in e ? e.touches[0] : e
        const rect = canvas.getBoundingClientRect()
        ctx.lineTo(clientX - rect.left, clientY - rect.top)
        ctx.stroke()
        setHasSignature(true)
    }

    const stopDrawing = () => {
        setIsDrawing(false)
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        ctx?.closePath()
    }

    const clearSignature = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        ctx?.clearRect(0, 0, canvas.width, canvas.height)
        setHasSignature(false)
    }

    const handleSubmit = async () => {
        if (!canvasRef.current) return
        setError(null)
        setLoading(true)

        try {
            const signatureData = canvasRef.current.toDataURL()
            await signDeed(offerId, signatureData)
            // signDeed redirects on success — if we reach here something went wrong
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sign deed. Please try again.')
            setLoading(false)
        }
    }

    return (
        <>
            <h3 className="text-md font-bold text-slate-900 mt-6 mb-2">2. Warranty</h3>
            <p className="prose prose-slate max-w-none text-sm text-justify">
                The Assignor warrants that the Deposit is unencumbered and that they have the full right and authority to assign the Deposit to the Assignee.
            </p>

            <h3 className="text-md font-bold text-slate-900 mt-6 mb-2">3. Governing Law</h3>
            <p className="prose prose-slate max-w-none text-sm text-justify">
                This Deed shall be governed by and construed in accordance with the laws of England and Wales.
            </p>

            {/* Signature Area */}
            <div className="space-y-4 pt-8 border-t">
                <label className="block text-sm font-semibold text-slate-700">
                    Sign below to accept terms
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-slate-50 touch-none relative group hover:border-blue-400 transition-colors">
                    <canvas
                        ref={canvasRef}
                        width={600}
                        height={200}
                        className="w-full h-48 cursor-crosshair"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />

                    {!hasSignature && !isDrawing && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400">
                            <div className="flex flex-col items-center gap-2">
                                <PenLine className="w-6 h-6" />
                                <span className="text-sm">Sign here</span>
                            </div>
                        </div>
                    )}

                    {hasSignature && (
                        <button
                            onClick={clearSignature}
                            className="absolute top-2 right-2 p-2 bg-white/80 rounded-lg hover:bg-white text-slate-500 hover:text-red-500 transition shadow-sm"
                            title="Clear signature"
                        >
                            <Eraser className="w-5 h-5" />
                        </button>
                    )}
                </div>
                <p className="text-xs text-slate-400 text-center">
                    By signing, you agree to execute this Deed electronically.
                </p>
            </div>

            {/* Inline Error */}
            {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}

            {/* Actions */}
            <button
                onClick={handleSubmit}
                disabled={!hasSignature || loading}
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                    </>
                ) : (
                    'Sign & Complete Assignment'
                )}
            </button>
        </>
    )
}
