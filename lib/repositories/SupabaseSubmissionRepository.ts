import { getSupabaseClient } from "@/lib/supabase/client"
import { Database, Json } from "@/lib/supabase/database.types"
import { FormSchema } from "@/form-builder/types"

export type SubmissionRow = Database["public"]["Tables"]["form_submissions"]["Row"]

export interface FormSubmissionRecord {
  id: string
  ownerId: string
  formId: string | null
  farmerId?: string | null
  farmId: string | null
  fieldId: string | null
  projectId?: string | null
  clientSubmissionId?: string | null
  formSchemaSnapshot: FormSchema
  responses: Record<string, unknown>
  status: "submitted" | "draft"
  createdAt: string
  updatedAt: string
  // Optional populated metadata for UI display
  farmerName?: string
  farmName?: string
  fieldName?: string
  formName?: string
  projectName?: string
  projectCode?: string
}

export interface SubmissionFilterOptions {
  formId?: string | null
  farmerId?: string | null
  farmId?: string | null
  fieldId?: string | null
  projectId?: string | null
  status?: string | null
  fromDate?: string | null
  toDate?: string | null
  search?: string | null
  limit?: number
  offset?: number
}

export class SupabaseSubmissionRepository {
  async getSubmissions(options?: SubmissionFilterOptions): Promise<FormSubmissionRecord[]> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    let query = supabase
      .from("form_submissions")
      .select(`
        *,
        farmers ( first_name, last_name ),
        farms ( name ),
        fields ( name ),
        forms ( name ),
        projects ( name, code )
      `)

    if (options?.formId && options.formId !== "all") {
      query = query.eq("form_id", options.formId)
    }
    if (options?.farmerId && options.farmerId !== "all") {
      query = query.eq("farmer_id", options.farmerId)
    }
    if (options?.farmId && options.farmId !== "all") {
      query = query.eq("farm_id", options.farmId)
    }
    if (options?.fieldId && options.fieldId !== "all") {
      query = query.eq("field_id", options.fieldId)
    }
    if (options?.projectId && options.projectId !== "all") {
      query = query.eq("project_id", options.projectId)
    }
    if (options?.status && options.status !== "all") {
      query = query.eq("status", options.status)
    }
    if (options?.fromDate) {
      query = query.gte("created_at", options.fromDate)
    }
    if (options?.toDate) {
      const toDateIso = options.toDate.includes("T")
        ? options.toDate
        : `${options.toDate}T23:59:59.999Z`
      query = query.lte("created_at", toDateIso)
    }

    query = query.order("created_at", { ascending: false })

    if (options?.limit) {
      const from = options.offset || 0
      const to = from + options.limit - 1
      query = query.range(from, to)
    }

    let { data, error } = await query

    // If PostgREST fails due to a relationship schema cache or missing relation error,
    // gracefully fall back to query without optional joins so user submissions are never lost.
    if (
      error &&
      (error.code === "PGRST200" ||
        error.code === "PGRST205" ||
        error.message?.includes("relationship") ||
        error.message?.includes("schema cache"))
    ) {
      console.warn("Retrying submissions query without optional relations due to schema issue:", error.message)
      let fallbackQuery = supabase
        .from("form_submissions")
        .select("*")

      if (options?.formId && options.formId !== "all") fallbackQuery = fallbackQuery.eq("form_id", options.formId)
      if (options?.farmerId && options.farmerId !== "all") fallbackQuery = fallbackQuery.eq("farmer_id", options.farmerId)
      if (options?.farmId && options.farmId !== "all") fallbackQuery = fallbackQuery.eq("farm_id", options.farmId)
      if (options?.fieldId && options.fieldId !== "all") fallbackQuery = fallbackQuery.eq("field_id", options.fieldId)
      if (options?.projectId && options.projectId !== "all") fallbackQuery = fallbackQuery.eq("project_id", options.projectId)
      if (options?.status && options.status !== "all") fallbackQuery = fallbackQuery.eq("status", options.status)
      if (options?.fromDate) fallbackQuery = fallbackQuery.gte("created_at", options.fromDate)
      if (options?.toDate) {
        const toDateIso = options.toDate.includes("T") ? options.toDate : `${options.toDate}T23:59:59.999Z`
        fallbackQuery = fallbackQuery.lte("created_at", toDateIso)
      }
      fallbackQuery = fallbackQuery.order("created_at", { ascending: false })
      if (options?.limit) {
        const from = options.offset || 0
        const to = from + options.limit - 1
        fallbackQuery = fallbackQuery.range(from, to)
      }

      const fallbackRes = await fallbackQuery
      if (!fallbackRes.error && fallbackRes.data) {
        data = fallbackRes.data.map((row) => ({
          ...row,
          farmers: null,
          farms: null,
          fields: null,
          forms: null,
          projects: null,
        }))
        error = null
      }
    }

