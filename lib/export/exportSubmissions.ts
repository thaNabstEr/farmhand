import { FormSubmissionRecord } from "@/lib/repositories/SupabaseSubmissionRepository"
import { Field } from "@/form-builder/types"

/**
 * Escapes a field value for CSV compliance (RFC 4180)
 */
function escapeCsvValue(val: unknown): string {
  if (val === null || val === undefined) return ""
  if (typeof val === "object") {
    // For arrays or nested objects (e.g. multi-select, GPS, repeat group)
    const str = JSON.stringify(val)
    return `"${str.replace(/"/g, '""')}"`
  }
  const str = String(val)
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Formats a response value for human-readable CSV representation based on field type
 */
function formatResponseForCsv(field: Field, rawVal: unknown): string {
  if (rawVal === undefined || rawVal === null || rawVal === "") return ""

  // Yes / No
  if (field.type === "yes_no") {
    const isYes = rawVal === true || rawVal === "true"
    const isNo = rawVal === false || rawVal === "false"
    if (isYes) return field.settings?.yesLabel || "Yes"
    if (isNo) return field.settings?.noLabel || "No"
    return String(rawVal)
  }

  // Dropdown / Radio choice
  if (field.type === "dropdown" || field.type === "radio") {
    const opt = field.settings?.options?.find((o) => o.value === String(rawVal))
    return opt?.label || String(rawVal)
  }

  // Checkbox / Multi-select
  if (field.type === "checkbox" || field.type === "checkboxes") {
    const arr = Array.isArray(rawVal) ? rawVal : [rawVal]
    const labels = arr.map((itemVal) => {
      const opt = field.settings?.options?.find((o) => o.value === String(itemVal))
      return opt?.label || String(itemVal)
    })
    return labels.join("; ")
  }

  // Location / GPS
  if (field.type === "location" || field.type === "gps") {
    if (typeof rawVal === "object" && rawVal !== null && "latitude" in rawVal && "longitude" in rawVal) {
      const loc = rawVal as { latitude: number; longitude: number; accuracy?: number }
      return `${loc.latitude}, ${loc.longitude}${loc.accuracy ? ` (±${loc.accuracy}m)` : ""}`
    }
  }

  // Repeat Group
  if (field.type === "repeat_group") {
    if (Array.isArray(rawVal)) {
      return `${rawVal.length} items recorded`
    }
  }

  // Photo
  if (field.type === "photo") {
    if (Array.isArray(rawVal)) {
      return `${rawVal.length} photo(s)`
    }
    return "1 photo"
  }

  return String(rawVal)
}

/**
 * Generates CSV string from filtered submission records
 */
export function generateSubmissionsCsv(submissions: FormSubmissionRecord[]): string {
  if (!submissions || submissions.length === 0) {
    return "Submission ID,Form Name,Farm,Field,Status,Created At,Submitted At\n"
  }

  // Collect all unique field labels from the historical form schema snapshots
  const fieldColumnsMap = new Map<string, string>() // fieldId -> fieldLabel

  submissions.forEach((sub) => {
    const snapshotFields = sub.formSchemaSnapshot?.fields || []
    snapshotFields.forEach((field) => {
      if (field.type !== "section" && field.type !== "divider" && !fieldColumnsMap.has(field.id)) {
        fieldColumnsMap.set(field.id, field.label || field.id)
      }
    })
  })

  // Fixed metadata headers
  const baseHeaders = [
    "Submission ID",
    "Client Submission ID",
    "Form Name",
    "Farm",
    "Field",
    "Status",
    "Created At",
    "Submitted At",
  ]

  const dynamicFieldIds = Array.from(fieldColumnsMap.keys())
  const dynamicHeaders = dynamicFieldIds.map((id) => fieldColumnsMap.get(id) || id)

  const allHeaders = [...baseHeaders, ...dynamicHeaders]
  const rows: string[] = [allHeaders.map(escapeCsvValue).join(",")]

  submissions.forEach((sub) => {
    const rowValues: string[] = [
      sub.id,
      sub.clientSubmissionId || "",
      sub.formName || sub.formSchemaSnapshot?.name || "Form",
      sub.farmName || "General / Archived Farm",
      sub.fieldName || "—",
      sub.status,
      sub.createdAt,
      sub.status === "submitted" ? sub.updatedAt : "",
    ]

    // Fill response values based on historical schema
    const snapshotFields = sub.formSchemaSnapshot?.fields || []
    dynamicFieldIds.forEach((fieldId) => {
      const fieldDef = snapshotFields.find((f) => f.id === fieldId)
      const rawVal = sub.responses?.[fieldId]

      if (fieldDef) {
        rowValues.push(formatResponseForCsv(fieldDef, rawVal))
      } else if (rawVal !== undefined && rawVal !== null) {
        rowValues.push(String(rawVal))
      } else {
        rowValues.push("")
      }
    })

    rows.push(rowValues.map(escapeCsvValue).join(","))
  })

  return rows.join("\n")
}

/**
 * Generates structured JSON string for filtered submissions
 */
export function generateSubmissionsJson(submissions: FormSubmissionRecord[]): string {
  const exportPayload = submissions.map((sub) => ({
    submission: {
      id: sub.id,
      clientSubmissionId: sub.clientSubmissionId || null,
      formId: sub.formId,
      formName: sub.formName || sub.formSchemaSnapshot?.name || "Form Submission",
      farmId: sub.farmId,
      farmName: sub.farmName || "General / Archived Farm",
      fieldId: sub.fieldId,
      fieldName: sub.fieldName || null,
      ownerId: sub.ownerId,
      status: sub.status,
      createdAt: sub.createdAt,
      updatedAt: sub.updatedAt,
      submittedAt: sub.status === "submitted" ? sub.updatedAt : null,
    },
    responses: sub.responses || {},
    formSchemaSnapshot: sub.formSchemaSnapshot || null,
  }))

  return JSON.stringify(exportPayload, null, 2)
}

/**
 * Triggers browser download of a text file
 */
export function triggerFileDownload(content: string, filename: string, mimeType: string): void {
  if (typeof window === "undefined") return

  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
