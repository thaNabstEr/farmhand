"use client"

import * as React from "react"
import { RunnerFieldProps } from "../../../types"
import { cn } from "@/lib/utils"

export function TimeRunner({ field, value, onChange, disabled, error }: RunnerFieldProps) {
  const strVal = typeof value === "string" ? value : ""

  return (
    <input
      type="time"
      value={strVal}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || field.settings?.readOnly}
      aria-invalid={!!error}
      className={cn(
        "w-full h-10 px-3.5 rounded-input border bg-card text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-primary/25 transition-all duration-150 font-medium",
        error
          ? "border-red-500/80 ring-2 ring-red-500/15 dark:border-red-500/80"
          : "border-neutral-250 dark:border-neutral-800 focus:border-primary",
        disabled && "bg-neutral-100 dark:bg-neutral-900 opacity-60 cursor-not-allowed"
      )}
    />
  )
}

export default TimeRunner;
