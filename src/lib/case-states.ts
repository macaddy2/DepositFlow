import {
  ClipboardCheck,
  Video,
  FileCheck2,
  Wrench,
  CheckCircle2,
  Home,
  Scale,
  Trophy,
} from 'lucide-react'

export const CASE_STATUSES = [
  {
    id: 'registered',
    label: 'Registered',
    description: 'Tenancy details captured',
    icon: ClipboardCheck,
    color: 'text-[#028090]',
    bgColor: 'bg-[#028090]/10',
  },
  {
    id: 'video_submitted',
    label: 'Video Submitted',
    description: 'Walkthrough uploaded, awaiting assessment',
    icon: Video,
    color: 'text-[#028090]',
    bgColor: 'bg-[#028090]/10',
  },
  {
    id: 'assessment_complete',
    label: 'Assessment Complete',
    description: 'Risk report ready',
    icon: FileCheck2,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
  {
    id: 'repairs_booked',
    label: 'Repairs Booked',
    description: 'Artisans dispatched',
    icon: Wrench,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    id: 'repairs_complete',
    label: 'Repairs Complete',
    description: 'All repairs done, evidence ready',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    id: 'landlord_review',
    label: 'Landlord Review',
    description: 'Awaiting landlord inspection',
    icon: Home,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    id: 'dispute_filed',
    label: 'Dispute Filed',
    description: 'Residual dispute submitted to TDP',
    icon: Scale,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  {
    id: 'resolved',
    label: 'Resolved',
    description: 'Deposit returned',
    icon: Trophy,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
] as const

export type CaseStatus = typeof CASE_STATUSES[number]['id']

// Valid transitions
export const VALID_TRANSITIONS: Record<string, string[]> = {
  registered: ['video_submitted'],
  video_submitted: ['assessment_complete'],
  assessment_complete: ['repairs_booked', 'resolved'],
  repairs_booked: ['repairs_complete'],
  repairs_complete: ['landlord_review'],
  landlord_review: ['resolved', 'dispute_filed'],
  dispute_filed: ['resolved'],
  resolved: [],
}

// Map old statuses to new ones
export const STATUS_MIGRATION: Record<string, CaseStatus> = {
  pending_audit: 'registered',
  audit_submitted: 'video_submitted',
  offer_generated: 'assessment_complete',
  contract_signed: 'repairs_booked',
  in_progress: 'repairs_complete',
  completed: 'resolved',
  disputed: 'dispute_filed',
}

export function getStatusIndex(status: string): number {
  const mapped = STATUS_MIGRATION[status] || status
  return CASE_STATUSES.findIndex(s => s.id === mapped)
}

export function getStatusInfo(status: string) {
  const mapped = STATUS_MIGRATION[status] || status
  return CASE_STATUSES.find(s => s.id === mapped) || CASE_STATUSES[0]
}

export function getNextAction(status: string): { label: string; href: string } | null {
  const mapped = STATUS_MIGRATION[status] || status
  switch (mapped) {
    case 'registered':
      return { label: 'Submit Video Walkthrough', href: '/video-walkthrough' }
    case 'video_submitted':
      return { label: 'Awaiting Assessment', href: '/dashboard' }
    case 'assessment_complete':
      return { label: 'View Assessment & Book Repairs', href: '/assessment' }
    case 'repairs_booked':
      return { label: 'Track Repairs', href: '/repairs' }
    case 'repairs_complete':
      return { label: 'View Evidence Package', href: '/evidence' }
    case 'landlord_review':
      return { label: 'Track Resolution', href: '/status' }
    case 'dispute_filed':
      return { label: 'Track Dispute', href: '/status' }
    case 'resolved':
      return { label: 'View Summary', href: '/status' }
    default:
      return null
  }
}
