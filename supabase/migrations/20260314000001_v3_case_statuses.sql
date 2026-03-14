-- Migrate old statuses to V3 statuses
UPDATE public.tenancies SET status = 'registered' WHERE status = 'pending_audit';
UPDATE public.tenancies SET status = 'video_submitted' WHERE status = 'audit_submitted';
UPDATE public.tenancies SET status = 'assessment_complete' WHERE status = 'offer_generated';
UPDATE public.tenancies SET status = 'repairs_booked' WHERE status = 'contract_signed';
UPDATE public.tenancies SET status = 'repairs_complete' WHERE status = 'in_progress';
UPDATE public.tenancies SET status = 'resolved' WHERE status = 'completed';
UPDATE public.tenancies SET status = 'dispute_filed' WHERE status = 'disputed';
