import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Wrench,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Receipt,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const INSPECTION_FEE = 75

function getRiskBadge(riskLevel: string) {
  switch (riskLevel.toLowerCase()) {
    case 'red':
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
          <AlertCircle className="w-3 h-3" />
          High Risk
        </Badge>
      )
    case 'amber':
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
          <AlertTriangle className="w-3 h-3" />
          Medium Risk
        </Badge>
      )
    default:
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
          <CheckCircle2 className="w-3 h-3" />
          Low Risk
        </Badge>
      )
  }
}

export default async function RepairsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's latest tenancy
  let tenancy: { id: string; properties?: { address_line_1?: string; postcode?: string } } | null = null
  try {
    const { data } = await supabase
      .from('tenancies')
      .select('*, properties (*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    tenancy = data
  } catch {
    // tenancies table may not exist
  }

  // Attempt to fetch assessment items -- table may not exist yet
  let repairItems: Array<{
    id: string
    description: string
    risk_level: string
    fixed_price: number
  }> = []
  let tableError = false

  if (tenancy) {
    try {
      // First get the latest audit for this tenancy
      const { data: audit } = await supabase
        .from('audits')
        .select('id')
        .eq('tenancy_id', tenancy.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (audit) {
        const { data, error } = await supabase
          .from('assessment_items')
          .select('id, item_name, description, risk_level, repair_quote')
          .eq('audit_id', audit.id)
          .in('risk_level', ['amber', 'red'])
          .order('risk_level', { ascending: true })

        if (error) {
          if (
            error.message?.includes('does not exist') ||
            error.code === '42P01' ||
            error.message?.includes('relation')
          ) {
            tableError = true
          }
        } else {
          repairItems = (data || []).map(item => ({
            id: item.id,
            description: item.description || item.item_name,
            risk_level: item.risk_level,
            fixed_price: item.repair_quote || 0,
          }))
        }
      }
    } catch {
      tableError = true
    }
  }

  const repairTotal = repairItems.reduce((sum, item) => sum + (item.fixed_price || 0), 0)
  const grandTotal = repairTotal + INSPECTION_FEE

  // No tenancy at all
  if (!tenancy) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1A2332]">Repairs</h1>
          <p className="text-slate-500 mt-2">
            Book repairs to protect your deposit before checkout.
          </p>
        </div>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Wrench className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A2332] mb-2">No Active Tenancy</h3>
            <p className="text-slate-500 max-w-sm">
              You need an active tenancy before you can view or book repairs.
              Start a new application to get started.
            </p>
            <Link
              href="/onboarding"
              className="mt-6 inline-flex items-center gap-2 bg-[#028090] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#026d7a] transition shadow-lg shadow-[#028090]/25"
            >
              Start Application
              <ArrowRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Table doesn't exist yet
  if (tableError) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1A2332]">Repairs</h1>
          <p className="text-slate-500 mt-2">
            Book repairs to protect your deposit before checkout.
          </p>
        </div>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-[#028090]/10 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-[#028090]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A2332] mb-2">
              Assessment Not Yet Available
            </h3>
            <p className="text-slate-500 max-w-md">
              The property assessment system is being set up. Once your property has been
              inspected, any items that need attention will appear here with fixed-price
              repair quotes.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No repair items needed
  if (repairItems.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1A2332]">Repairs</h1>
          <p className="text-slate-500 mt-2">
            Book repairs to protect your deposit before checkout.
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-[#02C39A]/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#02C39A]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A2332] mb-2">No Repairs Needed</h3>
            <p className="text-slate-500 max-w-md">
              Great news! Your property assessment didn&apos;t flag any items requiring
              repair. Your deposit is looking safe.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center gap-2 text-[#028090] font-semibold hover:underline"
            >
              Back to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Repair items found -- show the booking UI
  const property = tenancy.properties
  const propertyLabel = property
    ? `${property.address_line_1}, ${property.postcode}`
    : 'Your Property'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1A2332]">Repairs</h1>
        <p className="text-slate-500 mt-2">
          Review flagged items for <span className="font-medium text-[#1A2332]">{propertyLabel}</span> and approve repairs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Repair Items List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1A2332]">
                <Wrench className="w-5 h-5 text-[#028090]" />
                Flagged Repair Items
              </CardTitle>
              <CardDescription>
                {repairItems.length} item{repairItems.length !== 1 ? 's' : ''} flagged during
                assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {repairItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 rounded-xl border bg-white hover:border-[#028090]/30 transition group"
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-5 h-5 rounded border-slate-300 text-[#028090] focus:ring-[#028090] cursor-pointer"
                  />

                  {/* Description */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1A2332] truncate">{item.description}</p>
                  </div>

                  {/* Risk Badge */}
                  {getRiskBadge(item.risk_level)}

                  {/* Price */}
                  <span className="font-bold text-[#1A2332] whitespace-nowrap">
                    £{(item.fixed_price || 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Cost Summary Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1A2332]">
                <Receipt className="w-5 h-5 text-[#028090]" />
                Cost Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {repairItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-slate-600 truncate mr-2">{item.description}</span>
                  <span className="font-medium text-[#1A2332] whitespace-nowrap">
                    £{(item.fixed_price || 0).toFixed(2)}
                  </span>
                </div>
              ))}

              <Separator />

              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Repairs Subtotal</span>
                <span className="font-medium text-[#1A2332]">£{repairTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Inspection Fee</span>
                <span className="font-medium text-[#1A2332]">£{INSPECTION_FEE.toFixed(2)}</span>
              </div>

              <Separator />

              <div className="flex justify-between">
                <span className="font-semibold text-[#1A2332]">Total</span>
                <span className="text-xl font-bold text-[#028090]">
                  £{grandTotal.toFixed(2)}
                </span>
              </div>

              <form action="/api/checkout" method="POST" className="pt-2">
                <input type="hidden" name="tenancy_id" value={tenancy.id} />
                <input type="hidden" name="amount" value={grandTotal} />
                <button
                  type="submit"
                  className="w-full bg-[#028090] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#026d7a] transition shadow-lg shadow-[#028090]/25 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Approve &amp; Book Repairs
                </button>
              </form>

              <p className="text-xs text-slate-400 text-center">
                You&apos;ll be redirected to our secure payment page
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
