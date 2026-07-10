"use client"

import * as React from "react"
import { Field } from "../../types"
import { PropertyInput } from "./PropertyControls"
import { InspectorProps } from "./TextInspector"

export function DateInspector({ field, onChange, match }: InspectorProps) {
  const validation = field.validation || { required: false }

  const handleMinDateChange = (val: string) => {
    onChange({
      validation: {
        ...validation,
        minDate: val === "" ? undefined : val
      }
    })
  }

  const handleMaxDateChange = (val: string) => {
    onChange({
      validation: {
        ...validation,
        maxDate: val === "" ? undefined : val
      }
    })
  }

  const showMin = match("Min Date") || match("Minimum Date")
  const showMax = match("Max Date") || match("Maximum Date")

  if (!showMin && !showMax) return null

  return (
    <div className="grid grid-cols-1 gap-3">
      {showMin && (
        <PropertyInput
          label="Minimum Date"
          type="date"
          value={validation.minDate}
          onChange={handleMinDateChange}
        />
      )}
      {showMax && (
        <PropertyInput
          label="Maximum Date"
          type="date"
          value={validation.maxDate}
          onChange={handleMaxDateChange}
        />
      )}
    </div>
  )
}

export default DateInspector;
