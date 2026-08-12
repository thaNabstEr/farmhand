"use client"

import * as React from "react"
import { Plus, Trash2, Repeat } from "lucide-react"
import { RunnerFieldProps, Field } from "../../../types"
import { Button } from "@/components/ui/button"
import { fieldRegistry } from "@/form-builder/registry"

export function RepeatGroupRunner({ field, value, onChange, disabled }: RunnerFieldProps) {
  const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : [{}]
  
  const minItems = field.settings?.minItems !== undefined ? field.settings.minItems : 1
  const maxItems = field.settings?.maxItems !== undefined ? field.settings.maxItems : 10
  const itemLabel = field.settings?.addItemLabel || "Item"
  const allowRemove = field.settings?.allowRemove !== false

  // Fallback default child fields if childFields is unconfigured
  const childFields: Field[] = field.settings?.childFields?.length
    ? field.settings.childFields
    : [
        {
          id: `${field.id}_name`,
          type: "text",
          label: `${itemLabel} Name`,
          description: "",
          required: true,
        },
        {
          id: `${field.id}_quantity`,
          type: "number",
          label: "Quantity / Area",
          description: "",
          required: false,
        },
      ]

  // Enforce minItems on initial mount if empty
  React.useEffect(() => {
    if (!Array.isArray(value) || value.length < minItems) {
      const initial: Record<string, unknown>[] = []
      const targetCount = Math.max(minItems, 1)
      for (let i = 0; i < targetCount; i++) {
        initial.push({})
      }
      onChange(initial)
    }
  }, [value, minItems, onChange])

  const handleAddItem = () => {
    if (items.length >= maxItems) return
    onChange([...items, {}])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length <= minItems) return
    const updated = items.filter((_, i) => i !== index)
    onChange(updated)
  }

  const handleItemFieldChange = (itemIndex: number, childId: string, val: unknown) => {
    const updated = [...items]
    updated[itemIndex] = {
      ...updated[itemIndex],
      [childId]: val,
    }
    onChange(updated)
  }

  return (
    <div className="space-y-4 pt-1">
      {items.map((itemData, index) => (
        <div
          key={index}
          className="p-4 sm:p-5 rounded-card border border-neutral-200 dark:border-neutral-800 bg-card space-y-4 relative group transition-all duration-150"
        >
          {/* Item Card Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800/80 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 dark:text-neutral-200">
              <span className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">
                {index + 1}
              </span>
              <span>{itemLabel} #{index + 1}</span>
            </div>

            {allowRemove && items.length > minItems && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveItem(index)}
                disabled={disabled}
                className="h-7 text-xs gap-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 px-2"
              >
                <Trash2 className="size-3.5" />
                <span>Remove</span>
              </Button>
            )}
          </div>

          {/* Child Fields Container */}
          <div className="space-y-3">
            {childFields.map((child) => {
              const entry = fieldRegistry[child.type]
              const RunnerComponent = entry?.runner

              if (!RunnerComponent) return null

              return (
                <div key={child.id} className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                    <span>{child.label}</span>
                    {child.required && <span className="text-red-500 font-bold">*</span>}
                  </label>
                  <RunnerComponent
                    field={child}
                    value={itemData[child.id]}
                    onChange={(val) => handleItemFieldChange(index, child.id, val)}
                    disabled={disabled}
                  />
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Add Item Button */}
      {items.length < maxItems && (
        <Button
          type="button"
          variant="outline"
          onClick={handleAddItem}
          disabled={disabled}
          className="w-full h-10 border-dashed text-xs gap-2 font-bold text-primary border-primary/30 hover:bg-primary/5"
        >
          <Plus className="size-4" />
          <span>Add {itemLabel}</span>
        </Button>
      )}
    </div>
  )
}

export default RepeatGroupRunner;
