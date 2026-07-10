"use client"

import * as React from "react"
import { Field } from "../../types"
import { PropertyInput } from "./PropertyControls"
import { InspectorProps } from "./TextInspector"

export function NumberInspector({ field, onChange, match }: InspectorProps) {
  const validation = field.validation || { required: false }

  const handleMinChange = (val: string) => {
    const minVal = val === "" ? undefined : parseFloat(val)
    onChange({
      validation: {
        ...validation,
        min: minVal
      }
    })
  }

  const handleMaxChange = (val: string) => {
    const maxVal = val === "" ? undefined : parseFloat(val)
    onChange({
      validation: {
        ...validation,
        max: maxVal
      }
    })
  }

  const showMin = match("Min Value") || match("Minimum Value")
  const showMax = match("Max Value") || match("Maximum Value")

  if (!showMin && !showMax) return null

  return (
    <div className="grid grid-cols-2 gap-3">
      {showMin && (
        <PropertyInput
          label="Min Value"
          type="number"
          placeholder="No min"
          value={validation.min}
          onChange={handleMinChange}
        />
      )}
      {showMax && (
        <PropertyInput
          label="Max Value"
          type="number"
          placeholder="No max"
          value={validation.max}
          onChange={handleMaxChange}
        />
      )}
    </div>
  )
}

export default NumberInspector;
