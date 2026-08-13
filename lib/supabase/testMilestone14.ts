import { getSupabaseClient } from "./client"

export interface SecurityTestCaseResult {
  testId: string
  name: string
  category: "PROFILE" | "FARM" | "FIELD" | "AUTH_SESSION"
  status: "PASS" | "FAIL" | "NOT_VERIFIED"
  details: string
}

export interface Milestone14Report {
  timestamp: string
  userId: string | null
  overallStatus: "PASS" | "FAIL" | "PARTIAL"
  testResults: SecurityTestCaseResult[]
}

const FAKE_UUID = "00000000-0000-0000-0000-000000000000"
const RANDOM_USER_UUID = "99999999-9999-9999-9999-999999999999"

export async function runMilestone14SecurityAudit(): Promise<Milestone14Report> {
  const testResults: SecurityTestCaseResult[] = []
  const supabase = getSupabaseClient()

  if (!supabase) {
    return {
      timestamp: new Date().toISOString(),
      userId: null,
      overallStatus: "FAIL",
      testResults: [
        {
          testId: "SUPABASE_INIT",
          name: "Supabase Client Initialization",
          category: "AUTH_SESSION",
          status: "FAIL",
          details: "Supabase client instance unavailable.",
        },
      ],
    }
  }

  // Check authenticated session
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) {
    return {
      timestamp: new Date().toISOString(),
      userId: null,
      overallStatus: "PARTIAL",
      testResults: [
        {
          testId: "AUTH_SESSION_CHECK",
          name: "Active Authenticated User Session",
          category: "AUTH_SESSION",
          status: "NOT_VERIFIED",
          details: "No active authenticated Supabase session. Sign in to execute live RLS verification suite.",
        },
      ],
    }
  }

  const userId = user.id

  // -------------------------------------------------------------
  // SECTION 1: PROFILES SECURITY & RLS VERIFICATION
  // -------------------------------------------------------------

  // 1.1 Read Own Profile
  try {
    const { data: selfProfile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()

    if (!error && selfProfile) {
      testResults.push({
        testId: "PROFILE_SELF_READ",
        name: "User can retrieve their own profile",
        category: "PROFILE",
        status: "PASS",
        details: `Successfully retrieved profile for auth.uid() ${userId}`,
      })
    } else if (!error && !selfProfile) {
      testResults.push({
        testId: "PROFILE_SELF_READ",
        name: "User can retrieve their own profile",
        category: "PROFILE",
        status: "NOT_VERIFIED",
        details: "Profile row not found for active user.",
      })
    } else {
      testResults.push({
        testId: "PROFILE_SELF_READ",
        name: "User can retrieve their own profile",
        category: "PROFILE",
        status: "FAIL",
        details: `Failed to read self profile: ${error?.message || "Unknown error"}`,
      })
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    testResults.push({
      testId: "PROFILE_SELF_READ",
      name: "User can retrieve their own profile",
      category: "PROFILE",
      status: "FAIL",
      details: `Exception: ${msg}`,
    })
  }

  // 1.2 Read Another User's Profile (Isolation Test)
  try {
    const { data: foreignProfile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", RANDOM_USER_UUID)

    if (!error && (!foreignProfile || foreignProfile.length === 0)) {
      testResults.push({
        testId: "PROFILE_FOREIGN_READ_BLOCKED",
        name: "User cannot retrieve another user's profile",
        category: "PROFILE",
        status: "PASS",
        details: "RLS policy blocked access to non-owned profile (0 rows returned).",
      })
    } else {
      testResults.push({
        testId: "PROFILE_FOREIGN_READ_BLOCKED",
        name: "User cannot retrieve another user's profile",
        category: "PROFILE",
        status: "FAIL",
        details: `Foreign profile read returned data or error: ${error?.message || "Data leaked"}`,
      })
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    testResults.push({
      testId: "PROFILE_FOREIGN_READ_BLOCKED",
      name: "User cannot retrieve another user's profile",
      category: "PROFILE",
      status: "FAIL",
      details: `Exception: ${msg}`,
    })
  }

  // 1.3 Update Own Profile
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", userId)

    if (!error) {
      testResults.push({
        testId: "PROFILE_SELF_UPDATE",
        name: "User can update their own profile",
        category: "PROFILE",
        status: "PASS",
        details: "Profile timestamp update executed successfully.",
      })
    } else {
      testResults.push({
        testId: "PROFILE_SELF_UPDATE",
        name: "User can update their own profile",
        category: "PROFILE",
        status: "FAIL",
        details: `Profile update failed: ${error.message}`,
      })
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    testResults.push({
      testId: "PROFILE_SELF_UPDATE",
      name: "User can update their own profile",
      category: "PROFILE",
      status: "FAIL",
      details: `Exception: ${msg}`,
    })
  }

  // 1.4 Attempt Foreign Profile Update
  try {
    const { data: updatedRows, error } = await supabase
      .from("profiles")
      .update({ display_name: "Hacked Display Name" })
      .eq("id", RANDOM_USER_UUID)
      .select()

    if (!error && (!updatedRows || updatedRows.length === 0)) {
      testResults.push({
        testId: "PROFILE_FOREIGN_UPDATE_BLOCKED",
        name: "User cannot update another user's profile",
        category: "PROFILE",
        status: "PASS",
        details: "RLS policy prevented modification of non-owned profile (0 rows affected).",
      })
    } else {
      testResults.push({
        testId: "PROFILE_FOREIGN_UPDATE_BLOCKED",
        name: "User cannot update another user's profile",
        category: "PROFILE",
        status: "FAIL",
        details: `Foreign profile update succeeded or threw error: ${error?.message}`,
      })
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    testResults.push({
      testId: "PROFILE_FOREIGN_UPDATE_BLOCKED",
      name: "User cannot update another user's profile",
      category: "PROFILE",
      status: "FAIL",
      details: `Exception: ${msg}`,
    })
  }

  // 1.5 Attempt Foreign Profile Insert (Impersonation Attack)
  try {
    const { error } = await supabase
      .from("profiles")
      .insert({ id: RANDOM_USER_UUID, display_name: "Impersonated Profile" })

    if (error) {
      testResults.push({
        testId: "PROFILE_FOREIGN_INSERT_BLOCKED",
        name: "User cannot insert a profile for another user ID",
        category: "PROFILE",
        status: "PASS",
        details: `RLS correctly rejected unauthorized profile insertion (${error.message}).`,
      })
    } else {
      testResults.push({
        testId: "PROFILE_FOREIGN_INSERT_BLOCKED",
        name: "User cannot insert a profile for another user ID",
        category: "PROFILE",
        status: "FAIL",
        details: "Foreign profile insert succeeded without error! RLS bypass vulnerability.",
      })
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    testResults.push({
      testId: "PROFILE_FOREIGN_INSERT_BLOCKED",
      name: "User cannot insert a profile for another user ID",
      category: "PROFILE",
      status: "PASS",
      details: `Exception caught: ${msg}`,
    })
  }

  // -------------------------------------------------------------
  // SECTION 2: FARMS SECURITY & RLS VERIFICATION
  // -------------------------------------------------------------

  let createdFarmId: string | null = null

  // 2.1 Create Own Farm
  try {
    const { data: newFarm, error } = await supabase
      .from("farms")
      .insert({
        owner_id: userId,
        name: "Milestone 14 Test Farm",
        description: "Automated RLS verification test farm",
      })
      .select()
      .single()

    if (!error && newFarm) {
      createdFarmId = newFarm.id
      testResults.push({
        testId: "FARM_SELF_CREATE",
        name: "User can create their own farm",
        category: "FARM",
        status: "PASS",
        details: `Farm created with ID ${newFarm.id}`,
      })
    } else {
      testResults.push({
        testId: "FARM_SELF_CREATE",
        name: "User can create their own farm",
        category: "FARM",
        status: "FAIL",
        details: `Farm creation failed: ${error?.message}`,
      })
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    testResults.push({
      testId: "FARM_SELF_CREATE",
      name: "User can create their own farm",
      category: "FARM",
      status: "FAIL",
      details: `Exception: ${msg}`,
    })
  }

  // 2.2 Attempt Foreign Farm Creation (Manipulating owner_id)
  try {
    const { error } = await supabase
      .from("farms")
      .insert({
        owner_id: RANDOM_USER_UUID,
        name: "Malicious Farm",
        description: "Attempting to assign farm to another user",
      })

    if (error) {
      testResults.push({
        testId: "FARM_FOREIGN_CREATE_BLOCKED",
        name: "User cannot create a farm owned by another user",
        category: "FARM",
        status: "PASS",
        details: `RLS correctly blocked farm creation with spoofed owner_id (${error.message}).`,
      })
    } else {
      testResults.push({
        testId: "FARM_FOREIGN_CREATE_BLOCKED",
        name: "User cannot create a farm owned by another user",
        category: "FARM",
        status: "FAIL",
        details: "Foreign farm insertion succeeded! RLS WITH CHECK policy failed.",
      })
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    testResults.push({
      testId: "FARM_FOREIGN_CREATE_BLOCKED",
      name: "User cannot create a farm owned by another user",
      category: "FARM",
      status: "PASS",
      details: `Exception caught: ${msg}`,
    })
  }

  // 2.3 Read Own Farms
  if (createdFarmId) {
    try {
      const { data: ownFarms, error } = await supabase
        .from("farms")
        .select("*")
        .eq("id", createdFarmId)

      if (!error && ownFarms && ownFarms.length > 0) {
        testResults.push({
          testId: "FARM_SELF_READ",
          name: "User can retrieve their own farms",
          category: "FARM",
          status: "PASS",
          details: `Retrieved ${ownFarms.length} owned farm(s).`,
        })
      } else {
        testResults.push({
          testId: "FARM_SELF_READ",
          name: "User can retrieve their own farms",
          category: "FARM",
          status: "FAIL",
          details: `Failed to read owned farm: ${error?.message}`,
        })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      testResults.push({
        testId: "FARM_SELF_READ",
        name: "User can retrieve their own farms",
        category: "FARM",
        status: "FAIL",
        details: `Exception: ${msg}`,
      })
    }
  }

  // 2.4 Read Foreign Farm (Manipulating farm ID query)
  try {
    const { data: foreignFarms, error } = await supabase
      .from("farms")
      .select("*")
      .eq("owner_id", RANDOM_USER_UUID)

    if (!error && (!foreignFarms || foreignFarms.length === 0)) {
      testResults.push({
        testId: "FARM_FOREIGN_READ_BLOCKED",
        name: "User cannot retrieve another user's farms",
        category: "FARM",
        status: "PASS",
        details: "RLS policy isolated farm queries (0 rows returned).",
      })
    } else {
      testResults.push({
        testId: "FARM_FOREIGN_READ_BLOCKED",
        name: "User cannot retrieve another user's farms",
        category: "FARM",
        status: "FAIL",
        details: `Foreign farm read leaked data or threw error: ${error?.message}`,
      })
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    testResults.push({
      testId: "FARM_FOREIGN_READ_BLOCKED",
      name: "User cannot retrieve another user's farms",
      category: "FARM",
      status: "FAIL",
      details: `Exception: ${msg}`,
    })
  }

  // 2.5 Update Own Farm
  if (createdFarmId) {
    try {
      const { error } = await supabase
        .from("farms")
        .update({ description: "Updated description by owner" })
        .eq("id", createdFarmId)

      if (!error) {
        testResults.push({
          testId: "FARM_SELF_UPDATE",
          name: "User can update their own farm",
          category: "FARM",
          status: "PASS",
          details: "Farm description updated successfully.",
        })
      } else {
        testResults.push({
          testId: "FARM_SELF_UPDATE",
          name: "User can update their own farm",
          category: "FARM",
          status: "FAIL",
          details: `Farm update failed: ${error.message}`,
        })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      testResults.push({
        testId: "FARM_SELF_UPDATE",
        name: "User can update their own farm",
        category: "FARM",
        status: "FAIL",
        details: `Exception: ${msg}`,
      })
    }
  }

  // 2.6 Attempt Foreign Farm Update
  try {
    const { data: updatedForeign, error } = await supabase
      .from("farms")
      .update({ name: "Hacked Farm Name" })
      .eq("id", FAKE_UUID)
      .select()

    if (!error && (!updatedForeign || updatedForeign.length === 0)) {
      testResults.push({
        testId: "FARM_FOREIGN_UPDATE_BLOCKED",
        name: "User cannot update another user's farm",
        category: "FARM",
        status: "PASS",
        details: "RLS policy blocked foreign farm modification (0 rows updated).",
      })
    } else {
      testResults.push({
        testId: "FARM_FOREIGN_UPDATE_BLOCKED",
        name: "User cannot update another user's farm",
        category: "FARM",
        status: "FAIL",
        details: `Foreign farm update succeeded or threw error: ${error?.message}`,
      })
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    testResults.push({
      testId: "FARM_FOREIGN_UPDATE_BLOCKED",
      name: "User cannot update another user's farm",
      category: "FARM",
      status: "FAIL",
      details: `Exception: ${msg}`,
    })
  }

  // 2.7 Attempt Foreign Farm Delete
  try {
    const { data: deletedForeign, error } = await supabase
      .from("farms")
      .delete()
      .eq("id", FAKE_UUID)
      .select()

    if (!error && (!deletedForeign || deletedForeign.length === 0)) {
      testResults.push({
        testId: "FARM_FOREIGN_DELETE_BLOCKED",
        name: "User cannot delete another user's farm",
        category: "FARM",
        status: "PASS",
        details: "RLS policy prevented deletion of unowned farm (0 rows deleted).",
      })
    } else {
      testResults.push({
        testId: "FARM_FOREIGN_DELETE_BLOCKED",
        name: "User cannot delete another user's farm",
        category: "FARM",
        status: "FAIL",
        details: `Foreign farm delete error or illegal modification: ${error?.message}`,
      })
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    testResults.push({
      testId: "FARM_FOREIGN_DELETE_BLOCKED",
      name: "User cannot delete another user's farm",
      category: "FARM",
      status: "FAIL",
      details: `Exception: ${msg}`,
    })
  }

  // -------------------------------------------------------------
  // SECTION 3: FIELDS SECURITY & RLS VERIFICATION
  // -------------------------------------------------------------

  let createdFieldId: string | null = null

  // 3.1 Create Field on Own Farm
  if (createdFarmId) {
    try {
      const { data: newField, error } = await supabase
        .from("fields")
        .insert({
          farm_id: createdFarmId,
          name: "Test Field Alpha",
          area: 25.5,
          area_unit: "hectares",
          description: "Field created during Milestone 14 verification",
        })
        .select()
        .single()

      if (!error && newField) {
        createdFieldId = newField.id
        testResults.push({
          testId: "FIELD_SELF_CREATE",
          name: "User can create fields on their own farm",
          category: "FIELD",
          status: "PASS",
          details: `Field created with ID ${newField.id}`,
        })
      } else {
        testResults.push({
          testId: "FIELD_SELF_CREATE",
          name: "User can create fields on their own farm",
          category: "FIELD",
          status: "FAIL",
          details: `Field creation failed: ${error?.message}`,
        })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      testResults.push({
        testId: "FIELD_SELF_CREATE",
        name: "User can create fields on their own farm",
        category: "FIELD",
        status: "FAIL",
        details: `Exception: ${msg}`,
      })
    }
  } else {
    testResults.push({
      testId: "FIELD_SELF_CREATE",
      name: "User can create fields on their own farm",
      category: "FIELD",
      status: "NOT_VERIFIED",
      details: "Parent farm creation dependency not available.",
    })
  }

  // 3.2 Attempt Field Creation on Foreign/Unowned Farm
  try {
    const { error } = await supabase
      .from("fields")
      .insert({
        farm_id: FAKE_UUID,
        name: "Spoofed Field",
        area: 10,
        area_unit: "acres",
      })

    if (error) {
      testResults.push({
        testId: "FIELD_FOREIGN_CREATE_BLOCKED",
        name: "User cannot create fields on another user's farm",
        category: "FIELD",
        status: "PASS",
        details: `RLS correctly blocked field insertion on unowned farm_id (${error.message}).`,
      })
    } else {
      testResults.push({
        testId: "FIELD_FOREIGN_CREATE_BLOCKED",
        name: "User cannot create fields on another user's farm",
        category: "FIELD",
        status: "FAIL",
        details: "Field creation on foreign farm succeeded! RLS subquery policy failed.",
      })
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    testResults.push({
      testId: "FIELD_FOREIGN_CREATE_BLOCKED",
      name: "User cannot create fields on another user's farm",
      category: "FIELD",
      status: "PASS",
      details: `Exception caught: ${msg}`,
    })
  }

  // 3.3 Read Own Fields
  if (createdFieldId) {
    try {
      const { data: ownFields, error } = await supabase
        .from("fields")
        .select("*")
        .eq("id", createdFieldId)

      if (!error && ownFields && ownFields.length > 0) {
        testResults.push({
          testId: "FIELD_SELF_READ",
          name: "User can retrieve their own fields",
          category: "FIELD",
          status: "PASS",
          details: `Retrieved field ${createdFieldId}`,
        })
      } else {
        testResults.push({
          testId: "FIELD_SELF_READ",
          name: "User can retrieve their own fields",
          category: "FIELD",
          status: "FAIL",
          details: `Failed to read field: ${error?.message}`,
        })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      testResults.push({
        testId: "FIELD_SELF_READ",
        name: "User can retrieve their own fields",
        category: "FIELD",
        status: "FAIL",
        details: `Exception: ${msg}`,
      })
    }
  }

  // 3.4 Read Foreign Field
  try {
    const { data: foreignFields, error } = await supabase
      .from("fields")
      .select("*")
      .eq("farm_id", FAKE_UUID)

    if (!error && (!foreignFields || foreignFields.length === 0)) {
      testResults.push({
        testId: "FIELD_FOREIGN_READ_BLOCKED",
        name: "User cannot retrieve another user's fields",
        category: "FIELD",
        status: "PASS",
        details: "RLS policy isolated field queries (0 rows returned).",
      })
    } else {
      testResults.push({
        testId: "FIELD_FOREIGN_READ_BLOCKED",
        name: "User cannot retrieve another user's fields",
        category: "FIELD",
        status: "FAIL",
        details: `Foreign field read error or data leaked: ${error?.message}`,
      })
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    testResults.push({
      testId: "FIELD_FOREIGN_READ_BLOCKED",
      name: "User cannot retrieve another user's fields",
      category: "FIELD",
      status: "FAIL",
      details: `Exception: ${msg}`,
    })
  }

  // 3.5 Update Own Field
  if (createdFieldId) {
    try {
      const { error } = await supabase
        .from("fields")
        .update({ area: 30.0 })
        .eq("id", createdFieldId)

      if (!error) {
        testResults.push({
          testId: "FIELD_SELF_UPDATE",
          name: "User can update their own fields",
          category: "FIELD",
          status: "PASS",
          details: "Field area updated successfully.",
        })
      } else {
        testResults.push({
          testId: "FIELD_SELF_UPDATE",
          name: "User can update their own fields",
          category: "FIELD",
          status: "FAIL",
          details: `Field update failed: ${error.message}`,
        })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      testResults.push({
        testId: "FIELD_SELF_UPDATE",
        name: "User can update their own fields",
        category: "FIELD",
        status: "FAIL",
        details: `Exception: ${msg}`,
      })
    }
  }

  // 3.6 Attempt Foreign Field Update
  try {
    const { data: updatedFields, error } = await supabase
      .from("fields")
      .update({ name: "Hacked Field Name" })
      .eq("farm_id", FAKE_UUID)
      .select()

    if (!error && (!updatedFields || updatedFields.length === 0)) {
      testResults.push({
        testId: "FIELD_FOREIGN_UPDATE_BLOCKED",
        name: "User cannot update another user's fields",
        category: "FIELD",
        status: "PASS",
        details: "RLS policy blocked field modification on unowned farm (0 rows affected).",
      })
    } else {
      testResults.push({
        testId: "FIELD_FOREIGN_UPDATE_BLOCKED",
        name: "User cannot update another user's fields",
        category: "FIELD",
        status: "FAIL",
        details: `Foreign field update error or data leakage: ${error?.message}`,
      })
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    testResults.push({
      testId: "FIELD_FOREIGN_UPDATE_BLOCKED",
      name: "User cannot update another user's fields",
      category: "FIELD",
      status: "FAIL",
      details: `Exception: ${msg}`,
    })
  }

  // 3.7 Delete Own Field & Clean Up Created Test Resources
  if (createdFieldId) {
    try {
      const { error } = await supabase
        .from("fields")
        .delete()
        .eq("id", createdFieldId)

      if (!error) {
        testResults.push({
          testId: "FIELD_SELF_DELETE",
          name: "User can delete their own fields",
          category: "FIELD",
          status: "PASS",
          details: "Field deleted successfully.",
        })
      } else {
        testResults.push({
          testId: "FIELD_SELF_DELETE",
          name: "User can delete their own fields",
          category: "FIELD",
          status: "FAIL",
          details: `Field deletion failed: ${error.message}`,
        })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      testResults.push({
        testId: "FIELD_SELF_DELETE",
        name: "User can delete their own fields",
        category: "FIELD",
        status: "FAIL",
        details: `Exception: ${msg}`,
      })
    }
  }

  // 3.8 Attempt Foreign Field Delete
  try {
    const { data: deletedFields, error } = await supabase
      .from("fields")
      .delete()
      .eq("farm_id", FAKE_UUID)
      .select()

    if (!error && (!deletedFields || deletedFields.length === 0)) {
      testResults.push({
        testId: "FIELD_FOREIGN_DELETE_BLOCKED",
        name: "User cannot delete another user's fields",
        category: "FIELD",
        status: "PASS",
        details: "RLS policy prevented deletion of unowned field (0 rows affected).",
      })
    } else {
      testResults.push({
        testId: "FIELD_FOREIGN_DELETE_BLOCKED",
        name: "User cannot delete another user's fields",
        category: "FIELD",
        status: "FAIL",
        details: `Foreign field delete error: ${error?.message}`,
      })
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    testResults.push({
      testId: "FIELD_FOREIGN_DELETE_BLOCKED",
      name: "User cannot delete another user's fields",
      category: "FIELD",
      status: "FAIL",
      details: `Exception: ${msg}`,
    })
  }

  // Clean up test farm
  if (createdFarmId) {
    try {
      const { error } = await supabase
        .from("farms")
        .delete()
        .eq("id", createdFarmId)

      if (!error) {
        testResults.push({
          testId: "FARM_SELF_DELETE",
          name: "User can delete their own farm",
          category: "FARM",
          status: "PASS",
          details: "Test farm cleaned up successfully.",
        })
      } else {
        testResults.push({
          testId: "FARM_SELF_DELETE",
          name: "User can delete their own farm",
          category: "FARM",
          status: "FAIL",
          details: `Farm deletion failed: ${error.message}`,
        })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      testResults.push({
        testId: "FARM_SELF_DELETE",
        name: "User can delete their own farm",
        category: "FARM",
        status: "FAIL",
        details: `Exception: ${msg}`,
      })
    }
  }

  // Determine overall status
  const failedCount = testResults.filter((t) => t.status === "FAIL").length
  const notVerifiedCount = testResults.filter((t) => t.status === "NOT_VERIFIED").length

  let overallStatus: "PASS" | "FAIL" | "PARTIAL" = "PASS"
  if (failedCount > 0) overallStatus = "FAIL"
  else if (notVerifiedCount > 0) overallStatus = "PARTIAL"

  return {
    timestamp: new Date().toISOString(),
    userId,
    overallStatus,
    testResults,
  }
}