    if (error) throw new Error(`Unable to load form submissions: ${error.message}`)

    const records = (data || []).map((row) => {
      const snapshot = (row.form_schema_snapshot && typeof row.form_schema_snapshot === "object"
        ? row.form_schema_snapshot
        : {}) as unknown as FormSchema

      // Extract join names if available
      const farmerObj = row.farmers as unknown as { first_name: string; last_name: string } | null
      const farmObj = row.farms as unknown as { name: string } | null
      const fieldObj = row.fields as unknown as { name: string } | null
      const formObj = row.forms as unknown as { name: string } | null
      const projectObj = row.projects as unknown as { name: string; code: string | null } | null

      return {
        id: row.id,
        ownerId: row.owner_id,
        formId: row.form_id,
        farmerId: row.farmer_id,
        farmId: row.farm_id,
        fieldId: row.field_id,
        projectId: row.project_id,
        clientSubmissionId: row.client_submission_id || undefined,
        formSchemaSnapshot: snapshot,
        responses: (row.responses && typeof row.responses === "object" ? row.responses : {}) as Record<string, unknown>,
        status: (row.status === "draft" ? "draft" : "submitted") as "submitted" | "draft",
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        farmerName: farmerObj ? `${farmerObj.first_name} ${farmerObj.last_name}` : undefined,
        farmName: farmObj?.name || "General / Archived Farm",
        fieldName: fieldObj?.name || undefined,
        formName: formObj?.name || snapshot?.name || "Form Submission",
        projectName: projectObj?.name || undefined,
        projectCode: projectObj?.code || undefined,
      }
    })

    if (options?.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim()
      return records.filter((r) => {
        const idMatch = r.id.toLowerCase().includes(q)
        const clientSubMatch = r.clientSubmissionId?.toLowerCase().includes(q) || false
        const farmerMatch = r.farmerName?.toLowerCase().includes(q) || false
        const formMatch = r.formName?.toLowerCase().includes(q) || false
        const farmMatch = r.farmName?.toLowerCase().includes(q) || false
        const fieldMatch = r.fieldName?.toLowerCase().includes(q) || false
        const projectMatch = (r.projectName?.toLowerCase().includes(q) || r.projectCode?.toLowerCase().includes(q)) || false
        const responseMatch = JSON.stringify(r.responses).toLowerCase().includes(q)
        return idMatch || clientSubMatch || farmerMatch || formMatch || farmMatch || fieldMatch || projectMatch || responseMatch
      })
    }

