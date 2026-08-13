-- ====================================================================
-- FarmHand Milestone 16: Persistent Form Templates
-- ====================================================================

-- 1. Create FORMS Table
CREATE TABLE IF NOT EXISTS public.forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  form_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Foreign Key Index
CREATE INDEX IF NOT EXISTS idx_forms_owner_id ON public.forms(owner_id);

-- 3. Updated_at Trigger Helper Reuse
DROP TRIGGER IF EXISTS set_forms_updated_at ON public.forms;
CREATE TRIGGER set_forms_updated_at
  BEFORE UPDATE ON public.forms
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for FORMS
DROP POLICY IF EXISTS "Users can view their own forms" ON public.forms;
CREATE POLICY "Users can view their own forms"
  ON public.forms FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert their own forms" ON public.forms;
CREATE POLICY "Users can insert their own forms"
  ON public.forms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update their own forms" ON public.forms;
CREATE POLICY "Users can update their own forms"
  ON public.forms FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete their own forms" ON public.forms;
CREATE POLICY "Users can delete their own forms"
  ON public.forms FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);
