"use client"

import * as React from "react"
import { FieldRendererProps } from "@/form-builder/types"

export function RadioField({ field }: FieldRendererProps) {
  const options = field.settings?.options || []

  if (options.length === 0) {
    return (
      <div className="p-3 rounded-input border border-dashed border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-400 font-medium italic select-none">
        No options configured yet. Add options in the Inspector.
      </div>
    )
  }

  return (
    <div className="space-y-2 pointer-events-none select-none">
      {options.slice(0, 4).map((opt) => {
        const optKey = opt.id || opt.value || `opt_${opt.label}`
        return (
          <div key={optKey} className="flex items-center gap-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            <div className="size-4 rounded-full border border-neutral-300 dark:border-neutral-700 shrink-0" />
            <span>{opt.label || "Untitled Option"}</span>
          </div>
        )
      })}
      {options.length > 4 && (
        <p className="text-[10px] font-medium text-neutral-400 italic">
          + {options.length - 4} more option{options.length - 4 !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  )
}

export default RadioField;
