import { getSupabaseClient } from "@/lib/supabase/client"
import { Database } from "@/lib/supabase/database.types"
import { FormMetadata } from "./types"
import { Farm, Field } from "./SupabaseFarmRepository"
import { Farmer } from "./SupabaseFarmerRepository"

export type ProjectStatus = "planning" | "active" | "completed" | "archived"

export type ProjectRow = Database["public"]["Tables"]["projects"]["Row"]
export type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"]
export type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"]

export interface ProjectRecord {
  id: string
  ownerId: string
  name: string
  code: string | null
  description: string | null
  status: ProjectStatus
  targetSubmissions: number | null
  startDate: string | null
  endDate: string | null
  createdAt: string
  updatedAt: string
  // Aggregated metadata
  formsCount: number
  submissionsCount: number
  progressPercentage: number | null
  progressBarPercentage: number | null
}

export interface ProjectDetailRecord extends ProjectRecord {
  assignedFormIds: string[]
}

export interface ProjectMetrics {
  targetSubmissions: number | null
  actualSubmissions: number
  progressPercentage: number | null
  progressBarPercentage: number | null
  status: ProjectStatus
}

export interface ParticipatingRegistry {
  farms: Farm[]
  fields: Field[]
  farmers: Farmer[]
  counts: {
    farmsCount: number
    fieldsCount: number
    farmersCount: number
  }
}

export class SupabaseProjectRepository {
  /**
   * Calculates metric percentages strictly according to Phase 8 specifications:
   * - target = NULL: no percentage
   * - target = 0: no percentage
   * - target > 0: actual / target * 100, with progress bar clamped to min(pct, 100)
   */
  public calculateProgress(target: number | null, actual: number): {
    progressPercentage: number | null
    progressBarPercentage: number | null
  } {
    if (target === null || target === undefined || target <= 0) {
      return { progressPercentage: null, progressBarPercentage: null }
    }
    const pct = Math.round((actual / target) * 100)
    return {
      progressPercentage: pct,
      progressBarPercentage: Math.min(pct, 100),
    }
  }

  async getProjects(options?: { status?: string; search?: string }): Promise<ProjectRecord[]> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    let query = supabase
      .from("projects")
      .select(`
        *,
        project_forms ( form_id ),
        form_submissions ( id )
      `)
      .order("created_at", { ascending: false })

    if (options?.status && options.status !== "all") {
      query = query.eq("status", options.status)
    }

    if (options?.search?.trim()) {
      const term = `%${options.search.trim()}%`
      query = query.or(`name.ilike.${term},code.ilike.${term},description.ilike.${term}`)
    }

    const { data, error } = await query

    if (error) throw new Error(`Unable to load projects: ${error.message}`)

