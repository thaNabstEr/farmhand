-- ====================================================================
-- FarmHand Phase 8: Projects & Campaign Operations Foundation
-- ====================================================================

-- 1. Create PROJECTS Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planning',
  target_submissions INTEGER,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT projects_name_length_check CHECK (char_length(trim(name)) > 0 AND char_length(name) <= 150),
  CONSTRAINT projects_status_check CHECK (status IN ('planning', 'active', 'completed', 'archived')),
  CONSTRAINT projects_target_submissions_check CHECK (target_submissions IS NULL OR target_submissions >= 0),
  CONSTRAINT projects_date_range_check CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),
  CONSTRAINT projects_owner_code_unique UNIQUE (owner_id, code)
);

-- 2. Performance & Relationship Indexes on Projects
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_owner_status ON public.projects(owner_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_owner_created ON public.projects(owner_id, created_at DESC);

-- 3. Trigger for projects updated_at
DROP TRIGGER IF EXISTS set_projects_updated_at ON public.projects;
CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 4. Create PROJECT_FORMS Table (Many-to-Many junction between Projects and Forms)
CREATE TABLE IF NOT EXISTS public.project_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT project_forms_project_form_unique UNIQUE (project_id, form_id)
);

-- Indexes for Project Forms lookups
CREATE INDEX IF NOT EXISTS idx_project_forms_project_id ON public.project_forms(project_id);
CREATE INDEX IF NOT EXISTS idx_project_forms_form_id ON public.project_forms(form_id);

-- 5. Add project_id column to FORM_SUBMISSIONS with Historical Preservation Semantics (ON DELETE SET NULL)
ALTER TABLE public.form_submissions
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_form_submissions_project_id ON public.form_submissions(project_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_project_created ON public.form_submissions(project_id, created_at DESC);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_forms ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for PROJECTS (Owner Isolation)
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert their own projects" ON public.projects;
CREATE POLICY "Users can insert their own projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- 8. RLS Policies for PROJECT_FORMS (Independent Ownership of both Project and Form)
DROP POLICY IF EXISTS "Users can view project form assignments" ON public.project_forms;
CREATE POLICY "Users can view project form assignments"
  ON public.project_forms FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_forms.project_id
      AND projects.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can assign forms to their projects" ON public.project_forms;
CREATE POLICY "Users can assign forms to their projects"
  ON public.project_forms FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_forms.project_id
      AND projects.owner_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.forms
      WHERE forms.id = project_forms.form_id
      AND forms.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can remove project form assignments" ON public.project_forms;
CREATE POLICY "Users can remove project form assignments"
  ON public.project_forms FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_forms.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- 9. Consolidated RLS Policies for FORM_SUBMISSIONS
-- Drop any legacy variants from Phase 2 and Phase 6
DROP POLICY IF EXISTS "Users can insert their own submissions on owned farms" ON public.form_submissions;
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
    AND (
      farm_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.farms
        WHERE farms.id = farm_id AND farms.owner_id = auth.uid()
      )
    )
    AND (
      field_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.fields
        JOIN public.farms ON fields.farm_id = farms.id
        WHERE fields.id = field_id AND farms.owner_id = auth.uid()
      )
    )
    AND (
      form_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.forms
        WHERE forms.id = form_id AND forms.owner_id = auth.uid()
      )
    )
    AND (
      project_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = project_id AND projects.owner_id = auth.uid()
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
    AND (
      farm_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.farms
        WHERE farms.id = farm_id AND farms.owner_id = auth.uid()
      )
    )
    AND (
      field_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.fields
        JOIN public.farms ON fields.farm_id = farms.id
        WHERE fields.id = field_id AND farms.owner_id = auth.uid()
      )
    )
    AND (
      form_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.forms
        WHERE forms.id = form_id AND forms.owner_id = auth.uid()
      )
    )
    AND (
      project_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = project_id AND projects.owner_id = auth.uid()
      )
    )
  );

-- 10. Reload PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