    return records
  }

  async getDraftByFormId(formId: string): Promise<FormSubmissionRecord | null> {
    const supabase = getSupabaseClient()
    if (!supabase) return null

    const { data, error } = await supabase
      .from("form_submissions")
      .select(`
        *,
        farmers ( first_name, last_name ),
        farms ( name ),
        fields ( name ),
        forms ( name ),
        projects ( name, code )
      `)
      .eq("form_id", formId)
      .eq("status", "draft")
      .order("updated_at", { ascending: false })
      .maybeSingle()

    if (error || !data) return null

    const snapshot = (data.form_schema_snapshot && typeof data.form_schema_snapshot === "object"
      ? data.form_schema_snapshot
      : {}) as unknown as FormSchema

    const farmerObj = data.farmers as unknown as { first_name: string; last_name: string } | null
    const farmObj = data.farms as unknown as { name: string } | null
    const fieldObj = data.fields as unknown as { name: string } | null
    const formObj = data.forms as unknown as { name: string } | null
    const projectObj = data.projects as unknown as { name: string; code: string | null } | null

    return {
      id: data.id,
      ownerId: data.owner_id,
      formId: data.form_id,
      farmerId: data.farmer_id,
      farmId: data.farm_id,
      fieldId: data.field_id,
      projectId: data.project_id,
      clientSubmissionId: data.client_submission_id || undefined,
      formSchemaSnapshot: snapshot,
      responses: (data.responses && typeof data.responses === "object" ? data.responses : {}) as Record<string, unknown>,
      status: "draft",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      farmerName: farmerObj ? `${farmerObj.first_name} ${farmerObj.last_name}` : undefined,
      farmName: farmObj?.name || "General / Archived Farm",
      fieldName: fieldObj?.name || undefined,
      formName: formObj?.name || snapshot?.name || "Form Submission",
      projectName: projectObj?.name || undefined,
      projectCode: projectObj?.code || undefined,
    }
  }

  async getSubmissionById(id: string): Promise<FormSubmissionRecord | null> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { data, error } = await supabase
      .from("form_submissions")
      .select(`
        *,
        farmers ( first_name, last_name ),
        farms ( name ),
        fields ( name ),
        forms ( name ),
        projects ( name, code )
      `)
      .eq("id", id)
      .maybeSingle()

    if (error) throw new Error(`Unable to load submission details: ${error.message}`)
    if (!data) return null

    const snapshot = (data.form_schema_snapshot && typeof data.form_schema_snapshot === "object"
      ? data.form_schema_snapshot
      : {}) as unknown as FormSchema

    const farmerObj = data.farmers as unknown as { first_name: string; last_name: string } | null
    const farmObj = data.farms as unknown as { name: string } | null
    const fieldObj = data.fields as unknown as { name: string } | null
    const formObj = data.forms as unknown as { name: string } | null
    const projectObj = data.projects as unknown as { name: string; code: string | null } | null

    return {
      id: data.id,
      ownerId: data.owner_id,
      formId: data.form_id,
      farmerId: data.farmer_id,
      farmId: data.farm_id,
      fieldId: data.field_id,
      projectId: data.project_id,
      clientSubmissionId: data.client_submission_id || undefined,
      formSchemaSnapshot: snapshot,
      responses: (data.responses && typeof data.responses === "object" ? data.responses : {}) as Record<string, unknown>,
      status: (data.status === "draft" ? "draft" : "submitted") as "submitted" | "draft",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      farmerName: farmerObj ? `${farmerObj.first_name} ${farmerObj.last_name}` : undefined,
      farmName: farmObj?.name || "General / Archived Farm",
      fieldName: fieldObj?.name || undefined,
      formName: formObj?.name || snapshot?.name || "Form Submission",
      projectName: projectObj?.name || undefined,
      projectCode: projectObj?.code || undefined,
    }
  }

  async getSubmissionsByFarmId(farmId: string): Promise<FormSubmissionRecord[]> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { data, error } = await supabase
      .from("form_submissions")
      .select(`
        *,
        farmers ( first_name, last_name ),
        farms ( name ),
        fields ( name ),
        forms ( name ),
        projects ( name, code )
      `)
      .eq("farm_id", farmId)
      .order("created_at", { ascending: false })

    if (error) throw new Error(`Unable to load farm submissions: ${error.message}`)

    return (data || []).map((row) => {
      const snapshot = (row.form_schema_snapshot && typeof row.form_schema_snapshot === "object"
        ? row.form_schema_snapshot
        : {}) as unknown as FormSchema

      const farmerObj = row.farmers as unknown as { first_name: string; last_name: string } | null
      const farmObj = row.farms as unknown as { name: string } | null
      const fieldObj = row.fields as unknown as { name: string } | null
      const formObj = row.forms as unknown as { name: string } | null
      const projectObj = row.projects as unknown as { name: string; code: string | null } | null

      return {
        id: row.id,
        ownerId: row.owner_id,
        formId: row.form_id,
        farmerId: row.farmer_id,
        farmId: row.farm_id,
        fieldId: row.field_id,
        projectId: row.project_id,
        formSchemaSnapshot: snapshot,
        responses: (row.responses && typeof row.responses === "object" ? row.responses : {}) as Record<string, unknown>,
        status: (row.status === "draft" ? "draft" : "submitted") as "submitted" | "draft",
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        farmerName: farmerObj ? `${farmerObj.first_name} ${farmerObj.last_name}` : undefined,
        farmName: farmObj?.name || undefined,
        fieldName: fieldObj?.name || undefined,
        formName: formObj?.name || snapshot?.name || "Form Submission",
        projectName: projectObj?.name || undefined,
        projectCode: projectObj?.code || undefined,
      }
    })
  }

  async getSubmissionsByProjectId(projectId: string): Promise<FormSubmissionRecord[]> {
    return this.getSubmissions({ projectId })
  }

  async createSubmission(payload: {
    formId?: string | null
    farmerId?: string | null
    farmId?: string | null
    fieldId?: string | null
    projectId?: string | null
    clientSubmissionId?: string | null
    schemaSnapshot: FormSchema
    responses: Record<string, unknown>
    status?: "submitted" | "draft"
  }): Promise<FormSubmissionRecord> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) throw new Error("You must be authenticated to submit a form.")

    // Check if clientSubmissionId was already synced (Idempotency Check)
    if (payload.clientSubmissionId) {
      const { data: existing } = await supabase
        .from("form_submissions")
        .select(`
          *,
          farmers ( first_name, last_name ),
          farms ( name ),
          fields ( name ),
          forms ( name ),
          projects ( name, code )
        `)
        .eq("client_submission_id", payload.clientSubmissionId)
        .maybeSingle()

      if (existing) {
        const farmerObj = existing.farmers as unknown as { first_name: string; last_name: string } | null
        const farmObj = existing.farms as unknown as { name: string } | null
        const fieldObj = existing.fields as unknown as { name: string } | null
        const formObj = existing.forms as unknown as { name: string } | null
        const projectObj = existing.projects as unknown as { name: string; code: string | null } | null

        return {
          id: existing.id,
          ownerId: existing.owner_id,
          formId: existing.form_id,
          farmerId: existing.farmer_id,
          farmId: existing.farm_id,
          fieldId: existing.field_id,
          projectId: existing.project_id,
          formSchemaSnapshot: payload.schemaSnapshot,
          responses: (existing.responses && typeof existing.responses === "object" ? existing.responses : {}) as Record<string, unknown>,
          status: (existing.status === "draft" ? "draft" : "submitted") as "submitted" | "draft",
          createdAt: existing.created_at,
          updatedAt: existing.updated_at,
          farmerName: farmerObj ? `${farmerObj.first_name} ${farmerObj.last_name}` : undefined,
          farmName: farmObj?.name || "General / Archived Farm",
          fieldName: fieldObj?.name || undefined,
          formName: formObj?.name || payload.schemaSnapshot?.name || "Form Submission",
          projectName: projectObj?.name || undefined,
          projectCode: projectObj?.code || undefined,
        }
      }
    }

    let { data, error } = await supabase
      .from("form_submissions")
      .insert({
        owner_id: session.user.id,
        form_id: payload.formId || null,
        farmer_id: payload.farmerId || null,
        farm_id: payload.farmId || null,
        field_id: payload.fieldId || null,
        project_id: payload.projectId || null,
        client_submission_id: payload.clientSubmissionId || null,
        form_schema_snapshot: payload.schemaSnapshot as unknown as Json,
        responses: payload.responses as unknown as Json,
        status: payload.status || "submitted",
      })
      .select(`
        *,
        farmers ( first_name, last_name ),
        farms ( name ),
        fields ( name ),
        forms ( name ),
        projects ( name, code )
      `)
      .single()

    if (
      error &&
      (error.code === "PGRST200" ||
        error.code === "PGRST205" ||
        error.message?.includes("relationship") ||
        error.message?.includes("schema cache"))
    ) {
      console.warn("createSubmission join failed, falling back to simple select:", error.message)
      if (payload.clientSubmissionId) {
        const fallback = await supabase
          .from("form_submissions")
          .select("*")
          .eq("client_submission_id", payload.clientSubmissionId)
          .maybeSingle()
        if (fallback.data) {
          data = {
            ...fallback.data,
            farmers: null,
            farms: null,
            fields: null,
            forms: null,
            projects: null,
          }
          error = null
        }
      }
    }

    if (error || !data) throw new Error(`Unable to save form submission: ${error?.message || "No data returned"}`)

    const farmerObj = data.farmers as unknown as { first_name: string; last_name: string } | null
    const farmObj = data.farms as unknown as { name: string } | null
    const fieldObj = data.fields as unknown as { name: string } | null
    const formObj = data.forms as unknown as { name: string } | null
    const projectObj = data.projects as unknown as { name: string; code: string | null } | null

    return {
      id: data.id,
      ownerId: data.owner_id,
      formId: data.form_id,
      farmerId: data.farmer_id,
      farmId: data.farm_id,
      fieldId: data.field_id,
      projectId: data.project_id,
      formSchemaSnapshot: payload.schemaSnapshot,
      responses: payload.responses,
      status: (data.status === "draft" ? "draft" : "submitted") as "submitted" | "draft",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      farmerName: farmerObj ? `${farmerObj.first_name} ${farmerObj.last_name}` : undefined,
      farmName: farmObj?.name || undefined,
      fieldName: fieldObj?.name || undefined,
      formName: formObj?.name || payload.schemaSnapshot?.name || "Form Submission",
      projectName: projectObj?.name || undefined,
      projectCode: projectObj?.code || undefined,
    }
  }

  async updateSubmission(
    id: string,
    responses: Record<string, unknown>,
    status: "submitted" | "draft" = "submitted"
  ): Promise<FormSubmissionRecord> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { data, error } = await supabase
      .from("form_submissions")
      .update({
        responses: responses as unknown as Json,
        status,
      })
      .eq("id", id)
      .select(`
        *,
        farmers ( first_name, last_name ),
        farms ( name ),
        fields ( name ),
        forms ( name ),
        projects ( name, code )
      `)
      .single()

    if (error) throw new Error(`Unable to update submission: ${error.message}`)

    const snapshot = (data.form_schema_snapshot && typeof data.form_schema_snapshot === "object"
      ? data.form_schema_snapshot
      : {}) as unknown as FormSchema

    const farmerObj = data.farmers as unknown as { first_name: string; last_name: string } | null
    const farmObj = data.farms as unknown as { name: string } | null
    const fieldObj = data.fields as unknown as { name: string } | null
    const formObj = data.forms as unknown as { name: string } | null
    const projectObj = data.projects as unknown as { name: string; code: string | null } | null

    return {
      id: data.id,
      ownerId: data.owner_id,
      formId: data.form_id,
      farmerId: data.farmer_id,
      farmId: data.farm_id,
      fieldId: data.field_id,
      projectId: data.project_id,
      clientSubmissionId: data.client_submission_id || undefined,
      formSchemaSnapshot: snapshot,
      responses: (data.responses && typeof data.responses === "object" ? data.responses : {}) as Record<string, unknown>,
      status: (data.status === "draft" ? "draft" : "submitted") as "submitted" | "draft",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      farmerName: farmerObj ? `${farmerObj.first_name} ${farmerObj.last_name}` : undefined,
      farmName: farmObj?.name || undefined,
      fieldName: fieldObj?.name || undefined,
      formName: formObj?.name || snapshot?.name || "Form Submission",
      projectName: projectObj?.name || undefined,
      projectCode: projectObj?.code || undefined,
    }
  }

  async deleteSubmission(id: string): Promise<void> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { error } = await supabase
      .from("form_submissions")
      .delete()
      .eq("id", id)

    if (error) throw new Error(`Unable to delete submission: ${error.message}`)
  }
}

export const supabaseSubmissionRepository = new SupabaseSubmissionRepository()
