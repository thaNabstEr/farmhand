"use client"

import * as React from "react"
import { Plus, Trash2, ArrowUp, ArrowDown, AlertTriangle, Layers } from "lucide-react"
import { Field, FieldOption } from "@/form-builder/types"
import { Button } from "@/components/ui/button"
import { generateUniqueId } from "@/lib/repositories/LocalFormRepository"

export interface OptionsSectionProps {
  field: Field
  onChange: (updates: Partial<Field>) => void
  match: (label: string) => boolean
}

export function OptionsSection({ field, onChange, match }: OptionsSectionProps) {
  // Ensure options array exists with stable IDs
  const rawOptions = field.settings?.options || []
  const options: FieldOption[] = React.useMemo(() => {
    return rawOptions.map((opt, idx) => ({
      id: (opt as any).id || `opt_${idx}_${opt.value || "val"}`,
      label: opt.label || "",
      value: opt.value || "",
    }))
  }, [rawOptions])

  // Check for duplicate values
  const duplicateValues = React.useMemo(() => {
    const counts: Record<string, number> = {}
    options.forEach((opt) => {
      const val = opt.value.trim().toLowerCase()
      if (val) {
        counts[val] = (counts[val] || 0) + 1
      }
    })
    return Object.keys(counts).filter((val) => counts[val] > 1)
  }, [options])

  const updateOptions = (newOptions: FieldOption[]) => {
    onChange({
      settings: {
        ...field.settings,
        options: newOptions,
      },
    })
  }

  const handleAddOption = () => {
    const nextIdx = options.length + 1
    const newOpt: FieldOption = {
      id: generateUniqueId("opt"),
      label: `Option ${nextIdx}`,
      value: `option_${nextIdx}`,
    }
    updateOptions([...options, newOpt])
  }

  const handleOptionChange = (id: string, key: "label" | "value", val: string) => {
    const updated = options.map((opt) => {
      if (opt.id !== id) return opt
      if (key === "label") {
        // Auto-slugify value if value was default or matching previous label
        const slug = val.toLowerCase().trim().replace(/[^a-z0-9]/g, "_")
        const isDefaultVal = !opt.value || opt.value === opt.label.toLowerCase().trim().replace(/[^a-z0-9]/g, "_")
        return {
          ...opt,
          label: val,
          value: isDefaultVal ? slug : opt.value,
        }
      }
      return { ...opt, [key]: val }
    })
    updateOptions(updated)
  }

  const handleDeleteOption = (id: string) => {
    updateOptions(options.filter((opt) => opt.id !== id))
  }

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= options.length) return
    const next = [...options]
    const temp = next[index]
    next[index] = next[targetIdx]
    next[targetIdx] = temp
    updateOptions(next)
  }

  const isChoiceField =
    field.type === "dropdown" ||
    field.type === "radio" ||
    field.type === "checkbox" ||
    field.type === "checkboxes"

  const showOptions = isChoiceField || match("Options") || match("Choices")
  if (!showOptions) return null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
          <Layers className="size-3.5 text-primary" />
          <span>Options ({options.length})</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddOption}
          className="h-7 text-xs font-semibold gap-1 px-2 border-neutral-200/80 dark:border-neutral-800"
        >
          <Plus className="size-3" />
          <span>Add Option</span>
        </Button>
      </div>

      {/* Duplicate Value Warning Banner */}
      {duplicateValues.length > 0 && (
        <div className="p-3 rounded-card border border-amber-500/60 bg-amber-500/10 text-amber-600 dark:text-amber-400 space-y-1 text-xs font-semibold animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="size-4 shrink-0" />
            <span>Duplicate Option Values</span>
          </div>
          <p className="text-[10px] font-normal leading-normal opacity-90">
            Option value already exists: &quot;{duplicateValues.join(", ")}&quot;. Each option value must be unique.
          </p>
        </div>
      )}

      {/* Options List */}
      {options.length === 0 ? (
        <div className="p-4 rounded-card border border-dashed border-neutral-200 dark:border-neutral-800 text-center space-y-2">
          <p className="text-xs text-neutral-400 font-medium">No options defined yet.</p>
          <Button type="button" size="sm" variant="ghost" onClick={handleAddOption} className="text-xs font-bold text-primary">
            + Add Option
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {options.map((opt, idx) => {
            const optKey = opt.id || opt.value || `opt_${idx}`
            return (
              <div
                key={optKey}
                className="p-3 rounded-card border border-neutral-200/80 dark:border-neutral-850 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-2 select-none group"
              >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-neutral-400 font-mono">
                  #{idx + 1}
                </span>

                {/* Reorder & Delete Controls */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, "up")}
                    className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-30 disabled:hover:text-neutral-400"
                    title="Move Up"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === options.length - 1}
                    onClick={() => handleMove(idx, "down")}
                    className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-30 disabled:hover:text-neutral-400"
                    title="Move Down"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteOption(opt.id)}
                    className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300 ml-1"
                    title="Delete Option"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Label & Value Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                    Label
                  </label>
                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) => handleOptionChange(opt.id, "label", e.target.value)}
                    placeholder="Option Label"
                    className="w-full h-8 px-2.5 rounded-input border border-neutral-200 dark:border-neutral-800 bg-card text-xs font-semibold text-neutral-900 dark:text-neutral-100 outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                    Value
                  </label>
                  <input
                    type="text"
                    value={opt.value}
                    onChange={(e) => handleOptionChange(opt.id, "value", e.target.value)}
                    placeholder="Option Value"
                    className="w-full h-8 px-2.5 rounded-input border border-neutral-200 dark:border-neutral-800 bg-card text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300 outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          )
        })}
        </div>
      )}

      {/* Checkbox Selection Limits */}
      {(field.type === "checkbox" || field.type === "checkboxes") && (
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-850 space-y-2.5">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
            Selection Limits
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                Min Selections
              </label>
              <input
                type="number"
                min={0}
                value={field.validation?.minSelections ?? ""}
                onChange={(e) => {
                  const val = e.target.value === "" ? undefined : parseInt(e.target.value, 10)
                  onChange({
                    validation: {
                      ...field.validation,
                      required: field.required,
                      minSelections: val,
                    },
                  })
                }}
                placeholder="None"
                className="w-full h-8 px-2.5 rounded-input border border-neutral-200 dark:border-neutral-800 bg-card text-xs font-semibold text-neutral-900 dark:text-neutral-100 outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                Max Selections
              </label>
              <input
                type="number"
                min={0}
                value={field.validation?.maxSelections ?? ""}
                onChange={(e) => {
                  const val = e.target.value === "" ? undefined : parseInt(e.target.value, 10)
                  onChange({
                    validation: {
                      ...field.validation,
                      required: field.required,
                      maxSelections: val,
                    },
                  })
                }}
                placeholder="None"
                className="w-full h-8 px-2.5 rounded-input border border-neutral-200 dark:border-neutral-800 bg-card text-xs font-semibold text-neutral-900 dark:text-neutral-100 outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OptionsSection;
