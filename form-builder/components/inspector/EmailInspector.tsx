"use client"

import * as React from "react"
import { Field } from "../../types"
import { PropertyToggle } from "./PropertyControls"
import { InspectorProps } from "./TextInspector"

export function EmailInspector({ field, onChange, match }: InspectorProps) {
  const validation = field.validation || { required: false }

  const handleToggle = (checked: boolean) => {
    onChange({
      validation: {
        ...validation,
        email: checked
      }
    })
  }

  const showEmailToggle = match("Email Format") || match("Validate Email Format")

  if (!showEmailToggle) return null

  return (
    <div className="space-y-2">
      <PropertyToggle
        label="Validate Email Format"
        checked={!!validation.email}
        onChange={handleToggle}
        description="Verify inputs conform to standard email formatting rules."
      />
    </div>
  )
}

export default EmailInspector;
