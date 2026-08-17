-- ====================================================================
-- FarmHand Phase 5: Submission Management & Performance Indexes
-- ====================================================================

-- 1. Index for filtering and ordering submissions by owner and date
CREATE INDEX IF NOT EXISTS idx_form_submissions_owner_created
  ON public.form_submissions(owner_id, created_at DESC);

-- 2. Index for filtering submissions by farm and date
CREATE INDEX IF NOT EXISTS idx_form_submissions_farm_created
  ON public.form_submissions(farm_id, created_at DESC);

-- 3. Index for filtering submissions by form template and date
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_created
  ON public.form_submissions(form_id, created_at DESC);

-- 4. Index for filtering submissions by status
CREATE INDEX IF NOT EXISTS idx_form_submissions_owner_status
  ON public.form_submissions(owner_id, status);
