"use client"

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"
import { Field, ConditionOperator, LogicAction, LogicGroup, ConditionRule } from "@/form-builder/types"
import { useFormBuilder } from "@/form-builder/state/FormBuilderContext"
import { PropertyToggle, PropertySelect, PropertyInput } from "./PropertyControls"
import { Button } from "@/components/ui/button"

export interface LogicSectionProps {
  field: Field;
  onChange: (updates: Partial<Field>) => void;
  match: (label: string) => boolean;
}

export function LogicSection({ field, onChange, match }: LogicSectionProps) {
  const { state } = useFormBuilder()
  const { schema } = state

  const logic = field.logic || {
    enabled: false,
    action: "show",
    group: "all",
    conditions: [],
  }

  // Filter available target fields (exclude self)
  const availableFields = React.useMemo(() => {
    return schema.fields.filter((f) => f.id !== field.id && f.type !== "section" && f.type !== "divider")
  }, [schema.fields, field.id])

  const handleToggleEnable = (enabled: boolean) => {
    onChange({
      logic: {
        ...logic,
        enabled,
        conditions: logic.conditions.length === 0 && availableFields.length > 0
          ? [{ id: `cond_${Date.now()}`, fieldId: availableFields[0].id, operator: "equals", value: "" }]
          : logic.conditions,
      },
    })
  }

  const handleActionChange = (action: string) => {
    onChange({
      logic: {
        ...logic,
        action: action as LogicAction,
      },
    })
  }

  const handleGroupChange = (group: string) => {
    onChange({
      logic: {
        ...logic,
        group: group as LogicGroup,
      },
    })
  }

  const handleAddCondition = () => {
    if (availableFields.length === 0) return
    const newCond: ConditionRule = {
      id: `cond_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      fieldId: availableFields[0].id,
      operator: "equals",
      value: "",
    }
    onChange({
      logic: {
        ...logic,
        conditions: [...logic.conditions, newCond],
      },
    })
  }

  const handleUpdateCondition = (index: number, updates: Partial<ConditionRule>) => {
    const updated = [...logic.conditions]
    updated[index] = { ...updated[index], ...updates }
    onChange({
      logic: {
        ...logic,
        conditions: updated,
      },
    })
  }

  const handleDeleteCondition = (index: number) => {
    const updated = logic.conditions.filter((_, i) => i !== index)
    onChange({
      logic: {
        ...logic,
        conditions: updated,
      },
    })
  }

  const showEnable = match("Enable Conditional Logic") || match("Conditional Logic") || match("Logic")
  if (!showEnable) return null

  return (
    <div className="space-y-3.5">
      <PropertyToggle
        label="Enable Conditional Logic"
        checked={logic.enabled}
        onChange={handleToggleEnable}
        description="Show, hide, or require this field dynamically based on user answers."
      />

      {logic.enabled && (
        <div className="space-y-3.5 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Action Choice */}
          <PropertySelect
            label="Rule Action"
            value={logic.action}
            onChange={handleActionChange}
            options={[
              { label: "Show this field when", value: "show" },
              { label: "Hide this field when", value: "hide" },
              { label: "Require this field when", value: "require" },
              { label: "Make this field optional when", value: "optional" },
            ]}
          />

          {/* Group Match Mode (if > 1 conditions) */}
          {logic.conditions.length > 1 && (
            <PropertySelect
              label="Condition Match Mode"
              value={logic.group}
              onChange={handleGroupChange}
              options={[
                { label: "ALL conditions match (AND)", value: "all" },
                { label: "ANY condition matches (OR)", value: "any" },
              ]}
            />
          )}

          {/* Rule Rows List */}
          <div className="space-y-3">
            {availableFields.length === 0 ? (
              <div className="p-3 rounded-md bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/50 text-center text-[11px] text-neutral-400 font-medium">
                Add other fields to your form to create conditions.
              </div>
            ) : (
              logic.conditions.map((cond, index) => {
                const targetField = schema.fields.find((f) => f.id === cond.fieldId)
                const targetType = targetField?.type || "text"

                // Type-aware operator list
                let operators: { label: string; value: ConditionOperator }[] = [
                  { label: "equals", value: "equals" },
                  { label: "not equals", value: "notEquals" },
                  { label: "is empty", value: "isEmpty" },
                  { label: "is not empty", value: "isNotEmpty" },
                ]

                if (targetType === "text" || targetType === "paragraph" || targetType === "checkboxes") {
                  operators.push(
                    { label: "contains", value: "contains" },
                    { label: "not contains", value: "notContains" }
                  )
                }

                if (targetType === "number" || targetType === "date" || targetType === "calculated") {
                  operators.push(
                    { label: "greater than", value: "greaterThan" },
                    { label: "greater than or equal", value: "greaterThanOrEqual" },
                    { label: "less than", value: "lessThan" },
                    { label: "less than or equal", value: "lessThanOrEqual" }
                  )
                }

                const hideValueInput = cond.operator === "isEmpty" || cond.operator === "isNotEmpty"

                return (
                  <div
                    key={cond.id || index}
                    className="p-3 rounded-card border border-neutral-200/80 dark:border-neutral-800 bg-card space-y-2.5 relative group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                        Condition #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCondition(index)}
                        className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                        title="Delete Condition"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    {/* Target Field Selector */}
                    <PropertySelect
                      label="Target Field"
                      value={cond.fieldId}
                      onChange={(val) => handleUpdateCondition(index, { fieldId: val })}
                      options={availableFields.map((f) => ({ label: f.label, value: f.id }))}
                    />

                    {/* Operator Selector */}
                    <PropertySelect
                      label="Operator"
                      value={cond.operator}
                      onChange={(val) => handleUpdateCondition(index, { operator: val as ConditionOperator })}
                      options={operators}
                    />

                    {/* Comparison Value Input (if target field has options, show option select!) */}
                    {!hideValueInput && (
                      targetField?.settings?.options?.length ? (
                        <PropertySelect
                          label="Expected Value"
                          value={String(cond.value ?? "")}
                          onChange={(val) => handleUpdateCondition(index, { value: val })}
                          options={targetField.settings.options}
                        />
                      ) : (
                        <PropertyInput
                          label="Expected Value"
                          type={targetType === "number" ? "number" : targetType === "date" ? "date" : "text"}
                          value={typeof cond.value === "boolean" ? String(cond.value) : cond.value}
                          onChange={(val) => handleUpdateCondition(index, { value: val })}
                        />
                      )
                    )}
                  </div>
                )
              })
            )}

            {/* Add Condition Button */}
            {availableFields.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddCondition}
                className="w-full h-8 border-dashed text-xs gap-1.5 font-semibold text-neutral-600 dark:text-neutral-300"
              >
                <Plus className="size-3.5" />
                <span>Add Condition</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default LogicSection;
