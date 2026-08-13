import { getSupabaseClient } from "@/lib/supabase/client"
import { Database, Json } from "@/lib/supabase/database.types"
import { FormSchema, Field } from "@/form-builder/types"
import { FormMetadata, FormStatus } from "./types"

export type FormRow = Database["public"]["Tables"]["forms"]["Row"]

export class SupabaseFormRepository {
  /**
   * Validate and hydrate raw JSON into a safe FormSchema.
   */
  validateFormSchema(rawJson: unknown, defaultId: string, defaultName: string, defaultDesc: string): FormSchema | null {
    if (!rawJson || typeof rawJson !== "object") return null

    const obj = rawJson as Record<string, unknown>

    const version = typeof obj.version === "number" ? obj.version : 1
    const name = typeof obj.name === "string" ? obj.name : defaultName
    const description = typeof obj.description === "string" ? obj.description : defaultDesc
    const createdAt = typeof obj.createdAt === "string" ? obj.createdAt : new Date().toISOString()
    const updatedAt = typeof obj.updatedAt === "string" ? obj.updatedAt : new Date().toISOString()

    const rawFields = Array.isArray(obj.fields) ? obj.fields : []

    // Ensure fields array is populated with valid Field objects
    const fields: Field[] = rawFields.map((f: unknown, index: number) => {
      const fieldObj = (f && typeof f === "object" ? f : {}) as Record<string, unknown>
      return {
        id: typeof fieldObj.id === "string" ? fieldObj.id : `field-${Date.now()}-${index}`,
        type: typeof fieldObj.type === "string" ? (fieldObj.type as Field["type"]) : "text",
        label: typeof fieldObj.label === "string" ? fieldObj.label : `Field ${index + 1}`,
        description: typeof fieldObj.description === "string" ? fieldObj.description : "",
        placeholder: typeof fieldObj.placeholder === "string" ? fieldObj.placeholder : undefined,
        required: Boolean(fieldObj.required),
        settings: fieldObj.settings && typeof fieldObj.settings === "object" ? (fieldObj.settings as Field["settings"]) : undefined,
        validation: fieldObj.validation && typeof fieldObj.validation === "object" ? (fieldObj.validation as Field["validation"]) : undefined,
        logic: fieldObj.logic && typeof fieldObj.logic === "object" ? (fieldObj.logic as Field["logic"]) : undefined,
        calculation: fieldObj.calculation && typeof fieldObj.calculation === "object" ? (fieldObj.calculation as Field["calculation"]) : undefined,
      }
    })

    return {
      id: defaultId,
      name,
      description,
      version,
      createdAt,
      updatedAt,
      fields,
    }
  }

  /**
   * Retrieve metadata for all forms owned by authenticated user.
   */
  async getForms(): Promise<FormMetadata[]> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { data, error } = await supabase
      .from("forms")
      .select("id, name, description, form_schema, created_at, updated_at")
      .order("updated_at", { ascending: false })

    if (error) throw new Error(`Unable to load your forms: ${error.message}`)

    return (data || []).map((row) => {
      let fieldCount = 0
      if (row.form_schema && typeof row.form_schema === "object") {
        const schemaObj = row.form_schema as Record<string, unknown>
        if (Array.isArray(schemaObj.fields)) {
          fieldCount = schemaObj.fields.length
        }
      }

      return {
        id: row.id,
        name: row.name,
        description: row.description || "",
        status: "draft" as FormStatus,
        fieldCount,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        schemaVersion: 1,
      }
    })
  }

  /**
   * Retrieve a single form by ID and hydrate full FormSchema.
   */
  async getFormById(id: string): Promise<FormSchema | null> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { data, error } = await supabase
      .from("forms")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) throw new Error(`Unable to load form template: ${error.message}`)
    if (!data) return null

    const schema = this.validateFormSchema(data.form_schema, data.id, data.name, data.description || "")
    if (!schema) {
      throw new Error("This form could not be loaded because its structure is invalid.")
    }

    return schema
  }

  /**
   * Create a new form template in Supabase.
   */
  async createForm(initial?: Partial<FormSchema>): Promise<FormSchema> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) throw new Error("You must be authenticated to create a form template.")

    const formName = initial?.name?.trim() || "Untitled Form"
    const formDesc = initial?.description?.trim() || ""

    const schemaToSave: FormSchema = {
      id: "pending",
      name: formName,
      description: formDesc,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fields: initial?.fields || [],
    }

    const { data, error } = await supabase
      .from("forms")
      .insert({
        owner_id: session.user.id,
        name: formName,
        description: formDesc || null,
        form_schema: schemaToSave as unknown as Json,
      })
      .select()
      .single()

    if (error) throw new Error(`Unable to save form template: ${error.message}`)

    const savedSchema: FormSchema = {
      ...schemaToSave,
      id: data.id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }

    // Ensure the saved form_schema JSON inside database has the real UUID ID
    await supabase
      .from("forms")
      .update({ form_schema: savedSchema as unknown as Json })
      .eq("id", data.id)

    return savedSchema
  }

  /**
   * Update an existing form template in Supabase.
   */
  async updateForm(schema: FormSchema): Promise<FormSchema> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const updatedSchema: FormSchema = {
      ...schema,
      version: schema.version || 1,
      updatedAt: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from("forms")
      .update({
        name: schema.name.trim(),
        description: schema.description?.trim() || null,
        form_schema: updatedSchema as unknown as Json,
      })
      .eq("id", schema.id)
      .select()
      .single()

    if (error) throw new Error(`Unable to save changes to form template: ${error.message}`)

    return {
      ...updatedSchema,
      updatedAt: data.updated_at,
    }
  }

  /**
   * Delete a form template in Supabase.
   */
  async deleteForm(id: string): Promise<void> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { error } = await supabase
      .from("forms")
      .delete()
      .eq("id", id)

    if (error) throw new Error(`Unable to delete form template: ${error.message}`)
  }
}

export const supabaseFormRepository = new SupabaseFormRepository()
