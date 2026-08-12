"use client"

import * as React from "react"
import { FormSchema } from "@/form-builder/types"

export interface RunnerHeaderProps {
  schema: FormSchema
  mode?: "preview" | "fill"
  saveStatus?: "saved" | "saving" | "unsaved"
}

export function RunnerHeader({ schema, mode = "preview", saveStatus = "saved" }: RunnerHeaderProps) {
  const renderSaveBadge = () => {
    if (mode !== "fill") return null

    switch (saveStatus) {
      case "saving":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <span className="size-1.5 rounded-full bg-blue-500 animate-ping" />
            Saving...
          </span>
        )
      case "unsaved":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Unsaved
          </span>
        )
      case "saved":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            ✓ Saved
          </span>
        )
    }
  }

  return (
    <div className="bg-card rounded-card border border-neutral-200/80 dark:border-neutral-850 p-6 sm:p-8 shadow-card space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
          {schema.name || "Untitled Form"}
        </h1>

        <div className="flex items-center gap-2 shrink-0">
          {mode === "fill" && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
              Draft Submission
            </span>
          )}
          {renderSaveBadge()}
        </div>
      </div>
      
      {schema.description && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
          {schema.description}
        </p>
      )}
    </div>
  )
}

export default RunnerHeader
