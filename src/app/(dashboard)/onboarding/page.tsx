'use client'

import { useState, useActionState } from 'react'
import { submitApplication } from './actions'
import { ArrowLeft, PoundSterling, Info, Loader2, Sparkles, Check, Home, ClipboardCheck } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

const initialState = {
    error: '',
}

const conditionOptions = [
    { id: 'cleaning', label: 'Cleaning', cost: 150, emoji: '🧹' },
    { id: 'painting', label: 'Painting', cost: 200, emoji: '🎨' },
    { id: 'holes', label: 'Holes/Damage', cost: 100, emoji: '🔨' },
    { id: 'flooring', label: 'Flooring', cost: 250, emoji: '🪵' },
]

const steps = [
    { id: 1, label: 'Deposit', icon: PoundSterling },
    { id: 2, label: 'Property', icon: Home },
    { id: 3, label: 'Review', icon: ClipboardCheck },
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

    const prevStep = () => {
        setStep(s => Math.max(1, s - 1))
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Back Button */}
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 group transition-colors">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Dashboard</span>
            </Link>

            {/* Step Indicator */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {steps.map((s, index) => (
                        <div key={s.id} className="flex items-center">
                            <div className="flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${step > s.id
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                        : step === s.id
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                                            : 'bg-slate-200 text-slate-400'
                                    }`}>
                                    {step > s.id ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        <s.icon className="w-5 h-5" />
                                    )}
                                </div>
                                <span className={`mt-2 text-sm font-medium ${step >= s.id ? 'text-slate-900' : 'text-slate-400'
                                    }`}>
                                    {s.label}
                                </span>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`w-20 md:w-32 h-1 mx-2 rounded-full transition-colors ${step > s.id ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-slate-200'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <Card className="border-0 shadow-xl overflow-hidden">
                <CardContent className="p-8">
                    <form action={formAction}>
                        {step === 1 && (
                            <div className="space-y-8">
                                {/* Header */}
                                <div className="text-center">
                                    <h1 className="text-2xl font-bold text-slate-900">Let&apos;s estimate your return</h1>
                                    <p className="text-slate-500 mt-2">We need a few details about your current tenancy.</p>
                                </div>

                                {/* Deposit Amount */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-slate-700">Total Deposit Amount</Label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-xl font-semibold text-slate-400">£</span>
                                        </div>
                                        <Input
                                            name="depositAmount"
                                            type="number"
                                            value={formData.depositAmount}
                                            onChange={handleChange}
                                            required
                                            className="pl-10 h-14 text-2xl font-bold border-2 focus:border-blue-500"
                                            placeholder="1500"
                                        />
                                    </div>
                                </div>

                                {/* Property Condition */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-slate-700">Property condition (select all that apply)</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {conditionOptions.map(option => (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => toggleCondition(option.id)}
                                                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${formData.conditions.includes(option.id)
                                                        ? 'border-blue-500 bg-blue-50 shadow-md'
                                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{option.emoji}</span>
                                                    <div>
                                                        <p className={`font-medium ${formData.conditions.includes(option.id) ? 'text-blue-700' : 'text-slate-700'
                                                            }`}>
                                                            {option.label}
                                                        </p>
                                                        <p className="text-xs text-slate-400">Est. £{option.cost}</p>
                                                    </div>
                                                </div>
                                                {formData.conditions.includes(option.id) && (
                                                    <div className="absolute top-2 right-2">
                                                        <Check className="w-4 h-4 text-blue-500" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400">Be honest - our inspector will verify before checkout.</p>
                                </div>

                                {/* Estimated Return Preview */}
                                {depositAmount > 0 && (
                                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl" />
                                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl" />
                                        <div className="relative">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Sparkles className="w-5 h-5 text-blue-400" />
                                                <span className="text-sm font-medium text-slate-300">Estimated Return</span>
                                            </div>
                                            <div className="flex items-end justify-between">
                                                <div>
                                                    <p className="text-sm text-slate-400 mb-1">Cash to you today</p>
                                                    <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                                        £{estimatedReturn.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="text-right text-sm text-slate-400 space-y-1">
                                                    <p>Deposit: £{depositAmount.toLocaleString()}</p>
                                                    <p>Repairs: -£{estimatedRepairs}</p>
                                                    <p>Service (12%): -£{serviceFee}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Info Alert */}
                                <Alert className="bg-amber-50 border-amber-200">
                                    <Info className="h-4 w-4 text-amber-600" />
                                    <AlertDescription className="text-amber-800">
                                        By proceeding, you agree to allow a DepositFlow artisan to inspect the property 48 hours before checkout.
                                    </AlertDescription>
                                </Alert>

                                {/* CTA */}
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-blue-500/25"
                                >
                                    Continue to Property Details
                                </Button>
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
                                        <Label className="text-sm font-medium text-slate-700">Street Address</Label>
                                        <Input
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            required
                                            className="h-12"
                                            placeholder="123 High Street, Flat 4"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">City</Label>
                                            <Input
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                required
                                                className="h-12"
                                                placeholder="London"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">Postcode</Label>
                                            <Input
                                                name="postcode"
                                                value={formData.postcode}
                                                onChange={handleChange}
                                                required
                                                className="h-12"
                                                placeholder="E1 6AN"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* TDS Details */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">TDS Scheme</Label>
                                            <select
                                                name="tdsScheme"
                                                value={formData.tdsScheme}
                                                onChange={handleChange}
                                                className="w-full h-12 px-3 border rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                            >
                                                <option value="DPS">DPS</option>
                                                <option value="TDS">TDS</option>
                                                <option value="MyDeposits">MyDeposits</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">Reference Number</Label>
                                            <Input
                                                name="tdsReference"
                                                value={formData.tdsReference}
                                                onChange={handleChange}
                                                required
                                                className="h-12"
                                                placeholder="DAN-123456"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700">Tenancy End Date</Label>
                                        <Input
                                            name="tenancyEndDate"
                                            type="date"
                                            value={formData.tenancyEndDate}
                                            onChange={handleChange}
                                            required
                                            className="h-12"
                                        />
                                    </div>
                                </div>

                                {/* Summary Card */}
                                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                                    <p className="text-sm font-medium text-slate-700">Your Offer Summary</p>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Deposit Amount</span>
                                        <span className="font-semibold">£{depositAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Estimated Repairs</span>
                                        <span className="font-semibold text-red-600">-£{estimatedRepairs}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Service Fee (12%)</span>
                                        <span className="font-semibold text-red-600">-£{serviceFee}</span>
                                    </div>
                                    <div className="border-t pt-2 flex justify-between">
                                        <span className="font-medium text-slate-700">Cash to You</span>
                                        <span className="font-bold text-lg text-green-600">£{estimatedReturn.toLocaleString()}</span>
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
                                    <Alert variant="destructive">
                                        <AlertDescription>{state.error}</AlertDescription>
                                    </Alert>
                                )}

                                {/* Buttons */}
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        type="button"
                                        onClick={prevStep}
                                        variant="outline"
                                        className="flex-1 h-12"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        onClick={() => setIsSubmitting(true)}
                                        className="flex-[2] h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-blue-500/25"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                Processing...
                                            </>
                                        ) : (
                                            'Get My Instant Offer'
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
