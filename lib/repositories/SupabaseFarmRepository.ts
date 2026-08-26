import { getSupabaseClient } from "@/lib/supabase/client"
import { Database } from "@/lib/supabase/database.types"

export type Farm = Database["public"]["Tables"]["farms"]["Row"] & {
  farmerName?: string
}
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
      .select(`
        *,
        farmers ( first_name, last_name )
      `)
      .order("created_at", { ascending: false })

    if (error) throw new Error(`Unable to load your farms: ${error.message}`)

    return (data || []).map((row) => {
      const farmerObj = row.farmers as unknown as { first_name: string; last_name: string } | null
      const farmerName = farmerObj ? `${farmerObj.first_name} ${farmerObj.last_name}` : undefined

      return {
        id: row.id,
        owner_id: row.owner_id,
        farmer_id: row.farmer_id,
        name: row.name,
        description: row.description,
        created_at: row.created_at,
        updated_at: row.updated_at,
        farmerName,
      }
    })
  }

  async getFarmById(id: string): Promise<Farm | null> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { data, error } = await supabase
      .from("farms")
      .select(`
        *,
        farmers ( first_name, last_name )
      `)
      .eq("id", id)
      .maybeSingle()

    if (error) throw new Error(`Unable to load farm details: ${error.message}`)
    if (!data) return null

    const farmerObj = data.farmers as unknown as { first_name: string; last_name: string } | null
    const farmerName = farmerObj ? `${farmerObj.first_name} ${farmerObj.last_name}` : undefined

    return {
      id: data.id,
      owner_id: data.owner_id,
      farmer_id: data.farmer_id,
      name: data.name,
      description: data.description,
      created_at: data.created_at,
      updated_at: data.updated_at,
      farmerName,
    }
  }

  async createFarm(name: string, description?: string, farmerId?: string | null): Promise<Farm> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) throw new Error("You must be authenticated to create a farm.")

    const { data, error } = await supabase
      .from("farms")
      .insert({
        owner_id: session.user.id,
        farmer_id: farmerId || null,
        name: name.trim(),
        description: description?.trim() || null,
      })
      .select(`
        *,
        farmers ( first_name, last_name )
      `)
      .single()

    if (error) throw new Error(`Unable to create farm: ${error.message}`)

    const farmerObj = data.farmers as unknown as { first_name: string; last_name: string } | null
    const farmerName = farmerObj ? `${farmerObj.first_name} ${farmerObj.last_name}` : undefined

    return {
      id: data.id,
      owner_id: data.owner_id,
      farmer_id: data.farmer_id,
      name: data.name,
      description: data.description,
      created_at: data.created_at,
      updated_at: data.updated_at,
      farmerName,
    }
  }

  async updateFarm(id: string, name: string, description?: string, farmerId?: string | null): Promise<Farm> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const updatePayload: Partial<FarmUpdate> = {
      name: name.trim(),
      description: description?.trim() || null,
    }
    if (farmerId !== undefined) {
      updatePayload.farmer_id = farmerId || null
    }

    const { data, error } = await supabase
      .from("farms")
      .update(updatePayload)
      .eq("id", id)
      .select(`
        *,
        farmers ( first_name, last_name )
      `)
      .single()

    if (error) throw new Error(`Unable to update farm: ${error.message}`)

    const farmerObj = data.farmers as unknown as { first_name: string; last_name: string } | null
    const farmerName = farmerObj ? `${farmerObj.first_name} ${farmerObj.last_name}` : undefined

    return {
      id: data.id,
      owner_id: data.owner_id,
      farmer_id: data.farmer_id,
      name: data.name,
      description: data.description,
      created_at: data.created_at,
      updated_at: data.updated_at,
      farmerName,
    }
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
