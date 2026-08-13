-- ====================================================================
-- FarmHand Milestone 13: Database Foundation + Row Level Security
-- ====================================================================

-- 1. Create PROFILES Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create FARMS Table
CREATE TABLE IF NOT EXISTS public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create FIELDS Table
CREATE TABLE IF NOT EXISTS public.fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  area NUMERIC,
  area_unit TEXT NOT NULL DEFAULT 'hectares',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Foreign Key Indexes for Performance and RLS Subqueries
CREATE INDEX IF NOT EXISTS idx_farms_owner_id ON public.farms(owner_id);
CREATE INDEX IF NOT EXISTS idx_fields_farm_id ON public.fields(farm_id);

-- 5. Automatic Profile Creation Mechanism (Hardened SECURITY DEFINER Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'name',
      pg_catalog.split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Revoke execution privileges on trigger function
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- Bind trigger to auth.users after insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill profile rows for any pre-existing auth users
INSERT INTO public.profiles (id, display_name)
SELECT id, split_part(email, '@', 1)
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 6. Updated_at Trigger Helper (Hardened search_path)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Revoke execution privileges on updated_at function
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM authenticated;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_farms_updated_at ON public.farms;
CREATE TRIGGER set_farms_updated_at BEFORE UPDATE ON public.farms FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_fields_updated_at ON public.fields;
CREATE TRIGGER set_fields_updated_at BEFORE UPDATE ON public.fields FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies: PROFILES
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 9. RLS Policies: FARMS
DROP POLICY IF EXISTS "Users can view their own farms" ON public.farms;
CREATE POLICY "Users can view their own farms"
  ON public.farms FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert their own farms" ON public.farms;
CREATE POLICY "Users can insert their own farms"
  ON public.farms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update their own farms" ON public.farms;
CREATE POLICY "Users can update their own farms"
  ON public.farms FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete their own farms" ON public.farms;
CREATE POLICY "Users can delete their own farms"
  ON public.farms FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- 10. RLS Policies: FIELDS (Access inherited through farm ownership)
DROP POLICY IF EXISTS "Users can view fields of their owned farms" ON public.fields;
CREATE POLICY "Users can view fields of their owned farms"
  ON public.fields FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.farms
      WHERE farms.id = fields.farm_id
      AND farms.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert fields into their owned farms" ON public.fields;
CREATE POLICY "Users can insert fields into their owned farms"
  ON public.fields FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.farms
      WHERE farms.id = fields.farm_id
      AND farms.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update fields of their owned farms" ON public.fields;
CREATE POLICY "Users can update fields of their owned farms"
  ON public.fields FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.farms
      WHERE farms.id = fields.farm_id
      AND farms.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.farms
      WHERE farms.id = fields.farm_id
      AND farms.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete fields of their owned farms" ON public.fields;
CREATE POLICY "Users can delete fields of their owned farms"
  ON public.fields FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.farms
      WHERE farms.id = fields.farm_id
      AND farms.owner_id = auth.uid()
    )
  );
