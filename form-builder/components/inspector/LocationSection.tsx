"use client"

import * as React from "react"
import { MapPin } from "lucide-react"
import { Field } from "@/form-builder/types"
import { PropertyInput } from "./PropertyControls"

export interface LocationSectionProps {
  field: Field
  onChange: (updates: Partial<Field>) => void
  match: (label: string) => boolean
}

export function LocationSection({ field, onChange, match }: LocationSectionProps) {
  if (field.type !== "location" && field.type !== "gps" && !match("Location")) return null

  const buttonLabel = field.settings?.buttonLabel || "Capture Location"
  const accuracyRequirement = field.settings?.accuracyRequirement

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
        <MapPin className="size-3.5 text-primary" />
        <span>Location Settings</span>
      </div>

      <PropertyInput
        label="Capture Button Label"
        placeholder="Capture Location"
        value={buttonLabel}
        onChange={(val) => handleUpdate({ buttonLabel: val || "Capture Location" })}
      />

      <div className="space-y-1">
        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
          Required Accuracy Tolerance (Meters)
        </label>
        <input
          type="number"
          min={1}
          placeholder="e.g. 20 (Optional)"
          value={accuracyRequirement ?? ""}
          onChange={(e) => {
            const val = e.target.value === "" ? undefined : parseInt(e.target.value, 10)
            handleUpdate({ accuracyRequirement: val })
          }}
          className="w-full h-8 px-2.5 rounded-input border border-neutral-200 dark:border-neutral-800 bg-card text-xs font-semibold text-neutral-900 dark:text-neutral-100 outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
    </div>
  )
}

export default LocationSection;
