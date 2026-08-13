import { getSupabaseClient } from "@/lib/supabase/client"
import { Database } from "@/lib/supabase/database.types"

export type Farm = Database["public"]["Tables"]["farms"]["Row"]
export type FarmInsert = Database["public"]["Tables"]["farms"]["Insert"]
export type FarmUpdate = Database["public"]["Tables"]["farms"]["Update"]

export type Field = Database["public"]["Tables"]["fields"]["Row"]
export type FieldInsert = Database["public"]["Tables"]["fields"]["Insert"]
export type FieldUpdate = Database["public"]["Tables"]["fields"]["Update"]

export class SupabaseFarmRepository {
  async getFarms(): Promise<Farm[]> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { data, error } = await supabase
      .from("farms")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) throw new Error(`Unable to load your farms: ${error.message}`)
    return data || []
  }

  async getFarmById(id: string): Promise<Farm | null> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { data, error } = await supabase
      .from("farms")
      .select("*")
      .eq("id", id)
      .maybeSingle()

    if (error) throw new Error(`Unable to load farm details: ${error.message}`)
    return data
  }

  async createFarm(name: string, description?: string): Promise<Farm> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) throw new Error("You must be authenticated to create a farm.")

    const { data, error } = await supabase
      .from("farms")
      .insert({
        owner_id: session.user.id,
        name: name.trim(),
        description: description?.trim() || null,
      })
      .select()
      .single()

    if (error) throw new Error(`Unable to create farm: ${error.message}`)
    return data
  }

  async updateFarm(id: string, name: string, description?: string): Promise<Farm> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { data, error } = await supabase
      .from("farms")
      .update({
        name: name.trim(),
        description: description?.trim() || null,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(`Unable to update farm: ${error.message}`)
    return data
  }

  async deleteFarm(id: string): Promise<void> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { error } = await supabase
      .from("farms")
      .delete()
      .eq("id", id)

    if (error) throw new Error(`Unable to delete farm: ${error.message}`)
  }

  // FIELD OPERATIONS
  async getFieldsByFarmId(farmId: string): Promise<Field[]> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { data, error } = await supabase
      .from("fields")
      .select("*")
      .eq("farm_id", farmId)
      .order("created_at", { ascending: false })

    if (error) throw new Error(`Unable to load fields: ${error.message}`)
    return data || []
  }

  async createField(
    farmId: string,
    name: string,
    area?: number | null,
    areaUnit: string = "hectares",
    description?: string
  ): Promise<Field> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { data, error } = await supabase
      .from("fields")
      .insert({
        farm_id: farmId,
        name: name.trim(),
        area: area ?? null,
        area_unit: areaUnit,
        description: description?.trim() || null,
      })
      .select()
      .single()

    if (error) throw new Error(`Unable to create field: ${error.message}`)
    return data
  }

  async updateField(
    id: string,
    name: string,
    area?: number | null,
    areaUnit: string = "hectares",
    description?: string
  ): Promise<Field> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { data, error } = await supabase
      .from("fields")
      .update({
        name: name.trim(),
        area: area ?? null,
        area_unit: areaUnit,
        description: description?.trim() || null,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(`Unable to update field: ${error.message}`)
    return data
  }

  async deleteField(id: string): Promise<void> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { error } = await supabase
      .from("fields")
      .delete()
      .eq("id", id)

    if (error) throw new Error(`Unable to delete field: ${error.message}`)
  }
}

export const supabaseFarmRepository = new SupabaseFarmRepository()
