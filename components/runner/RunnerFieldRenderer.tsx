"use client"

import * as React from "react"
import { fieldRegistry } from "@/form-builder/registry"
import { RunnerFieldProps } from "@/form-builder/types"

export function RunnerFieldRenderer(props: RunnerFieldProps) {
  const entry = fieldRegistry[props.field.type]
  const RunnerComponent = entry?.runner

  if (!RunnerComponent) {
    return (
      <div className="p-3 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-input text-xs text-neutral-400 font-medium">
        Interactive runner for field type: <span className="font-mono text-primary font-bold">{props.field.type}</span>
      </div>
    )
  }

  return <RunnerComponent {...props} />
}

export default RunnerFieldRenderer;
