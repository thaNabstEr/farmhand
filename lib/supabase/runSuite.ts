import * as fs from "fs"
import * as path from "path"
import { runPhase4SecurityAndOfflineAudit } from "./testPhase4"
import { runPhase3SecurityAudit } from "./testPhase3"
import { runPhase2SecurityAudit } from "./testPhase2"

// Load .env.local manually for node CLI test execution
try {
  const envPath = path.resolve(process.cwd(), ".env.local")
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8")
    envContent.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
      if (match) {
        const key = match[1]
        let value = match[2] || ""
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1)
        process.env[key] = value
      }
    })
  }
} catch {
  // ignore
}

async function runAllAudits() {
  console.log("====================================================")
  console.log("   FARMHAND AUTOMATED REGRESSION & PHASE 4 AUDIT    ")
  console.log("====================================================")

  console.log("\n--- Running Phase 2 Audit ---")
  try {
    const p2 = await runPhase2SecurityAudit()
    console.log(`Phase 2 Status: ${p2.overallStatus}`)
    p2.testResults.forEach(t => {
      console.log(`  [${t.status}] ${t.testId}: ${t.name} -> ${t.details}`)
    })
  } catch (e: unknown) {
    console.log(`Phase 2 Execution Note: ${e instanceof Error ? e.message : String(e)}`)
  }

  console.log("\n--- Running Phase 3 Audit ---")
  try {
    const p3 = await runPhase3SecurityAudit()
    console.log(`Phase 3 Status: ${p3.overallStatus}`)
    p3.testResults.forEach(t => {
      console.log(`  [${t.status}] ${t.testId}: ${t.name} -> ${t.details}`)
    })
  } catch (e: unknown) {
    console.log(`Phase 3 Execution Note: ${e instanceof Error ? e.message : String(e)}`)
  }

  console.log("\n--- Running Phase 4 Audit ---")
  try {
    const p4 = await runPhase4SecurityAndOfflineAudit()
    console.log(`Phase 4 Overall Status: ${p4.overallStatus}`)
    p4.testResults.forEach(t => {
      console.log(`  [${t.status}] ${t.testId}: ${t.name} -> ${t.details}`)
    })
  } catch (e: unknown) {
    console.log(`Phase 4 Execution Note: ${e instanceof Error ? e.message : String(e)}`)
  }

  console.log("\n====================================================")
  console.log("            AUDIT RUNNER COMPLETED                  ")
  console.log("====================================================")
}

runAllAudits()
