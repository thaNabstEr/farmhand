import { getSupabaseClient } from "@/lib/supabase/client"
import { Database } from "@/lib/supabase/database.types"

export type Farmer = Database["public"]["Tables"]["farmers"]["Row"]
export type FarmerInsert = Database["public"]["Tables"]["farmers"]["Insert"]
export type FarmerUpdate = Database["public"]["Tables"]["farmers"]["Update"]

export interface FarmerWithFarms extends Farmer {
  farmsCount?: number
  farms?: { id: string; name: string }[]
}

export class SupabaseFarmerRepository {
  async getFarmers(): Promise<FarmerWithFarms[]> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { data, error } = await supabase
      .from("farmers")
      .select(`
        *,
        farms ( id, name )
      `)
      .order("created_at", { ascending: false })

    if (error) throw new Error(`Unable to load your farmers: ${error.message}`)

    return (data || []).map((row) => {
      const farmsList = (row.farms as unknown as { id: string; name: string }[]) || []
      return {
        id: row.id,
        owner_id: row.owner_id,
        first_name: row.first_name,
        last_name: row.last_name,
        phone: row.phone,
        email: row.email,
        national_id: row.national_id,
        community: row.community,
        village: row.village,
        created_at: row.created_at,
        updated_at: row.updated_at,
        farmsCount: farmsList.length,
        farms: farmsList,
      }
    })
  }

  async getFarmerById(id: string): Promise<FarmerWithFarms | null> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { data, error } = await supabase
      .from("farmers")
      .select(`
        *,
        farms ( id, name, description, created_at )
      `)
      .eq("id", id)
      .maybeSingle()

    if (error) throw new Error(`Unable to load farmer details: ${error.message}`)
    if (!data) return null

    const farmsList = (data.farms as unknown as { id: string; name: string }[]) || []
    return {
      id: data.id,
      owner_id: data.owner_id,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      email: data.email,
      national_id: data.national_id,
      community: data.community,
      village: data.village,
      created_at: data.created_at,
      updated_at: data.updated_at,
      farmsCount: farmsList.length,
      farms: farmsList,
    }
  }

  async createFarmer(payload: {
    first_name: string
    last_name: string
    phone?: string | null
    email?: string | null
    national_id?: string | null
    community?: string | null
    village?: string | null
  }): Promise<Farmer> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) throw new Error("You must be authenticated to create a farmer record.")

    const { data, error } = await supabase
      .from("farmers")
      .insert({
        owner_id: session.user.id,
        first_name: payload.first_name.trim(),
        last_name: payload.last_name.trim(),
        phone: payload.phone?.trim() || null,
        email: payload.email?.trim() || null,
        national_id: payload.national_id?.trim() || null,
        community: payload.community?.trim() || null,
        village: payload.village?.trim() || null,
      })
      .select()
      .single()

    if (error) throw new Error(`Unable to create farmer: ${error.message}`)
    return data
  }

  async updateFarmer(
    id: string,
    payload: {
      first_name?: string
      last_name?: string
      phone?: string | null
      email?: string | null
      national_id?: string | null
      community?: string | null
      village?: string | null
    }
  ): Promise<Farmer> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const updateData: Partial<FarmerUpdate> = {}
    if (payload.first_name !== undefined) updateData.first_name = payload.first_name.trim()
    if (payload.last_name !== undefined) updateData.last_name = payload.last_name.trim()
    if (payload.phone !== undefined) updateData.phone = payload.phone?.trim() || null
    if (payload.email !== undefined) updateData.email = payload.email?.trim() || null
    if (payload.national_id !== undefined) updateData.national_id = payload.national_id?.trim() || null
    if (payload.community !== undefined) updateData.community = payload.community?.trim() || null
    if (payload.village !== undefined) updateData.village = payload.village?.trim() || null

    const { data, error } = await supabase
      .from("farmers")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) throw new Error(`Unable to update farmer: ${error.message}`)
    return data
  }

  async deleteFarmer(id: string): Promise<void> {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { error } = await supabase
      .from("farmers")
      .delete()
      .eq("id", id)

    if (error) throw new Error(`Unable to delete farmer: ${error.message}`)
  }

  async searchFarmers(query: string): Promise<FarmerWithFarms[]> {
    const farmers = await this.getFarmers()
    if (!query.trim()) return farmers

    const q = query.toLowerCase().trim()
    return farmers.filter((f) => {
      const fullName = `${f.first_name} ${f.last_name}`.toLowerCase()
      const phone = f.phone?.toLowerCase() || ""
      const email = f.email?.toLowerCase() || ""
      const natId = f.national_id?.toLowerCase() || ""
      const community = f.community?.toLowerCase() || ""
      const village = f.village?.toLowerCase() || ""

      return (
        fullName.includes(q) ||
        phone.includes(q) ||
        email.includes(q) ||
        natId.includes(q) ||
        community.includes(q) ||
        village.includes(q)
      )
    })
  }

  async getFarmsByFarmerId(farmerId: string) {
    const supabase = getSupabaseClient()
    if (!supabase) throw new Error("Supabase is not configured in this environment.")

    const { data, error } = await supabase
      .from("farms")
      .select("*")
      .eq("farmer_id", farmerId)
      .order("created_at", { ascending: false })

    if (error) throw new Error(`Unable to load farmer's farms: ${error.message}`)
    return data || []
  }
}

export const supabaseFarmerRepository = new SupabaseFarmerRepository()
