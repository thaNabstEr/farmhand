"use client"

import * as React from "react"
import { Field } from "@/form-builder/types"
import { RunnerFieldRenderer } from "./RunnerFieldRenderer"
import { ValidationMessage } from "./ValidationMessage"
import { cn } from "@/lib/utils"

export interface RunnerFieldWrapperProps {
  field: Field;
  value: unknown;
  onChange: (val: unknown) => void;
  error?: string | null;
  inputRef?: (el: HTMLDivElement | null) => void;
}

export function RunnerField({ field, value, onChange, error, inputRef }: RunnerFieldWrapperProps) {
  // Section and Divider field types are structural dividers rather than input fields
  if (field.type === "section" || field.type === "divider") {
    return (
      <div ref={inputRef} id={`runner-field-${field.id}`} className="w-full">
        <RunnerFieldRenderer field={field} value={value} onChange={onChange} error={error} />
      </div>
    )
  }

  return (
    <div
      ref={inputRef}
      id={`runner-field-${field.id}`}
      className={cn(
        "p-5 sm:p-6 rounded-card bg-card border transition-all duration-200 shadow-card space-y-3 w-full",
        error
          ? "border-red-500/80 ring-2 ring-red-500/10 dark:border-red-500/80"
          : "border-neutral-200/80 dark:border-neutral-850 hover:border-neutral-300 dark:hover:border-neutral-800"
      )}
    >
      {/* Field Label */}
      {!field.settings?.hiddenLabel && (
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-bold text-neutral-850 dark:text-neutral-150 tracking-tight flex items-center gap-1 select-none">
            <span>{field.label}</span>
            {field.required && (
              <span className="text-red-500 font-bold" title="Required Field">
                *
              </span>
            )}
          </label>
        </div>
      )}

      {/* Field Description */}
      {field.description && (
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed -mt-1">
          {field.description}
        </p>
      )}

      {/* Input Renderer */}
      <div className="min-w-0">
        <RunnerFieldRenderer field={field} value={value} onChange={onChange} error={error} />
      </div>

      {/* Helper Text */}
      {field.settings?.helperText && (
        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium leading-normal mt-1">
          {field.settings.helperText}
        </p>
      )}

      {/* Inline Validation Error */}
      <ValidationMessage message={error} />
    </div>
  )
}

export default RunnerField;
