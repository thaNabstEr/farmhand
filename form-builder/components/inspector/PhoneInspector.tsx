"use client"

import * as React from "react"
import { Field } from "../../types"
import { PropertyToggle } from "./PropertyControls"
import { InspectorProps } from "./TextInspector"

export function PhoneInspector({ field, onChange, match }: InspectorProps) {
  const validation = field.validation || { required: false }

  const handleToggle = (checked: boolean) => {
    onChange({
      validation: {
        ...validation,
        phone: checked
      }
    })
  }

  const showPhoneToggle = match("Phone Format") || match("Validate Phone Format")

  if (!showPhoneToggle) return null

  return (
    <div className="space-y-2">
      <PropertyToggle
        label="Validate Phone Format"
        checked={!!validation.phone}
        onChange={handleToggle}
        description="Verify inputs conform to international telephone numbers."
      />
    </div>
  )
}

export default PhoneInspector;
