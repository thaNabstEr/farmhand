"use client"

import * as React from "react"
import { ToggleRight } from "lucide-react"
import { Field } from "@/form-builder/types"
import { PropertyInput } from "./PropertyControls"

export interface YesNoSectionProps {
  field: Field
  onChange: (updates: Partial<Field>) => void
  match: (label: string) => boolean
}

export function YesNoSection({ field, onChange, match }: YesNoSectionProps) {
  if (field.type !== "yes_no" && !match("Yes / No")) return null

  const yesLabel = field.settings?.yesLabel || "Yes"
  const noLabel = field.settings?.noLabel || "No"
  const defaultValue = field.settings?.defaultValue

  const handleUpdate = (updates: Record<string, any>) => {
    onChange({
      settings: {
        ...field.settings,
        ...updates,
      },
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
        <ToggleRight className="size-3.5 text-primary" />
        <span>Yes / No Options</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <PropertyInput
          label="Affirmative Label"
          placeholder="Yes"
          value={yesLabel}
          onChange={(val) => handleUpdate({ yesLabel: val || "Yes" })}
        />

        <PropertyInput
          label="Negative Label"
          placeholder="No"
          value={noLabel}
          onChange={(val) => handleUpdate({ noLabel: val || "No" })}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
          Default Selection
        </label>
        <select
          value={defaultValue === true ? "yes" : defaultValue === false ? "no" : "none"}
          onChange={(e) => {
            const val = e.target.value
            handleUpdate({
              defaultValue: val === "yes" ? true : val === "no" ? false : undefined,
            })
          }}
          className="w-full h-9 px-3 rounded-input border border-neutral-250 dark:border-neutral-800 bg-card text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer"
        >
          <option value="none">No value selected (Default)</option>
          <option value="yes">Default to {yesLabel}</option>
          <option value="no">Default to {noLabel}</option>
        </select>
      </div>
    </div>
  )
}

export default YesNoSection;
