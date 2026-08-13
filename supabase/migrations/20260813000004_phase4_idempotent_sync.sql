-- ====================================================================
-- FarmHand Phase 4: Idempotent Sync & Client Submission Identifier
-- ====================================================================

-- 1. Add client_submission_id to form_submissions for duplicate prevention during offline sync
ALTER TABLE public.form_submissions
  ADD COLUMN IF NOT EXISTS client_submission_id UUID UNIQUE;

-- 2. Create index on client_submission_id for fast idempotency lookups
CREATE INDEX IF NOT EXISTS idx_form_submissions_client_sub_id
  ON public.form_submissions(client_submission_id);
