"use client"

import * as React from "react"
import { Field } from "../../types"
import { PropertyInput } from "./PropertyControls"

export interface InspectorProps {
  field: Field;
  onChange: (updates: Partial<Field>) => void;
  match: (label: string) => boolean;
}

export function TextInspector({ field, onChange, match }: InspectorProps) {
  const validation = field.validation || { required: false }

  const handleMinChange = (val: string) => {
    const minVal = val === "" ? undefined : parseInt(val, 10)
    onChange({
      validation: {
        ...validation,
        min: minVal
      }
    })
  }

  const handleMaxChange = (val: string) => {
    const maxVal = val === "" ? undefined : parseInt(val, 10)
    onChange({
      validation: {
        ...validation,
        max: maxVal
      }
    })
  }

  const showMin = match("Min Length") || match("Minimum Length")
  const showMax = match("Max Length") || match("Maximum Length")

  if (!showMin && !showMax) return null

  return (
    <div className="grid grid-cols-2 gap-3">
      {showMin && (
        <PropertyInput
          label="Min Length"
          type="number"
          min={0}
          placeholder="No min"
          value={validation.min}
          onChange={handleMinChange}
        />
      )}
      {showMax && (
        <PropertyInput
          label="Max Length"
          type="number"
          min={0}
          placeholder="No max"
          value={validation.max}
          onChange={handleMaxChange}
        />
      )}
    </div>
  )
}

export default TextInspector;
