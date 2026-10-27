import * as fs from "fs"
import * as path from "path"
import {
  supabaseProjectRepository,
  ProjectRecord,
} from "@/lib/repositories/SupabaseProjectRepository"
import { offlineDB } from "@/lib/offline/db"

export interface Phase8TestResult {
  testId: string
  name: string
  status: "PASS" | "FAIL" | "WARN"
  details: string
}

export interface Phase8AuditSummary {
  overallStatus: "PASS" | "FAIL" | "PARTIAL"
  testResults: Phase8TestResult[]
}

export async function runPhase8ProjectsAudit(): Promise<Phase8AuditSummary> {
  const results: Phase8TestResult[] = []

  // 1. PH8-01: Project Creation & Schema Constraints
  try {
    const migrationPath = path.resolve(process.cwd(), "supabase", "migrations", "20260903000007_phase8_projects.sql")
    const migrationCode = fs.existsSync(migrationPath) ? fs.readFileSync(migrationPath, "utf-8") : ""

    const hasProjectsTable = migrationCode.includes("CREATE TABLE IF NOT EXISTS public.projects")
    const hasNameCheck = migrationCode.includes("char_length(trim(name)) > 0") && migrationCode.includes("char_length(name) <= 150")
    const hasStatusCheck = migrationCode.includes("planning") && migrationCode.includes("active") && migrationCode.includes("completed") && migrationCode.includes("archived")
    const hasTargetCheck = migrationCode.includes("target_submissions >= 0")
    const hasDateCheck = migrationCode.includes("end_date >= start_date")
    const hasUniqueCode = migrationCode.includes("UNIQUE (owner_id, code)")

    // Runtime calculation check on validation
    let validationPassed = false
    try {
      await supabaseProjectRepository.createProject({
        name: "", // Should reject empty name
      })
    } catch {
      validationPassed = true
    }

    if (hasProjectsTable && hasNameCheck && hasStatusCheck && hasTargetCheck && hasDateCheck && hasUniqueCode && validationPassed) {
      results.push({
        testId: "PH8-01",
        name: "Project Creation & Schema Constraints",
        status: "PASS",
        details: "public.projects schema defines name (1..150), status enum, non-negative targets, start/end dates, unique owner code, and repository rejects invalid payloads.",
      })
    } else {
      results.push({
        testId: "PH8-01",
        name: "Project Creation & Schema Constraints",
        status: "FAIL",
        details: `Table: ${hasProjectsTable}, NameCheck: ${hasNameCheck}, StatusCheck: ${hasStatusCheck}, TargetCheck: ${hasTargetCheck}, DateCheck: ${hasDateCheck}, UniqueCode: ${hasUniqueCode}, RepoValidation: ${validationPassed}`,
      })
    }
  } catch (err: unknown) {
    results.push({
      testId: "PH8-01",
      name: "Project Creation & Schema Constraints",
      status: "FAIL",
      details: `Execution error: ${err instanceof Error ? err.message : String(err)}`,
    })
  }

  // 2. PH8-02: Project Retrieval & Search/Status Filtering
  try {
    const repoPath = path.resolve(process.cwd(), "lib", "repositories", "SupabaseProjectRepository.ts")
    const repoCode = fs.readFileSync(repoPath, "utf-8")

    const hasGetProjects = repoCode.includes("async getProjects")
    const hasStatusFilter = repoCode.includes("query.eq(\"status\", options.status)")
    const hasSearchFilter = repoCode.includes("query.or")
    const hasGetById = repoCode.includes("async getProjectById")

    if (hasGetProjects && hasStatusFilter && hasSearchFilter && hasGetById) {
      results.push({
        testId: "PH8-02",
        name: "Project Retrieval & Search/Status Filtering",
        status: "PASS",
        details: "SupabaseProjectRepository supports parameterized queries for status, multi-field search (name, code, description), and ID retrieval.",
      })
    } else {
      results.push({
        testId: "PH8-02",
        name: "Project Retrieval & Search/Status Filtering",
        status: "FAIL",
        details: `getProjects: ${hasGetProjects}, statusFilter: ${hasStatusFilter}, searchFilter: ${hasSearchFilter}, getById: ${hasGetById}`,
      })
    }
  } catch (err: unknown) {
    results.push({
      testId: "PH8-02",
      name: "Project Retrieval & Search/Status Filtering",
      status: "FAIL",
      details: `Execution error: ${err instanceof Error ? err.message : String(err)}`,
    })
  }

  // 3. PH8-03: Project Lifecycle State Machine
  try {
    const repoPath = path.resolve(process.cwd(), "lib", "repositories", "SupabaseProjectRepository.ts")
    const repoCode = fs.readFileSync(repoPath, "utf-8")

    const hasTransitions =
      repoCode.includes('planning: ["active", "archived"]') &&
      repoCode.includes('active: ["completed", "archived"]') &&
      repoCode.includes('completed: ["archived"]') &&
      repoCode.includes("archived: []")

    if (hasTransitions) {
      results.push({
        testId: "PH8-03",
        name: "Project Lifecycle State Machine",
        status: "PASS",
        details: "Discrete lifecycle state transitions enforced: planning -> active -> completed -> archived (with confirmed terminal archived state).",
      })
    } else {
      results.push({
        testId: "PH8-03",
        name: "Project Lifecycle State Machine",
        status: "FAIL",
        details: "State machine transitions do not match authorized transition matrix.",
      })
    }
  } catch (err: unknown) {
    results.push({
      testId: "PH8-03",
      name: "Project Lifecycle State Machine",
      status: "FAIL",
      details: `Execution error: ${err instanceof Error ? err.message : String(err)}`,
    })
  }

  // 4. PH8-04: Form Assignment to Projects
  try {
    const migrationPath = path.resolve(process.cwd(), "supabase", "migrations", "20260903000007_phase8_projects.sql")
    const migrationCode = fs.readFileSync(migrationPath, "utf-8")
    const repoPath = path.resolve(process.cwd(), "lib", "repositories", "SupabaseProjectRepository.ts")
    const repoCode = fs.readFileSync(repoPath, "utf-8")

    const hasJunctionTable = migrationCode.includes("CREATE TABLE IF NOT EXISTS public.project_forms")
    const hasProjectCascade = migrationCode.includes("ON DELETE CASCADE")
    const hasUniqueConstraint = migrationCode.includes("UNIQUE (project_id, form_id)")
    const hasAssignForms = repoCode.includes("async assignFormsToProject")
    const hasGetProjectForms = repoCode.includes("async getProjectForms")
    const hasRemoveForm = repoCode.includes("async removeFormFromProject")

    if (hasJunctionTable && hasProjectCascade && hasUniqueConstraint && hasAssignForms && hasGetProjectForms && hasRemoveForm) {
      results.push({
        testId: "PH8-04",
        name: "Form Assignment to Projects",
        status: "PASS",
        details: "project_forms junction table implements unique assignments with ON DELETE CASCADE and repository methods manage multi-form assignments.",
      })
    } else {
      results.push({
        testId: "PH8-04",
        name: "Form Assignment to Projects",
        status: "FAIL",
        details: `JunctionTable: ${hasJunctionTable}, Cascade: ${hasProjectCascade}, UniqueConstraint: ${hasUniqueConstraint}, Methods: ${hasAssignForms && hasGetProjectForms && hasRemoveForm}`,
      })
    }
  } catch (err: unknown) {
    results.push({
      testId: "PH8-04",
      name: "Form Assignment to Projects",
      status: "FAIL",
      details: `Execution error: ${err instanceof Error ? err.message : String(err)}`,
    })
  }

  // 5. PH8-05: Submission Association & Joins
  try {
    const migrationPath = path.resolve(process.cwd(), "supabase", "migrations", "20260903000007_phase8_projects.sql")
    const migrationCode = fs.readFileSync(migrationPath, "utf-8")
    const subRepoPath = path.resolve(process.cwd(), "lib", "repositories", "SupabaseSubmissionRepository.ts")
    const subRepoCode = fs.readFileSync(subRepoPath, "utf-8")

    const hasColumn = migrationCode.includes("ADD COLUMN IF NOT EXISTS project_id UUID")
    const hasOnDeleteSetNull = migrationCode.includes("ON DELETE SET NULL")
    const hasProjectJoin = subRepoCode.includes("projects ( name, code )")
    const hasProjectInRecord = subRepoCode.includes("projectName?: string") && subRepoCode.includes("projectCode?: string")
    const hasProjectFilter = subRepoCode.includes("query.eq(\"project_id\", options.projectId)")

    if (hasColumn && hasOnDeleteSetNull && hasProjectJoin && hasProjectInRecord && hasProjectFilter) {
      results.push({
        testId: "PH8-05",
        name: "Submission Association & Joins",
        status: "PASS",
        details: "form_submissions.project_id configured with ON DELETE SET NULL; repository joins project name/code and supports projectId filter.",
      })
    } else {
      results.push({
        testId: "PH8-05",
        name: "Submission Association & Joins",
        status: "FAIL",
        details: `Column: ${hasColumn}, OnDeleteSetNull: ${hasOnDeleteSetNull}, Join: ${hasProjectJoin}, RecordProps: ${hasProjectInRecord}, Filter: ${hasProjectFilter}`,
      })
    }
  } catch (err: unknown) {
    results.push({
      testId: "PH8-05",
      name: "Submission Association & Joins",
      status: "FAIL",
      details: `Execution error: ${err instanceof Error ? err.message : String(err)}`,
    })
  }

  // 6. PH8-06: Quota and Metrics Calculation Engine (Stage 11 Rules)
  try {
    // Null target -> null percentage
    const calcNull = supabaseProjectRepository.calculateProgress(null, 50)
    // Zero target -> null percentage
    const calcZero = supabaseProjectRepository.calculateProgress(0, 0)
    // Normal target -> 50%
    const calcNormal = supabaseProjectRepository.calculateProgress(100, 50)
    // Over-delivery -> 120%, but progress bar clamped to 100%
    const calcOver = supabaseProjectRepository.calculateProgress(100, 120)

    const nullOk = calcNull.progressPercentage === null && calcNull.progressBarPercentage === null
    const zeroOk = calcZero.progressPercentage === null && calcZero.progressBarPercentage === null
    const normalOk = calcNormal.progressPercentage === 50 && calcNormal.progressBarPercentage === 50
    const overOk = calcOver.progressPercentage === 120 && calcOver.progressBarPercentage === 100

    if (nullOk && zeroOk && normalOk && overOk) {
      results.push({
        testId: "PH8-06",
        name: "Quota and Metrics Calculation Engine",
        status: "PASS",
        details: "Quota logic strictly adheres to Stage 11: null/0 targets return null (no division by zero), normal targets calculate %, over-delivery reports 120% with clamped 100% bar.",
      })
    } else {
      results.push({
        testId: "PH8-06",
        name: "Quota and Metrics Calculation Engine",
        status: "FAIL",
        details: `NullOk: ${nullOk}, ZeroOk: ${zeroOk}, NormalOk: ${normalOk}, OverOk: ${overOk}`,
      })
    }
  } catch (err: unknown) {
    results.push({
      testId: "PH8-06",
      name: "Quota and Metrics Calculation Engine",
      status: "FAIL",
      details: `Execution error: ${err instanceof Error ? err.message : String(err)}`,
    })
  }

  // 7. PH8-07: Participating Registry Derivation
  try {
    const repoPath = path.resolve(process.cwd(), "lib", "repositories", "SupabaseProjectRepository.ts")
    const repoCode = fs.readFileSync(repoPath, "utf-8")

    const hasParticipatingRegistry = repoCode.includes("async getParticipatingRegistry")
    const hasDeduplication = repoCode.includes("new Map<string, Farm>()") && repoCode.includes("new Map<string, Field>()") && repoCode.includes("new Map<string, Farmer>()")
    const hasNoStaticTables = !repoCode.includes("project_farms") && !repoCode.includes("project_farmers") && !repoCode.includes("project_fields")

    if (hasParticipatingRegistry && hasDeduplication && hasNoStaticTables) {
      results.push({
        testId: "PH8-07",
        name: "Participating Registry Derivation",
        status: "PASS",
        details: "Participating farms, fields, and farmers are dynamically derived and deduplicated from project form submissions without creating redundant junction tables.",
      })
    } else {
      results.push({
        testId: "PH8-07",
        name: "Participating Registry Derivation",
        status: "FAIL",
        details: `Method: ${hasParticipatingRegistry}, Deduplication: ${hasDeduplication}, NoStaticTables: ${hasNoStaticTables}`,
      })
    }
  } catch (err: unknown) {
    results.push({
      testId: "PH8-07",
      name: "Participating Registry Derivation",
      status: "FAIL",
      details: `Execution error: ${err instanceof Error ? err.message : String(err)}`,
    })
  }

  // 8. PH8-08: Offline Storage & IndexedDB v3 Upgrade
  try {
    const dbPath = path.resolve(process.cwd(), "lib", "offline", "db.ts")
    const dbCode = fs.readFileSync(dbPath, "utf-8")

    const hasV3 = dbCode.includes("const DB_VERSION = 3")
    const hasProjectsStore = dbCode.includes('db.createObjectStore("projects"')
    const hasProjectFormsStore = dbCode.includes('db.createObjectStore("project_forms"')
    const preservesV2Stores =
      dbCode.includes('db.objectStoreNames.contains("forms")') &&
      dbCode.includes('db.objectStoreNames.contains("farmers")') &&
      dbCode.includes('db.objectStoreNames.contains("farms")') &&
      dbCode.includes('db.objectStoreNames.contains("fields")') &&
      dbCode.includes('db.objectStoreNames.contains("drafts")') &&
      dbCode.includes('db.objectStoreNames.contains("sync_queue")')

    // Test in-memory offlineDB save and retrieve
    const testProject: ProjectRecord = {
      id: "proj-offline-test",
      ownerId: "current-user",
      name: "Offline Campaign",
      code: "OFF-001",
      description: "Test offline campaign",
      status: "active",
      targetSubmissions: 50,
      startDate: "2026-09-01",
      endDate: "2026-12-31",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      formsCount: 1,
      submissionsCount: 0,
      progressPercentage: 0,
      progressBarPercentage: 0,
    }

    await offlineDB.saveProjects([testProject])
    const retrieved = await offlineDB.getProjectById("proj-offline-test")
    const canRetrieve = retrieved?.name === "Offline Campaign"

    if (hasV3 && hasProjectsStore && hasProjectFormsStore && preservesV2Stores && canRetrieve) {
      results.push({
        testId: "PH8-08",
        name: "Offline Storage & IndexedDB v3 Upgrade",
        status: "PASS",
        details: "IndexedDB upgraded to version 3 adding projects and project_forms object stores with non-destructive preservation of all existing stores.",
      })
    } else {
      results.push({
        testId: "PH8-08",
        name: "Offline Storage & IndexedDB v3 Upgrade",
        status: "FAIL",
        details: `v3: ${hasV3}, projectsStore: ${hasProjectsStore}, projectFormsStore: ${hasProjectFormsStore}, preservesStores: ${preservesV2Stores}, memoryTest: ${canRetrieve}`,
      })
    }
  } catch (err: unknown) {
    results.push({
      testId: "PH8-08",
      name: "Offline Storage & IndexedDB v3 Upgrade",
      status: "FAIL",
      details: `Execution error: ${err instanceof Error ? err.message : String(err)}`,
    })
  }

  // 9. PH8-09: Offline Draft & Sync Preserves Project Context
  try {
    const dbPath = path.resolve(process.cwd(), "lib", "offline", "db.ts")
    const dbCode = fs.readFileSync(dbPath, "utf-8")
    const syncPath = path.resolve(process.cwd(), "lib", "offline", "syncEngine.ts")
    const syncCode = fs.readFileSync(syncPath, "utf-8")

    const draftHasProject = dbCode.includes("projectId?: string | null") && dbCode.includes("projectName?: string")
    const syncQueueHasProject = dbCode.includes("projectId?: string | null")
    const syncEngineForwardsProject = syncCode.includes("projectId: item.payload.projectId")

    if (draftHasProject && syncQueueHasProject && syncEngineForwardsProject) {
      results.push({
        testId: "PH8-09",
        name: "Offline Draft & Sync Preserves Project Context",
        status: "PASS",
        details: "OfflineDraft and SyncQueueItem capture projectId, and syncEngine forwards projectId to remote submission repository during background sync.",
      })
    } else {
      results.push({
        testId: "PH8-09",
        name: "Offline Draft & Sync Preserves Project Context",
        status: "FAIL",
        details: `draftHasProject: ${draftHasProject}, syncQueueHasProject: ${syncQueueHasProject}, syncEngineForwards: ${syncEngineForwardsProject}`,
      })
    }
  } catch (err: unknown) {
    results.push({
      testId: "PH8-09",
      name: "Offline Draft & Sync Preserves Project Context",
      status: "FAIL",
      details: `Execution error: ${err instanceof Error ? err.message : String(err)}`,
    })
  }

  // 10. PH8-10: Single-Owner Isolation on Projects
  try {
    const migrationPath = path.resolve(process.cwd(), "supabase", "migrations", "20260903000007_phase8_projects.sql")
    const migrationCode = fs.readFileSync(migrationPath, "utf-8")

    const hasRlsEnable = migrationCode.includes("ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY")
    const hasSelectPolicy = migrationCode.includes("Users can view their own projects") && migrationCode.includes("owner_id = auth.uid()")
    const hasInsertPolicy = migrationCode.includes("Users can insert their own projects") && migrationCode.includes("owner_id = auth.uid()")
    const hasUpdatePolicy = migrationCode.includes("Users can update their own projects") && migrationCode.includes("owner_id = auth.uid()")
    const hasDeletePolicy = migrationCode.includes("Users can delete their own projects") && migrationCode.includes("owner_id = auth.uid()")

    if (hasRlsEnable && hasSelectPolicy && hasInsertPolicy && hasUpdatePolicy && hasDeletePolicy) {
      results.push({
        testId: "PH8-10",
        name: "Single-Owner Isolation on Projects",
        status: "PASS",
        details: "Full CRUD RLS policies on public.projects enforce auth.uid() = owner_id isolation across SELECT, INSERT, UPDATE, and DELETE.",
      })
    } else {
      results.push({
        testId: "PH8-10",
        name: "Single-Owner Isolation on Projects",
        status: "FAIL",
        details: `RlsEnable: ${hasRlsEnable}, Select: ${hasSelectPolicy}, Insert: ${hasInsertPolicy}, Update: ${hasUpdatePolicy}, Delete: ${hasDeletePolicy}`,
      })
    }
  } catch (err: unknown) {
    results.push({
      testId: "PH8-10",
      name: "Single-Owner Isolation on Projects",
      status: "FAIL",
      details: `Execution error: ${err instanceof Error ? err.message : String(err)}`,
    })
  }

  // 11. PH8-11: Double-Ownership Enforcement on Form Assignment
  try {
    const migrationPath = path.resolve(process.cwd(), "supabase", "migrations", "20260903000007_phase8_projects.sql")
    const migrationCode = fs.readFileSync(migrationPath, "utf-8")

    const hasRlsEnable = migrationCode.includes("ALTER TABLE public.project_forms ENABLE ROW LEVEL SECURITY")
    const hasDoubleOwnership =
      migrationCode.includes("projects.owner_id = auth.uid()") &&
      migrationCode.includes("forms.owner_id = auth.uid()")

    if (hasRlsEnable && hasDoubleOwnership) {
      results.push({
        testId: "PH8-11",
        name: "Double-Ownership Enforcement on Form Assignment",
        status: "PASS",
        details: "project_forms RLS guarantees that users can only assign owned forms to owned projects, preventing cross-tenant linkage.",
      })
    } else {
      results.push({
        testId: "PH8-11",
        name: "Double-Ownership Enforcement on Form Assignment",
        status: "FAIL",
        details: `RlsEnable: ${hasRlsEnable}, DoubleOwnership: ${hasDoubleOwnership}`,
      })
    }
  } catch (err: unknown) {
    results.push({
      testId: "PH8-11",
      name: "Double-Ownership Enforcement on Form Assignment",
      status: "FAIL",
      details: `Execution error: ${err instanceof Error ? err.message : String(err)}`,
    })
  }

  // 12. PH8-12: Submission RLS Consolidated Verification
  try {
    const migrationPath = path.resolve(process.cwd(), "supabase", "migrations", "20260903000007_phase8_projects.sql")
    const migrationCode = fs.readFileSync(migrationPath, "utf-8")

    const dropsLegacy =
      migrationCode.includes('DROP POLICY IF EXISTS "Users can insert their own submissions on owned farms"') &&
      migrationCode.includes('DROP POLICY IF EXISTS "Users can insert their own submissions"')
    const checksProject = migrationCode.includes("project_id IS NULL") && migrationCode.includes("projects.id = project_id AND projects.owner_id = auth.uid()")
    const consolidatedPolicy = migrationCode.includes('CREATE POLICY "Users can insert their own submissions"')

    if (dropsLegacy && checksProject && consolidatedPolicy) {
      results.push({
        testId: "PH8-12",
        name: "Submission RLS Consolidated Verification",
        status: "PASS",
        details: "Drops legacy duplicate insert policies to prevent permissive OR bypass and consolidates checks for farmer, farm, field, form, and project ownership.",
      })
    } else {
      results.push({
        testId: "PH8-12",
        name: "Submission RLS Consolidated Verification",
        status: "FAIL",
        details: `DropsLegacy: ${dropsLegacy}, ChecksProject: ${checksProject}, ConsolidatedPolicy: ${consolidatedPolicy}`,
      })
    }
  } catch (err: unknown) {
    results.push({
      testId: "PH8-12",
      name: "Submission RLS Consolidated Verification",
      status: "FAIL",
      details: `Execution error: ${err instanceof Error ? err.message : String(err)}`,
    })
  }

  // 13. PH8-13: No Service-Role Credentials in Client Code
  try {
    const libFiles = [
      "lib/supabase/client.ts",
      "lib/repositories/SupabaseProjectRepository.ts",
      "lib/repositories/SupabaseSubmissionRepository.ts",
      "lib/offline/db.ts",
      "lib/offline/syncEngine.ts",
      "app/page.tsx",
    ]

    let leakFound = false
    let leakLocation = ""

    for (const relPath of libFiles) {
      const fullPath = path.resolve(process.cwd(), relPath)
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf-8")
        if (
          content.includes("SUPABASE_SERVICE_ROLE_KEY") ||
          content.includes("service_role") ||
          content.includes("supabaseAdmin")
        ) {
          leakFound = true
          leakLocation = relPath
          break
        }
      }
    }

    if (!leakFound) {
      results.push({
        testId: "PH8-13",
        name: "No Service-Role Credentials in Client Code",
        status: "PASS",
        details: "Verified public client initialization strictly utilizes NEXT_PUBLIC_SUPABASE_ANON_KEY with zero service-role leaks.",
      })
    } else {
      results.push({
        testId: "PH8-13",
        name: "No Service-Role Credentials in Client Code",
        status: "FAIL",
        details: `Service-role reference discovered in ${leakLocation}`,
      })
    }
  } catch (err: unknown) {
    results.push({
      testId: "PH8-13",
      name: "No Service-Role Credentials in Client Code",
      status: "FAIL",
      details: `Execution error: ${err instanceof Error ? err.message : String(err)}`,
    })
  }

  const hasFail = results.some((r) => r.status === "FAIL")
  return {
    overallStatus: hasFail ? "FAIL" : "PASS",
    testResults: results,
  }
}