    return (data || []).map((row) => {
      const assignedForms = (row.project_forms as unknown as { form_id: string }[]) || []
      const submissions = (row.form_submissions as unknown as { id: string }[]) || []
      const actualCount = submissions.length
      const target = row.target_submissions

      const { progressPercentage, progressBarPercentage } = this.calculateProgress(target, actualCount)

      return {
        id: row.id,
        ownerId: row.owner_id,
        name: row.name,
        code: row.code,
        description: row.description,
        status: row.status as ProjectStatus,
        targetSubmissions: target,
        startDate: row.start_date,
        endDate: row.end_date,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        formsCount: assignedForms.length,
        submissionsCount: actualCount,
        progressPercentage,
        progressBarPercentage,
      }
    })
  }

  async getProjectById(id: string): Promise<ProjectDetailRecord | null> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        project_forms ( form_id ),
        form_submissions ( id )
      `)
      .eq("id", id)
      .maybeSingle()

    if (error) throw new Error(`Unable to load project: ${error.message}`)
    if (!data) return null

    const assignedForms = (data.project_forms as unknown as { form_id: string }[]) || []
    const submissions = (data.form_submissions as unknown as { id: string }[]) || []
    const actualCount = submissions.length
    const target = data.target_submissions

    const { progressPercentage, progressBarPercentage } = this.calculateProgress(target, actualCount)

    return {
      id: data.id,
      ownerId: data.owner_id,
      name: data.name,
      code: data.code,
      description: data.description,
      status: data.status as ProjectStatus,
      targetSubmissions: target,
      startDate: data.start_date,
      endDate: data.end_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      formsCount: assignedForms.length,
      submissionsCount: actualCount,
      progressPercentage,
      progressBarPercentage,
      assignedFormIds: assignedForms.map((pf) => pf.form_id),
    }
  }

  async createProject(payload: {
    name: string
    code?: string | null
    description?: string | null
    status?: ProjectStatus
    targetSubmissions?: number | null
    startDate?: string | null
    endDate?: string | null
  }): Promise<ProjectRecord> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) throw new Error("You must be authenticated to create a project.")

    const cleanName = payload.name.trim()
    if (!cleanName) throw new Error("Project name is required.")
    if (cleanName.length > 150) throw new Error("Project name must not exceed 150 characters.")

    if (payload.targetSubmissions !== null && payload.targetSubmissions !== undefined && payload.targetSubmissions < 0) {
      throw new Error("Target submissions must be greater than or equal to 0.")
    }

    if (payload.startDate && payload.endDate && payload.endDate < payload.startDate) {
      throw new Error("End date must be on or after the start date.")
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        owner_id: session.user.id,
        name: cleanName,
        code: payload.code?.trim() || null,
        description: payload.description?.trim() || null,
        status: payload.status || "planning", // Defaults to planning
        target_submissions: payload.targetSubmissions ?? null,
        start_date: payload.startDate || null,
        end_date: payload.endDate || null,
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        throw new Error(`A project with code "${payload.code}" already exists in your workspace.`)
      }
      throw new Error(`Unable to create project: ${error.message}`)
    }

    return {
      id: data.id,
      ownerId: data.owner_id,
      name: data.name,
      code: data.code,
      description: data.description,
      status: data.status as ProjectStatus,
      targetSubmissions: data.target_submissions,
      startDate: data.start_date,
      endDate: data.end_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      formsCount: 0,
      submissionsCount: 0,
      progressPercentage: null,
      progressBarPercentage: null,
    }
  }

  async updateProject(
    id: string,
    payload: {
      name?: string
      code?: string | null
      description?: string | null
      status?: ProjectStatus
      targetSubmissions?: number | null
      startDate?: string | null
      endDate?: string | null
    }
  ): Promise<ProjectRecord> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const updatePayload: Partial<ProjectUpdate> = {}

    if (payload.name !== undefined) {
      const clean = payload.name.trim()
      if (!clean) throw new Error("Project name cannot be empty.")
      if (clean.length > 150) throw new Error("Project name must not exceed 150 characters.")
      updatePayload.name = clean
    }

    if (payload.code !== undefined) {
      updatePayload.code = payload.code?.trim() || null
    }

    if (payload.description !== undefined) {
      updatePayload.description = payload.description?.trim() || null
    }

    if (payload.status !== undefined) {
      updatePayload.status = payload.status
    }

    if (payload.targetSubmissions !== undefined) {
      if (payload.targetSubmissions !== null && payload.targetSubmissions < 0) {
        throw new Error("Target submissions must be greater than or equal to 0.")
      }
      updatePayload.target_submissions = payload.targetSubmissions
    }

    if (payload.startDate !== undefined) {
      updatePayload.start_date = payload.startDate || null
    }

    if (payload.endDate !== undefined) {
      updatePayload.end_date = payload.endDate || null
    }

    const { data, error } = await supabase
      .from("projects")
      .update(updatePayload)
      .eq("id", id)
      .select(`
        *,
        project_forms ( form_id ),
        form_submissions ( id )
      `)
      .single()

    if (error) {
      if (error.code === "23505") {
        throw new Error(`A project with code "${payload.code}" already exists.`)
      }
      throw new Error(`Unable to update project: ${error.message}`)
    }

    const assignedForms = (data.project_forms as unknown as { form_id: string }[]) || []
    const submissions = (data.form_submissions as unknown as { id: string }[]) || []
    const actualCount = submissions.length
    const target = data.target_submissions

    const { progressPercentage, progressBarPercentage } = this.calculateProgress(target, actualCount)

    return {
      id: data.id,
      ownerId: data.owner_id,
      name: data.name,
      code: data.code,
      description: data.description,
      status: data.status as ProjectStatus,
      targetSubmissions: target,
      startDate: data.start_date,
      endDate: data.end_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      formsCount: assignedForms.length,
      submissionsCount: actualCount,
      progressPercentage,
      progressBarPercentage,
    }
  }

  /**
   * Enforces discrete lifecycle transitions:
   * planning -> active
   * active -> completed
   * completed -> archived
   * (or direct archive from planning/active if explicitly confirmed)
   */
  async transitionStatus(id: string, newStatus: ProjectStatus): Promise<ProjectRecord> {
    const existing = await this.getProjectById(id)
    if (!existing) throw new Error("Project not found.")

    const current = existing.status

    if (current === newStatus) return existing

    // Valid transitions matrix
    const allowedTransitions: Record<ProjectStatus, ProjectStatus[]> = {
      planning: ["active", "archived"],
      active: ["completed", "archived"],
      completed: ["archived"],
      archived: [], // Terminal state
    }

    if (!allowedTransitions[current]?.includes(newStatus)) {
      throw new Error(`Invalid status transition from "${current}" to "${newStatus}".`)
    }

    return this.updateProject(id, { status: newStatus })
  }

  async deleteProject(id: string): Promise<void> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id)

    if (error) throw new Error(`Unable to delete project: ${error.message}`)
  }

  // PROJECT FORMS ASSIGNMENT
  async getProjectForms(projectId: string): Promise<FormMetadata[]> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { data, error } = await supabase
      .from("project_forms")
      .select(`
        form_id,
        forms (
          id,
          name,
          description,
          form_schema,
          created_at,
          updated_at
        )
      `)
      .eq("project_id", projectId)

    if (error) throw new Error(`Unable to load project forms: ${error.message}`)

    return (data || []).map((row) => {
      const f = row.forms as unknown as {
        id: string
        name: string
        description: string | null
        form_schema: { fields?: unknown[]; version?: number }
        created_at: string
        updated_at: string
      }

      const schema = f?.form_schema || {}
      const fieldCount = Array.isArray(schema.fields) ? schema.fields.length : 0

      return {
        id: f?.id || row.form_id,
        name: f?.name || "Untitled Form",
        description: f?.description || "",
        status: "published",
        fieldCount,
        createdAt: f?.created_at || new Date().toISOString(),
        updatedAt: f?.updated_at || new Date().toISOString(),
        schemaVersion: schema.version || 1,
      }
    })
  }

  async assignFormsToProject(projectId: string, formIds: string[]): Promise<void> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    // Fetch existing assignments to avoid duplicate insert errors
    const { data: existing } = await supabase
      .from("project_forms")
      .select("form_id")
      .eq("project_id", projectId)

    const existingSet = new Set((existing || []).map((e) => e.form_id))
    const toInsert = formIds.filter((id) => !existingSet.has(id))

    if (toInsert.length === 0) return

    const rows = toInsert.map((formId) => ({
      project_id: projectId,
      form_id: formId,
    }))

    const { error } = await supabase.from("project_forms").insert(rows)
    if (error) throw new Error(`Unable to assign forms to project: ${error.message}`)
  }

  async removeFormFromProject(projectId: string, formId: string): Promise<void> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { error } = await supabase
      .from("project_forms")
      .delete()
      .eq("project_id", projectId)
      .eq("form_id", formId)

    if (error) throw new Error(`Unable to remove form from project: ${error.message}`)
  }

  // PARTICIPATING REGISTRY DERIVATION
  async getParticipatingRegistry(projectId: string): Promise<ParticipatingRegistry> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    // Fetch distinct submissions for this project
    const { data, error } = await supabase
      .from("form_submissions")
      .select(`
        farm_id,
        field_id,
        farmer_id,
        farms ( id, name, description, farmer_id, created_at, updated_at ),
        fields ( id, farm_id, name, area, area_unit, description, created_at, updated_at ),
        farmers ( id, first_name, last_name, phone, email, national_id, community, village, created_at, updated_at )
      `)
      .eq("project_id", projectId)

    if (error) throw new Error(`Unable to load participating registry: ${error.message}`)

    const farmsMap = new Map<string, Farm>()
    const fieldsMap = new Map<string, Field>()
    const farmersMap = new Map<string, Farmer>()

    for (const row of data || []) {
      if (row.farm_id && row.farms) {
        const farmObj = row.farms as unknown as Farm
        farmsMap.set(farmObj.id, farmObj)
      }
      if (row.field_id && row.fields) {
        const fieldObj = row.fields as unknown as Field
        fieldsMap.set(fieldObj.id, fieldObj)
      }
      if (row.farmer_id && row.farmers) {
        const farmerObj = row.farmers as unknown as Farmer
        farmersMap.set(farmerObj.id, farmerObj)
      }
    }

    const farms = Array.from(farmsMap.values())
    const fields = Array.from(fieldsMap.values())
    const farmers = Array.from(farmersMap.values())

    return {
      farms,
      fields,
      farmers,
      counts: {
        farmsCount: farms.length,
        fieldsCount: fields.length,
        farmersCount: farmers.length,
      },
    }
  }
}

export const supabaseProjectRepository = new SupabaseProjectRepository()
