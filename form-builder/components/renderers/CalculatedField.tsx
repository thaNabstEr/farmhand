"use client"

import * as React from "react"
import { Calculator } from "lucide-react"
import { FieldRendererProps } from "@/form-builder/types"

export function CalculatedField({ field }: FieldRendererProps) {
  const expression = field.calculation?.expression || ""
  const unit = field.calculation?.unit || ""

  return (
    <div className="space-y-1.5 pointer-events-none select-none">
      <div className="h-10 px-3.5 rounded-input border border-neutral-250 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/60 text-xs font-mono font-semibold text-neutral-600 dark:text-neutral-400 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 truncate">
          <Calculator className="size-4 text-blue-500 shrink-0" />
          {expression ? (
            <span className="truncate text-neutral-800 dark:text-neutral-200">{expression}</span>
          ) : (
            <span className="italic text-neutral-400 font-sans">No formula set. Configure in Inspector.</span>
          )}
        </div>
        {unit && <span className="text-[11px] font-sans font-medium text-neutral-400 shrink-0">{unit}</span>}
      </div>
      <p className="text-[10px] font-medium text-neutral-400">
        Automatically calculated from formula inputs during response entry
      </p>
    </div>
  )
}

export default CalculatedField;
