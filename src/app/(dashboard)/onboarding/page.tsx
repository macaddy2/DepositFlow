
'use client'

import { useState, useActionState } from 'react'
import { submitApplication } from './actions'
import { ArrowLeft, PoundSterling, Info, Loader2, Sparkles } from 'lucide-react'
import Link from 'next/link'

const initialState = {
    error: '',
}

const conditionOptions = [
    { id: 'cleaning', label: 'Cleaning Needed', cost: 150 },
    { id: 'painting', label: 'Painting Needed', cost: 200 },
    { id: 'holes', label: 'Holes/Damage', cost: 100 },
    { id: 'flooring', label: 'Flooring Needed', cost: 250 },
]

export default function OnboardingPage() {
    const [step, setStep] = useState(1)
    const [state, formAction] = useActionState(submitApplication, initialState)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        depositAmount: '',
        address: '',
        city: '',
        postcode: '',
        tdsScheme: 'DPS',
        tdsReference: '',
        tenancyEndDate: '',
        conditions: [] as string[],
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const toggleCondition = (conditionId: string) => {
        setFormData(prev => ({
            ...prev,
            conditions: prev.conditions.includes(conditionId)
                ? prev.conditions.filter(c => c !== conditionId)
                : [...prev.conditions, conditionId]
        }))
    }

    // Calculate estimated return
    const depositAmount = parseFloat(formData.depositAmount) || 0
    const estimatedRepairs = formData.conditions.reduce((total, id) => {
        const option = conditionOptions.find(o => o.id === id)
        return total + (option?.cost || 0)
    }, 0)
    const serviceFee = Math.round(depositAmount * 0.12)
    const estimatedReturn = Math.max(0, depositAmount - estimatedRepairs - serviceFee)

    const validateStep = (currentStep: number) => {
        if (currentStep === 1) {
            if (!formData.depositAmount || parseFloat(formData.depositAmount) < 100) {
                alert('Please enter a valid deposit amount (minimum £100)')
                return false
            }
        }
        if (currentStep === 2) {
            const { address, city, postcode, tdsReference, tenancyEndDate } = formData
            if (!address || !city || !postcode || !tdsReference || !tenancyEndDate) {
                alert('Please fill in all required fields')
                return false
            }
        }
        return true
    }

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(s => s + 1)
        }
    }

    return (
        <div className="max-w-xl mx-auto">
            {/* Back Button */}
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back
            </Link>

            <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
                {/* Progress Bar */}
                <div className="h-1 bg-slate-100">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                        style={{ width: `${(step / 2) * 100}%` }}
                    />
                </div>

                <div className="p-8">
                    <form action={formAction}>
                        {step === 1 && (
                            <div className="space-y-8">
                                {/* Header */}
                                <div className="text-center">
                                    <h1 className="text-2xl font-bold text-slate-900">Let&apos;s estimate your return</h1>
                                    <p className="text-slate-500 mt-2">We need a few details about your current tenancy.</p>
                                </div>

                                {/* Deposit Amount */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Total Deposit Amount (£)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <PoundSterling className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <input
                                            name="depositAmount"
                                            type="number"
                                            value={formData.depositAmount}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-12 pr-4 py-4 text-xl font-semibold border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                            placeholder="1500"
                                        />
                                    </div>
                                </div>

                                {/* Property Condition */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-slate-700">What condition is the property in?</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {conditionOptions.map(option => (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => toggleCondition(option.id)}
                                                className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${formData.conditions.includes(option.id)
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400">Select all that apply. Be honest - our inspector will verify.</p>
                                </div>

                                {/* Info Box */}
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                                    <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-amber-800">
                                        By proceeding, you agree to allow a DepositFlow artisan to inspect the property 48 hours before checkout.
                                    </p>
                                </div>

                                {/* Estimated Return Preview */}
                                {depositAmount > 0 && (
                                    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 space-y-3">
                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                            <Sparkles className="w-4 h-4 text-blue-500" />
                                            Estimated Return Preview
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-slate-600">Cash to You Today</span>
                                            <span className="text-3xl font-bold text-blue-600">£{estimatedReturn}</span>
                                        </div>
                                        <p className="text-xs text-slate-400">Final amount calculated after property details</p>
                                    </div>
                                )}

                                {/* CTA */}
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition transform active:scale-[0.98]"
                                >
                                    Calculate Offer
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                {/* Header */}
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">Property Details</h1>
                                    <p className="text-slate-500 mt-1">Where is your deposit held?</p>
                                </div>

                                {/* Address Fields */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Street Address</label>
                                        <input
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                            placeholder="123 High Street, Flat 4"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">City</label>
                                            <input
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                placeholder="London"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Postcode</label>
                                            <input
                                                name="postcode"
                                                value={formData.postcode}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                placeholder="E1 6AN"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* TDS Details */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">TDS Scheme</label>
                                            <select
                                                name="tdsScheme"
                                                value={formData.tdsScheme}
                                                onChange={handleChange}
                                                className="w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                            >
                                                <option value="DPS">DPS</option>
                                                <option value="TDS">TDS</option>
                                                <option value="MyDeposits">MyDeposits</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Reference Number</label>
                                            <input
                                                name="tdsReference"
                                                value={formData.tdsReference}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                placeholder="DAN-123456"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Tenancy End Date</label>
                                        <input
                                            name="tenancyEndDate"
                                            type="date"
                                            value={formData.tenancyEndDate}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                        />
                                    </div>
                                </div>

                                {/* Hidden Fields */}
                                <input type="hidden" name="depositAmount" value={formData.depositAmount} />
                                <input type="hidden" name="address" value={formData.address} />
                                <input type="hidden" name="city" value={formData.city} />
                                <input type="hidden" name="postcode" value={formData.postcode} />
                                <input type="hidden" name="tdsScheme" value={formData.tdsScheme} />
                                <input type="hidden" name="tdsReference" value={formData.tdsReference} />
                                <input type="hidden" name="tenancyEndDate" value={formData.tenancyEndDate} />
                                <input type="hidden" name="cleaningNeeded" value={formData.conditions.includes('cleaning') ? 'true' : 'false'} />
                                <input type="hidden" name="paintingNeeded" value={formData.conditions.includes('painting') ? 'true' : 'false'} />
                                <input type="hidden" name="holesNeeded" value={formData.conditions.includes('holes') ? 'true' : 'false'} />
                                <input type="hidden" name="flooringNeeded" value={formData.conditions.includes('flooring') ? 'true' : 'false'} />

                                {state?.error && (
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                                        {state.error}
                                    </div>
                                )}

                                {/* Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-3 rounded-xl border-2 font-semibold text-slate-600 hover:bg-slate-50 transition"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        onClick={() => setIsSubmitting(true)}
                                        className="flex-[2] bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            'Get My Instant Offer'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}
