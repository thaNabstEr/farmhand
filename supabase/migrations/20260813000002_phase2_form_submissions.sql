-- ====================================================================
-- FarmHand Phase 2: Data Collection & Persistent Form Submissions
-- ====================================================================

-- 1. Create FORM_SUBMISSIONS Table
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  form_id UUID REFERENCES public.forms(id) ON DELETE SET NULL,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  field_id UUID REFERENCES public.fields(id) ON DELETE SET NULL,
  form_schema_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Performance & Relationship Indexes
CREATE INDEX IF NOT EXISTS idx_form_submissions_owner_id ON public.form_submissions(owner_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON public.form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_farm_id ON public.form_submissions(farm_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_field_id ON public.form_submissions(field_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON public.form_submissions(created_at);

-- 3. Updated_at Trigger
DROP TRIGGER IF EXISTS set_form_submissions_updated_at ON public.form_submissions;
CREATE TRIGGER set_form_submissions_updated_at
  BEFORE UPDATE ON public.form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for FORM_SUBMISSIONS
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.form_submissions;
CREATE POLICY "Users can view their own submissions"
  ON public.form_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert their own submissions on owned farms" ON public.form_submissions;
CREATE POLICY "Users can insert their own submissions on owned farms"
  ON public.form_submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id AND
    EXISTS (
      SELECT 1 FROM public.farms
      WHERE farms.id = form_submissions.farm_id
      AND farms.owner_id = auth.uid()
    ) AND (
      field_id IS NULL OR EXISTS (
        SELECT 1 FROM public.fields
        JOIN public.farms ON fields.farm_id = farms.id
        WHERE fields.id = form_submissions.field_id
        AND farms.owner_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can update their own submissions" ON public.form_submissions;
CREATE POLICY "Users can update their own submissions"
  ON public.form_submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete their own submissions" ON public.form_submissions;
CREATE POLICY "Users can delete their own submissions"
  ON public.form_submissions FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);
