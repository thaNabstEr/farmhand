"use client"

import * as React from "react"
import { RunnerFieldProps } from "../../../types"
import { Layout, Repeat } from "lucide-react"

export function SectionRunner({ field }: RunnerFieldProps) {
  return (
    <div className="pt-2 pb-1 border-b border-neutral-200 dark:border-neutral-800 mb-2">
      <div className="flex items-center gap-2 text-primary font-bold text-sm">
        <Layout className="size-4" />
        <span>{field.label}</span>
      </div>
      {field.description && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
          {field.description}
        </p>
      )}
    </div>
  )
}

export function RepeatGroupRunner({ field }: RunnerFieldProps) {
  return (
    <div className="p-4 rounded-card border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-2">
      <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 dark:text-neutral-200">
        <Repeat className="size-4 text-primary" />
        <span>{field.label}</span>
      </div>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
        Repeat group entry block
      </p>
    </div>
  )
}

export function DividerRunner({}: RunnerFieldProps) {
  return <hr className="my-3 border-t border-neutral-200 dark:border-neutral-800" />
}
