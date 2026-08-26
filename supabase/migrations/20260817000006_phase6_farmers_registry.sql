-- ====================================================================
-- FarmHand Phase 6: Complete Agricultural Registry (Farmers Entity)
-- ====================================================================

-- 1. Create FARMERS Table
CREATE TABLE IF NOT EXISTS public.farmers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  national_id TEXT,
  community TEXT,
  village TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Performance Indexes on Farmers
CREATE INDEX IF NOT EXISTS idx_farmers_owner_id ON public.farmers(owner_id);
CREATE INDEX IF NOT EXISTS idx_farmers_name ON public.farmers(owner_id, last_name, first_name);

-- 3. Updated_at Trigger for Farmers
DROP TRIGGER IF EXISTS set_farmers_updated_at ON public.farmers;
CREATE TRIGGER set_farmers_updated_at
  BEFORE UPDATE ON public.farmers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 4. Enable Row Level Security (RLS) on Farmers
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for FARMERS
DROP POLICY IF EXISTS "Users can view their own farmers" ON public.farmers;
CREATE POLICY "Users can view their own farmers"
  ON public.farmers FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert their own farmers" ON public.farmers;
CREATE POLICY "Users can insert their own farmers"
  ON public.farmers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update their own farmers" ON public.farmers;
CREATE POLICY "Users can update their own farmers"
  ON public.farmers FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete their own farmers" ON public.farmers;
CREATE POLICY "Users can delete their own farmers"
  ON public.farmers FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- 6. Add farmer_id column to FARMS (optional relationship)
ALTER TABLE public.farms
  ADD COLUMN IF NOT EXISTS farmer_id UUID REFERENCES public.farmers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_farms_farmer_id ON public.farms(farmer_id);

-- 7. Update FARMS RLS policies to enforce Cross-Owner validation on farmer_id
DROP POLICY IF EXISTS "Users can insert their own farms" ON public.farms;
CREATE POLICY "Users can insert their own farms"
  ON public.farms FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id
    AND (
      farmer_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.farmers
        WHERE farmers.id = farmer_id AND farmers.owner_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can update their own farms" ON public.farms;
CREATE POLICY "Users can update their own farms"
  ON public.farms FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (
    auth.uid() = owner_id
    AND (
      farmer_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.farmers
        WHERE farmers.id = farmer_id AND farmers.owner_id = auth.uid()
      )
    )
  );

-- 8. Add farmer_id column to FORM_SUBMISSIONS (optional context)
ALTER TABLE public.form_submissions
  ADD COLUMN IF NOT EXISTS farmer_id UUID REFERENCES public.farmers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_form_submissions_farmer_id ON public.form_submissions(farmer_id);

-- 9. Update FORM_SUBMISSIONS RLS to validate farmer_id ownership if provided
DROP POLICY IF EXISTS "Users can insert their own submissions" ON public.form_submissions;
CREATE POLICY "Users can insert their own submissions"
  ON public.form_submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = owner_id
    AND (
      farmer_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.farmers
        WHERE farmers.id = farmer_id AND farmers.owner_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Users can update their own submissions" ON public.form_submissions;
CREATE POLICY "Users can update their own submissions"
  ON public.form_submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (
    auth.uid() = owner_id
    AND (
      farmer_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.farmers
        WHERE farmers.id = farmer_id AND farmers.owner_id = auth.uid()
      )
    )
  );

-- 10. Reload PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
