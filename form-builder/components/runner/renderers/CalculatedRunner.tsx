"use client"

import * as React from "react"
import { Calculator } from "lucide-react"
import { RunnerFieldProps } from "../../../types"

export function CalculatedRunner({ field, value }: RunnerFieldProps) {
  const isValuePresent = value !== undefined && value !== null && value !== "" && !isNaN(Number(value))
  const displayVal = isValuePresent ? String(value) : "—"
  const unit = field.calculation?.unit

  return (
    <div className="flex items-center gap-2">
      <div
        title={!isValuePresent ? "Enter required values" : undefined}
        className={`flex-1 h-10 px-3.5 rounded-input border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80 text-sm font-semibold flex items-center justify-between font-mono select-all ${
          !isValuePresent ? "text-neutral-400 dark:text-neutral-500 italic" : "text-neutral-900 dark:text-neutral-100"
        }`}
      >
        <span>{displayVal}</span>
        {unit && isValuePresent && (
          <span className="text-xs font-sans text-neutral-400 font-medium">
            {unit}
          </span>
        )}
      </div>
      <div className="size-10 rounded-input bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
        <Calculator className="size-4" />
      </div>
    </div>
  )
}

export default CalculatedRunner;
