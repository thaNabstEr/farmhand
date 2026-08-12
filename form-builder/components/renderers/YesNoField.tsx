"use client"

import * as React from "react"
import { FieldRendererProps } from "@/form-builder/types"

export function YesNoField({ field }: FieldRendererProps) {
  const yesLabel = field.settings?.yesLabel || "Yes"
  const noLabel = field.settings?.noLabel || "No"

  return (
    <div className="flex items-center gap-3 pointer-events-none select-none">
      <div className="flex-1 h-9 rounded-input border border-neutral-250 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-xs font-bold text-neutral-600 dark:text-neutral-400 flex items-center justify-center gap-2">
        <div className="size-3.5 rounded-full border border-neutral-400" />
        <span>{yesLabel}</span>
      </div>

      <div className="flex-1 h-9 rounded-input border border-neutral-250 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-xs font-bold text-neutral-600 dark:text-neutral-400 flex items-center justify-center gap-2">
        <div className="size-3.5 rounded-full border border-neutral-400" />
        <span>{noLabel}</span>
      </div>
    </div>
  )
}

export default YesNoField;
