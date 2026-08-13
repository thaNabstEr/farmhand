-- ====================================================================
-- FarmHand Phase 3: Historical Data Protection Migration
-- ====================================================================

-- 1. Modify farm_id to allow NULL so deleting a farm preserves historical records
ALTER TABLE public.form_submissions ALTER COLUMN farm_id DROP NOT NULL;

-- 2. Drop constraint if existing and update foreign key behavior to ON DELETE SET NULL
ALTER TABLE public.form_submissions
  DROP CONSTRAINT IF EXISTS form_submissions_farm_id_fkey,
  ADD CONSTRAINT form_submissions_farm_id_fkey
    FOREIGN KEY (farm_id) REFERENCES public.farms(id) ON DELETE SET NULL;

-- 3. Ensure field_id foreign key uses ON DELETE SET NULL
ALTER TABLE public.form_submissions
  DROP CONSTRAINT IF EXISTS form_submissions_field_id_fkey,
  ADD CONSTRAINT form_submissions_field_id_fkey
    FOREIGN KEY (field_id) REFERENCES public.fields(id) ON DELETE SET NULL;
