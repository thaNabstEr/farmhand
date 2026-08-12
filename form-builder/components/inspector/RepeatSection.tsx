"use client"

import * as React from "react"
import { Field, FieldSettings } from "@/form-builder/types"
import { PropertyInput, PropertyToggle } from "./PropertyControls"

export interface RepeatSectionProps {
  field: Field;
  onChange: (updates: Partial<Field>) => void;
  match: (label: string) => boolean;
}

export function RepeatSection({ field, onChange, match }: RepeatSectionProps) {
  const settings: FieldSettings = field.settings || {}

  const handleUpdate = (updates: Partial<FieldSettings>) => {
    onChange({
      settings: {
        ...settings,
        ...updates,
      },
    })
  }

  const showRepeat = match("Repeat") || match("Repeat Group") || match("Min Items") || match("Max Items")
  if (!showRepeat) return null

  return (
    <div className="space-y-3.5">
      <PropertyInput
        label="Repeated Item Label"
        placeholder="e.g. Crop, Plot, Animal"
        value={settings.addItemLabel || "Item"}
        onChange={(val) => handleUpdate({ addItemLabel: val })}
        hint="Used in '+ Add [Label]' buttons"
      />

      <div className="grid grid-cols-2 gap-3">
        <PropertyInput
          label="Minimum Items"
          type="number"
          min={0}
          value={settings.minItems !== undefined ? settings.minItems : 1}
          onChange={(val) => handleUpdate({ minItems: val === "" ? 0 : parseInt(val, 10) })}
        />

        <PropertyInput
          label="Maximum Items"
          type="number"
          min={1}
          value={settings.maxItems !== undefined ? settings.maxItems : 10}
          onChange={(val) => handleUpdate({ maxItems: val === "" ? 10 : parseInt(val, 10) })}
        />
      </div>

      <PropertyToggle
        label="Allow Operators to Remove Items"
        checked={settings.allowRemove !== false}
        onChange={(checked) => handleUpdate({ allowRemove: checked })}
        description="Allow field workers to remove repeated entries if above minimum limit."
      />
    </div>
  )
}

export default RepeatSection;
