import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  FileCheck2,
  ClipboardCheck,
  Wrench,
  Clock,
  Download,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileText,
  Camera,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type RiskLevel = 'green' | 'amber' | 'red'

interface AssessmentItem {
  id: string
  room_type: string
  item_name: string
  description: string | null
  risk_level: RiskLevel
  estimated_deduction: number | null
  recommended_action: string | null
  repair_quote: number | null
  created_at: string
}

interface RepairJob {
  id: string
  description: string
  fixed_price: number
  status: string
  scheduled_date: string | null
  completed_at: string | null
  before_photo_url: string | null
  after_photo_url: string | null
  created_at: string
}

function getRiskIcon(level: RiskLevel) {
  switch (level) {
    case 'red':
      return <AlertTriangle className="w-4 h-4 text-red-500" />
    case 'amber':
      return <AlertTriangle className="w-4 h-4 text-amber-500" />
    default:
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
  }
}

function getRiskBadge(level: RiskLevel) {
  switch (level) {
    case 'red':
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100 text-xs">
          High Risk
        </Badge>
      )
    case 'amber':
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 text-xs">
          Medium Risk
        </Badge>
      )
    default:
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-xs">
          No Risk
        </Badge>
      )
  }
}

function getRepairStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-xs">
          <CheckCircle2 className="w-3 h-3" />
          Completed
        </Badge>
      )
    case 'scheduled':
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100 text-xs">
          <Calendar className="w-3 h-3" />
          Scheduled
        </Badge>
      )
    case 'in_progress':
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 text-xs">
          <Wrench className="w-3 h-3" />
          In Progress
        </Badge>
      )
    default:
      return (
        <Badge variant="outline" className="text-xs border-slate-200 text-slate-500">
          <Clock className="w-3 h-3" />
          Quoted
        </Badge>
      )
  }
}

