import { Field, FormSchema, ConditionRule } from "@/form-builder/types"

export function evaluateCondition(condition: ConditionRule, targetValue: unknown): boolean {
  if (!condition.fieldId) return true

  // Handle empty / isNotEmpty operators
  if (condition.operator === "isEmpty") {
    if (targetValue === undefined || targetValue === null || targetValue === "") return true
    if (Array.isArray(targetValue) && targetValue.length === 0) return true
    return false
  }

  if (condition.operator === "isNotEmpty") {
    return !evaluateCondition({ ...condition, operator: "isEmpty" }, targetValue)
  }

  // Handle arrays (e.g. Checkboxes)
  if (Array.isArray(targetValue)) {
    const valStr = String(condition.value ?? "").toLowerCase().trim()
    if (condition.operator === "contains" || condition.operator === "equals") {
      return targetValue.some((item) => String(item).toLowerCase().trim() === valStr)
    }
    if (condition.operator === "notContains" || condition.operator === "notEquals") {
      return !targetValue.some((item) => String(item).toLowerCase().trim() === valStr)
    }
  }

  // Handle boolean coercion for Yes / No fields
  if (typeof targetValue === "boolean") {
    const condStr = String(condition.value ?? "").toLowerCase().trim()
    const isCondTrue = condStr === "true" || condStr === "yes" || condStr === "1"
    const isCondFalse = condStr === "false" || condStr === "no" || condStr === "0"

    if (condition.operator === "equals") {
      return (targetValue && isCondTrue) || (!targetValue && isCondFalse)
    }
    if (condition.operator === "notEquals") {
      return (targetValue && !isCondTrue) || (!targetValue && !isCondFalse)
    }
  }

  const strTarget = String(targetValue ?? "").trim().toLowerCase()
  const strCond = String(condition.value ?? "").trim().toLowerCase()

  switch (condition.operator) {
    case "equals":
      return strTarget === strCond
    case "notEquals":
      return strTarget !== strCond
    case "contains":
      return strTarget.includes(strCond)
    case "notContains":
      return !strTarget.includes(strCond)
    case "greaterThan":
      return Number(targetValue) > Number(condition.value)
    case "greaterThanOrEqual":
      return Number(targetValue) >= Number(condition.value)
    case "lessThan":
      return Number(targetValue) < Number(condition.value)
    case "lessThanOrEqual":
      return Number(targetValue) <= Number(condition.value)
    default:
      return true
  }
}

export function evaluateFieldLogic(
  field: Field,
  responses: Record<string, unknown>
): { isVisible: boolean; isRequired: boolean } {
  const baseRequired = !!field.required

  if (!field.logic?.enabled || !field.logic.conditions || field.logic.conditions.length === 0) {
    return { isVisible: true, isRequired: baseRequired }
  }

  const { action, group, conditions } = field.logic

  const results = conditions.map((c) => evaluateCondition(c, responses[c.fieldId]))
  const pass = group === "any" ? results.some(Boolean) : results.every(Boolean)

  let isVisible = true
  let isRequired = baseRequired

  switch (action) {
    case "show":
      isVisible = pass
      break
    case "hide":
      isVisible = !pass
      break
    case "require":
      isVisible = true
      isRequired = pass ? true : baseRequired
      break
    case "optional":
      isVisible = true
      isRequired = pass ? false : baseRequired
      break
  }

  // Required validation ONLY applies when the field is visible
  if (!isVisible) {
    isRequired = false
  }

  return { isVisible, isRequired }
}

export function evaluateFormLogic(
  schema: FormSchema,
  responses: Record<string, unknown>
): Record<string, { isVisible: boolean; isRequired: boolean }> {
  const result: Record<string, { isVisible: boolean; isRequired: boolean }> = {}

  schema.fields.forEach((field) => {
    result[field.id] = evaluateFieldLogic(field, responses)
  })

  return result
}
