"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { FieldRendererProps } from "@/form-builder/types"

export function DropdownField({ field }: FieldRendererProps) {
  const placeholder = field.placeholder || field.settings?.placeholder || "Select option..."
  const options = field.settings?.options || []

  return (
    <div className="space-y-1.5 pointer-events-none select-none">
      <div className="h-10 px-3.5 rounded-input border border-neutral-250 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-xs font-medium text-neutral-400 flex items-center justify-between">
        <span>{placeholder}</span>
        <ChevronDown className="size-4 text-neutral-400 shrink-0" />
      </div>
      {options.length > 0 && (
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-neutral-400">
          <span>{options.length} option{options.length !== 1 ? "s" : ""} configured</span>
        </div>
      )}
    </div>
  )
}

export default DropdownField;