export default async function EvidencePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's latest tenancy
  let tenancy: {
    id: string
    created_at: string
    status?: string
    notice_date?: string
    landlord_name?: string
    properties?: { address_line_1?: string; postcode?: string }
  } | null = null

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

  // Attempt to fetch assessment items (gracefully handle if table doesn't exist)
  let assessmentItems: AssessmentItem[] = []
  let hasAssessmentData = false

  if (tenancy) {
    try {
      const { data: audit } = await supabase
        .from('audits')
        .select('id, created_at')
        .eq('tenancy_id', tenancy.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (audit) {
        const { data, error } = await supabase
          .from('assessment_items')
          .select(
            'id, room_type, item_name, description, risk_level, estimated_deduction, recommended_action, repair_quote, created_at'
          )
          .eq('audit_id', audit.id)
          .order('room_type', { ascending: true })

        if (!error && data && data.length > 0) {
          assessmentItems = data as AssessmentItem[]
          hasAssessmentData = true
        }
      }
    } catch {
      // assessment_items table may not exist yet
    }
  }

  // Attempt to fetch repair jobs (gracefully handle if table doesn't exist)
  let repairJobs: RepairJob[] = []
  let hasRepairData = false

  if (tenancy) {
    try {
      const { data, error } = await supabase
        .from('repair_jobs')
        .select(
          'id, description, fixed_price, status, scheduled_date, completed_at, before_photo_url, after_photo_url, created_at'
        )
        .eq('tenancy_id', tenancy.id)
        .order('created_at', { ascending: true })

      if (!error && data && data.length > 0) {
        repairJobs = data as RepairJob[]
        hasRepairData = true
      }
    } catch {
      // repair_jobs table may not exist yet
    }
  }

  // Compute assessment summary stats
  const greenCount = assessmentItems.filter((i) => i.risk_level === 'green').length
  const amberCount = assessmentItems.filter((i) => i.risk_level === 'amber').length
  const redCount = assessmentItems.filter((i) => i.risk_level === 'red').length
  const totalDeductionRisk = assessmentItems
    .filter((i) => i.risk_level === 'amber' || i.risk_level === 'red')
    .reduce((sum, i) => sum + (i.estimated_deduction || 0), 0)

  // Compute repair stats
  const completedRepairs = repairJobs.filter((r) => r.status === 'completed').length
  const totalRepairs = repairJobs.length

  // --- Empty state: no data available ---
  if (!tenancy || (!hasAssessmentData && !hasRepairData)) {
    return (
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <FileCheck2 className="w-8 h-8 text-[#028090]" />
            <h1 className="text-3xl font-bold text-[#1A2332]">Evidence Package</h1>
          </div>
          <p className="text-slate-500 mt-2">
            Your comprehensive deposit protection evidence bundle.
          </p>
        </div>

        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
          <CardContent className="flex flex-col items-center text-center py-16">
            <div className="w-20 h-20 bg-[#028090]/10 rounded-full flex items-center justify-center mb-6">
              <Clock className="w-10 h-10 text-[#028090]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1A2332] mb-3">Evidence Not Yet Available</h2>
            <p className="text-slate-500 max-w-md mb-2">
              Your evidence package will be compiled once key milestones in your case are completed.
              This includes:
            </p>
            <ul className="text-slate-500 text-sm max-w-md mb-6 space-y-2 text-left">
              <li className="flex items-start gap-2">
                <ClipboardCheck className="w-4 h-4 text-[#028090] mt-0.5 shrink-0" />
                <span>Property assessment has been completed and reviewed</span>
              </li>
              <li className="flex items-start gap-2">
                <Wrench className="w-4 h-4 text-[#028090] mt-0.5 shrink-0" />
                <span>Any approved repairs have been carried out and documented</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-[#028090] mt-0.5 shrink-0" />
                <span>Checkout inspection has been completed</span>
              </li>
            </ul>
            <p className="text-slate-400 text-sm max-w-md mb-8">
              We&apos;ll notify you by email as soon as your evidence package is ready for review and
              download.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-[#028090] font-semibold hover:underline"
            >
              Back to Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // --- Evidence available ---
  const property = tenancy.properties
  const propertyLabel = property
    ? `${property.address_line_1}, ${property.postcode}`
    : 'Your Property'

  // Build case timeline from available data
  const timelineEvents: Array<{ date: string; label: string; icon: React.ReactNode }> = []

  if (tenancy.created_at) {
    timelineEvents.push({
      date: new Date(tenancy.created_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      label: 'Case registered',
      icon: <FileText className="w-4 h-4 text-[#028090]" />,
    })
  }

  if (tenancy.notice_date) {
    timelineEvents.push({
      date: new Date(tenancy.notice_date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      label: 'Notice date recorded',
      icon: <Calendar className="w-4 h-4 text-[#028090]" />,
    })
  }

  if (assessmentItems.length > 0 && assessmentItems[0].created_at) {
    timelineEvents.push({
      date: new Date(assessmentItems[0].created_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      label: 'Property assessment completed',
      icon: <ClipboardCheck className="w-4 h-4 text-[#02C39A]" />,
    })
  }

  if (totalRepairs > 0) {
    const firstRepair = repairJobs[0]
    timelineEvents.push({
      date: new Date(firstRepair.created_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      label: `${totalRepairs} repair${totalRepairs !== 1 ? 's' : ''} booked`,
      icon: <Wrench className="w-4 h-4 text-amber-500" />,
    })
  }

  if (completedRepairs > 0 && completedRepairs === totalRepairs) {
    const lastCompleted = repairJobs
      .filter((r) => r.completed_at)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())[0]
    if (lastCompleted?.completed_at) {
      timelineEvents.push({
        date: new Date(lastCompleted.completed_at).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        label: 'All repairs completed',
        icon: <CheckCircle2 className="w-4 h-4 text-[#02C39A]" />,
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <FileCheck2 className="w-8 h-8 text-[#028090]" />
            <h1 className="text-3xl font-bold text-[#1A2332]">Evidence Package</h1>
          </div>
          <p className="text-slate-500 mt-1">
            Case evidence for{' '}
            <span className="font-medium text-[#1A2332]">{propertyLabel}</span>
          </p>
        </div>
        <button
          disabled
          className="inline-flex items-center gap-2 bg-[#028090] text-white hover:bg-[#026d7a] px-6 py-3 rounded-xl font-semibold shadow-lg shadow-[#028090]/25 opacity-60 cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          Download Evidence Package
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content: 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assessment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1A2332]">
                <ClipboardCheck className="w-5 h-5 text-[#028090]" />
                Assessment Summary
              </CardTitle>
              <CardDescription>
                Property condition findings grouped by risk level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Risk level stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-700">{greenCount}</p>
                  <p className="text-xs text-emerald-600 font-medium mt-1">No Risk</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-amber-700">{amberCount}</p>
                  <p className="text-xs text-amber-600 font-medium mt-1">Medium Risk</p>
                </div>
                <div className="bg-red-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-red-700">{redCount}</p>
                  <p className="text-xs text-red-600 font-medium mt-1">High Risk</p>
                </div>
              </div>

              {/* Separator */}
              <div className="border-t border-slate-200" />

              {/* Assessment item list */}
              <div className="space-y-3">
                {assessmentItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-white"
                  >
                    {getRiskIcon(item.risk_level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-[#1A2332] text-sm">
                          {item.item_name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {item.room_type}
                        </Badge>
                      </div>
                      {item.description && (
                        <p className="text-xs text-slate-500">{item.description}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      {getRiskBadge(item.risk_level)}
                      {item.estimated_deduction && item.estimated_deduction > 0 && (
                        <p className="text-sm font-semibold text-[#1A2332]">
                          &pound;{item.estimated_deduction.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {totalDeductionRisk > 0 && (
                <div className="bg-[#028090]/5 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-[#1A2332]">
                    Total Estimated Deduction Risk
                  </span>
                  <span className="text-lg font-bold text-[#028090]">
                    &pound;{totalDeductionRisk.toLocaleString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Repair Completion Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1A2332]">
                <Wrench className="w-5 h-5 text-[#028090]" />
                Repair Completion Status
              </CardTitle>
              <CardDescription>
                {hasRepairData
                  ? `${completedRepairs} of ${totalRepairs} repair${totalRepairs !== 1 ? 's' : ''} completed`
                  : 'Tracking approved and completed repairs'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasRepairData ? (
                <div className="space-y-4">
                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-500">Completion progress</span>
                      <span className="font-semibold text-[#1A2332]">
                        {totalRepairs > 0
                          ? Math.round((completedRepairs / totalRepairs) * 100)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div
                        className="bg-[#02C39A] h-2.5 rounded-full transition-all"
                        style={{
                          width: `${totalRepairs > 0 ? (completedRepairs / totalRepairs) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-200" />

                  {/* Repair job list */}
                  <div className="space-y-3">
                    {repairJobs.map((job) => (
                      <div
                        key={job.id}
                        className="p-4 rounded-lg border bg-white space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-[#1A2332]">
                              {job.description}
                            </p>
                            <p className="text-sm font-semibold text-[#028090] mt-1">
                              &pound;{job.fixed_price.toLocaleString()}
                            </p>
                          </div>
                          {getRepairStatusBadge(job.status)}
                        </div>

                        {/* Before/After photos */}
                        {(job.before_photo_url || job.after_photo_url) && (
                          <div className="grid grid-cols-2 gap-3">
                            {job.before_photo_url ? (
                              <div className="rounded-lg overflow-hidden border">
                                <div className="bg-slate-50 px-2 py-1 text-xs font-medium text-slate-500 flex items-center gap-1">
                                  <Camera className="w-3 h-3" />
                                  Before
                                </div>
                                <img
                                  src={job.before_photo_url}
                                  alt="Before repair"
                                  className="w-full h-32 object-cover"
                                />
                              </div>
                            ) : (
                              <div className="rounded-lg border border-dashed bg-slate-50 flex items-center justify-center h-[164px]">
                                <span className="text-xs text-slate-400">No before photo</span>
                              </div>
                            )}
                            {job.after_photo_url ? (
                              <div className="rounded-lg overflow-hidden border">
                                <div className="bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600 flex items-center gap-1">
                                  <Camera className="w-3 h-3" />
                                  After
                                </div>
                                <img
                                  src={job.after_photo_url}
                                  alt="After repair"
                                  className="w-full h-32 object-cover"
                                />
                              </div>
                            ) : (
                              <div className="rounded-lg border border-dashed bg-slate-50 flex items-center justify-center h-[164px]">
                                <span className="text-xs text-slate-400">No after photo</span>
                              </div>
                            )}
                          </div>
                        )}

                        {job.scheduled_date && job.status !== 'completed' && (
                          <p className="text-xs text-slate-400">
                            Scheduled:{' '}
                            {new Date(job.scheduled_date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        )}
                        {job.completed_at && (
                          <p className="text-xs text-[#02C39A]">
                            Completed:{' '}
                            {new Date(job.completed_at).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : amberCount + redCount > 0 ? (
                <div className="space-y-3">
                  {assessmentItems
                    .filter((i) => i.risk_level === 'amber' || i.risk_level === 'red')
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-white"
                      >
                        {getRiskIcon(item.risk_level)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-[#1A2332]">{item.item_name}</p>
                          {item.recommended_action && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              Recommended: {item.recommended_action}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs border-slate-200 text-slate-500"
                        >
                          Pending
                        </Badge>
                      </div>
                    ))}
                  <p className="text-xs text-slate-400 mt-2">
                    Repair receipts and before/after photos will appear here once repairs are
                    completed.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-8 h-8 text-[#02C39A] mx-auto mb-3" />
                  <p className="text-sm text-slate-500">
                    No repairs were required based on the property assessment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Case Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#1A2332]">
                <Calendar className="w-5 h-5 text-[#028090]" />
                Case Timeline
              </CardTitle>
              <CardDescription>Key events and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {timelineEvents.map((event, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#028090]/10 flex items-center justify-center shrink-0">
                        {event.icon}
                      </div>
                      {index < timelineEvents.length - 1 && (
                        <div className="w-px h-full min-h-[24px] bg-slate-200 my-1" />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className="text-sm font-medium text-[#1A2332]">{event.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Evidence status card */}
          <Card className="bg-gradient-to-br from-[#028090] to-[#02C39A] border-0 shadow-lg shadow-[#028090]/25">
            <CardContent className="py-6 text-center">
              <ShieldCheck className="w-10 h-10 text-white mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg mb-2">Evidence Being Compiled</h3>
              <p className="text-white/80 text-sm mb-4">
                Your evidence package is being prepared. Once all steps are complete, you&apos;ll be
                able to download the full bundle.
              </p>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">
                <Clock className="w-3 h-3" />
                In Progress
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
