"use client"

import * as React from "react"
import { Camera } from "lucide-react"
import { Field } from "@/form-builder/types"
import { PropertyInput, PropertySelect } from "./PropertyControls"

export interface PhotoSectionProps {
  field: Field
  onChange: (updates: Partial<Field>) => void
  match: (label: string) => boolean
}

export function PhotoSection({ field, onChange, match }: PhotoSectionProps) {
  if (field.type !== "photo" && !match("Photo")) return null

  const buttonLabel = field.settings?.buttonLabel || "Add Photo"
  const maxPhotos = field.settings?.maxPhotos || 1

  const handleUpdate = (updates: Record<string, any>) => {
    onChange({
      settings: {
        ...field.settings,
        ...updates,
      },
      validation: {
        ...field.validation,
        required: field.required,
        maxPhotos: updates.maxPhotos !== undefined ? updates.maxPhotos : field.validation?.maxPhotos,
      },
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
        <Camera className="size-3.5 text-primary" />
        <span>Photo Settings</span>
      </div>

      <PropertyInput
        label="Add Button Label"
        placeholder="Add Photo"
        value={buttonLabel}
        onChange={(val) => handleUpdate({ buttonLabel: val || "Add Photo" })}
      />

      <PropertySelect
        label="Maximum Allowed Photos"
        value={String(maxPhotos)}
        onChange={(val) => handleUpdate({ maxPhotos: parseInt(val, 10) })}
        options={[
          { label: "1 Photo (Single)", value: "1" },
          { label: "3 Photos", value: "3" },
          { label: "5 Photos", value: "5" },
          { label: "10 Photos", value: "10" },
        ]}
      />
    </div>
  )
}

export default PhotoSection;
