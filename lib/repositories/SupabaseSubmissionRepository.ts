import { getSupabaseClient } from "@/lib/supabase/client"
import { Database, Json } from "@/lib/supabase/database.types"
import { FormSchema } from "@/form-builder/types"

export type SubmissionRow = Database["public"]["Tables"]["form_submissions"]["Row"]

export interface FormSubmissionRecord {
  id: string
  ownerId: string
  formId: string | null
  farmId: string | null
  fieldId: string | null
  formSchemaSnapshot: FormSchema
  responses: Record<string, unknown>
  status: "submitted" | "draft"
  createdAt: string
  updatedAt: string
  // Optional populated metadata for UI display
  farmName?: string
  fieldName?: string
  formName?: string
}

export class SupabaseSubmissionRepository {
  async getSubmissions(): Promise<FormSubmissionRecord[]> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { data, error } = await supabase
      .from("form_submissions")
      .select(`
        *,
        farms ( name ),
        fields ( name ),
        forms ( name )
      `)
      .order("created_at", { ascending: false })

    if (error) throw new Error(`Unable to load form submissions: ${error.message}`)

    return (data || []).map((row) => {
      const snapshot = (row.form_schema_snapshot && typeof row.form_schema_snapshot === "object"
        ? row.form_schema_snapshot
        : {}) as unknown as FormSchema

      // Extract join names if available
      const farmObj = row.farms as unknown as { name: string } | null
      const fieldObj = row.fields as unknown as { name: string } | null
      const formObj = row.forms as unknown as { name: string } | null

      return {
        id: row.id,
        ownerId: row.owner_id,
        formId: row.form_id,
        farmId: row.farm_id,
        fieldId: row.field_id,
        formSchemaSnapshot: snapshot,
        responses: (row.responses && typeof row.responses === "object" ? row.responses : {}) as Record<string, unknown>,
        status: (row.status === "draft" ? "draft" : "submitted") as "submitted" | "draft",
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        farmName: farmObj?.name || "General / Archived Farm",
        fieldName: fieldObj?.name || undefined,
        formName: formObj?.name || snapshot?.name || "Form Submission",
      }
    })
  }

  async getDraftByFormId(formId: string): Promise<FormSubmissionRecord | null> {
    const supabase = getSupabaseClient()
    if (!supabase) return null

    const { data, error } = await supabase
      .from("form_submissions")
      .select(`
        *,
        farms ( name ),
        fields ( name ),
        forms ( name )
      `)
      .eq("form_id", formId)
      .eq("status", "draft")
      .order("updated_at", { ascending: false })
      .maybeSingle()

    if (error || !data) return null

    const snapshot = (data.form_schema_snapshot && typeof data.form_schema_snapshot === "object"
      ? data.form_schema_snapshot
      : {}) as unknown as FormSchema

    const farmObj = data.farms as unknown as { name: string } | null
    const fieldObj = data.fields as unknown as { name: string } | null
    const formObj = data.forms as unknown as { name: string } | null

    return {
      id: data.id,
      ownerId: data.owner_id,
      formId: data.form_id,
      farmId: data.farm_id,
      fieldId: data.field_id,
      formSchemaSnapshot: snapshot,
      responses: (data.responses && typeof data.responses === "object" ? data.responses : {}) as Record<string, unknown>,
      status: "draft",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      farmName: farmObj?.name || "General / Archived Farm",
      fieldName: fieldObj?.name || undefined,
      formName: formObj?.name || snapshot?.name || "Form Submission",
    }
  }

  async getSubmissionById(id: string): Promise<FormSubmissionRecord | null> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { data, error } = await supabase
      .from("form_submissions")
      .select(`
        *,
        farms ( name ),
        fields ( name ),
        forms ( name )
      `)
      .eq("id", id)
      .maybeSingle()

    if (error) throw new Error(`Unable to load submission details: ${error.message}`)
    if (!data) return null

    const snapshot = (data.form_schema_snapshot && typeof data.form_schema_snapshot === "object"
      ? data.form_schema_snapshot
      : {}) as unknown as FormSchema

    const farmObj = data.farms as unknown as { name: string } | null
    const fieldObj = data.fields as unknown as { name: string } | null
    const formObj = data.forms as unknown as { name: string } | null

    return {
      id: data.id,
      ownerId: data.owner_id,
      formId: data.form_id,
      farmId: data.farm_id,
      fieldId: data.field_id,
      formSchemaSnapshot: snapshot,
      responses: (data.responses && typeof data.responses === "object" ? data.responses : {}) as Record<string, unknown>,
      status: (data.status === "draft" ? "draft" : "submitted") as "submitted" | "draft",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      farmName: farmObj?.name || undefined,
      fieldName: fieldObj?.name || undefined,
      formName: formObj?.name || snapshot?.name || "Form Submission",
    }
  }

  async getSubmissionsByFarm(farmId: string): Promise<FormSubmissionRecord[]> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { data, error } = await supabase
      .from("form_submissions")
      .select(`
        *,
        farms ( name ),
        fields ( name ),
        forms ( name )
      `)
      .eq("farm_id", farmId)
      .order("created_at", { ascending: false })

    if (error) throw new Error(`Unable to load farm submissions: ${error.message}`)

    return (data || []).map((row) => {
      const snapshot = (row.form_schema_snapshot && typeof row.form_schema_snapshot === "object"
        ? row.form_schema_snapshot
        : {}) as unknown as FormSchema

      const farmObj = row.farms as unknown as { name: string } | null
      const fieldObj = row.fields as unknown as { name: string } | null
      const formObj = row.forms as unknown as { name: string } | null

      return {
        id: row.id,
        ownerId: row.owner_id,
        formId: row.form_id,
        farmId: row.farm_id,
        fieldId: row.field_id,
        formSchemaSnapshot: snapshot,
        responses: (row.responses && typeof row.responses === "object" ? row.responses : {}) as Record<string, unknown>,
        status: (row.status === "draft" ? "draft" : "submitted") as "submitted" | "draft",
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        farmName: farmObj?.name || undefined,
        fieldName: fieldObj?.name || undefined,
        formName: formObj?.name || snapshot?.name || "Form Submission",
      }
    })
  }

  async createSubmission(payload: {
    formId?: string | null
    farmId?: string | null
    fieldId?: string | null
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
          farms ( name ),
          fields ( name ),
          forms ( name )
        `)
        .eq("client_submission_id", payload.clientSubmissionId)
        .maybeSingle()

      if (existing) {
        const farmObj = existing.farms as unknown as { name: string } | null
        const fieldObj = existing.fields as unknown as { name: string } | null
        const formObj = existing.forms as unknown as { name: string } | null

        return {
          id: existing.id,
          ownerId: existing.owner_id,
          formId: existing.form_id,
          farmId: existing.farm_id,
          fieldId: existing.field_id,
          formSchemaSnapshot: payload.schemaSnapshot,
          responses: (existing.responses && typeof existing.responses === "object" ? existing.responses : {}) as Record<string, unknown>,
          status: (existing.status === "draft" ? "draft" : "submitted") as "submitted" | "draft",
          createdAt: existing.created_at,
          updatedAt: existing.updated_at,
          farmName: farmObj?.name || "General / Archived Farm",
          fieldName: fieldObj?.name || undefined,
          formName: formObj?.name || payload.schemaSnapshot?.name || "Form Submission",
        }
      }
    }

    const { data, error } = await supabase
      .from("form_submissions")
      .insert({
        owner_id: session.user.id,
        form_id: payload.formId || null,
        farm_id: payload.farmId || null,
        field_id: payload.fieldId || null,
        client_submission_id: payload.clientSubmissionId || null,
        form_schema_snapshot: payload.schemaSnapshot as unknown as Json,
        responses: payload.responses as unknown as Json,
        status: payload.status || "submitted",
      })
      .select(`
        *,
        farms ( name ),
        fields ( name ),
        forms ( name )
      `)
      .single()

    if (error) throw new Error(`Unable to save form submission: ${error.message}`)

    const farmObj = data.farms as unknown as { name: string } | null
    const fieldObj = data.fields as unknown as { name: string } | null
    const formObj = data.forms as unknown as { name: string } | null

    return {
      id: data.id,
      ownerId: data.owner_id,
      formId: data.form_id,
      farmId: data.farm_id,
      fieldId: data.field_id,
      formSchemaSnapshot: payload.schemaSnapshot,
      responses: payload.responses,
      status: (data.status === "draft" ? "draft" : "submitted") as "submitted" | "draft",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      farmName: farmObj?.name || undefined,
      fieldName: fieldObj?.name || undefined,
      formName: formObj?.name || payload.schemaSnapshot?.name || "Form Submission",
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
        farms ( name ),
        fields ( name ),
        forms ( name )
      `)
      .single()

    if (error) throw new Error(`Unable to update submission: ${error.message}`)

    const snapshot = (data.form_schema_snapshot && typeof data.form_schema_snapshot === "object"
      ? data.form_schema_snapshot
      : {}) as unknown as FormSchema

    const farmObj = data.farms as unknown as { name: string } | null
    const fieldObj = data.fields as unknown as { name: string } | null
    const formObj = data.forms as unknown as { name: string } | null

    return {
      id: data.id,
      ownerId: data.owner_id,
      formId: data.form_id,
      farmId: data.farm_id,
      fieldId: data.field_id,
      formSchemaSnapshot: snapshot,
      responses: (data.responses && typeof data.responses === "object" ? data.responses : {}) as Record<string, unknown>,
      status: (data.status === "draft" ? "draft" : "submitted") as "submitted" | "draft",
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      farmName: farmObj?.name || undefined,
      fieldName: fieldObj?.name || undefined,
      formName: formObj?.name || snapshot?.name || "Form Submission",
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
