"use client"

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { RunnerFieldProps } from "../../../types"

// 1. Dropdown Runner (Single Select)
export function DropdownRunner({ field, value, onChange }: RunnerFieldProps) {
  const options = field.settings?.options || []
  const placeholder = field.placeholder || field.settings?.placeholder || "Select an option..."
  const currentValue = typeof value === "string" ? value : ""

  return (
    <div className="relative">
      <select
        id={field.id}
        aria-label={field.label}
        value={currentValue}
        onChange={(e) => onChange?.(e.target.value || null)}
        className="w-full h-10 pl-3.5 pr-10 rounded-input border border-neutral-250 dark:border-neutral-800 bg-card text-sm font-semibold text-neutral-900 dark:text-neutral-100 outline-none focus:ring-2 focus:ring-primary/25 cursor-pointer appearance-none"
      >
        <option value="" disabled className="text-neutral-400 font-normal">
          {placeholder}
        </option>
        {options.map((opt) => {
          const optKey = opt.id || opt.value || `opt_${opt.label}`
          return (
            <option key={optKey} value={opt.value}>
              {opt.label || opt.value}
            </option>
          )
        })}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400 pointer-events-none" />
    </div>
  )
}

// 2. Radio Buttons Runner (Single Select)
export function RadioRunner({ field, value, onChange }: RunnerFieldProps) {
  const options = field.settings?.options || []
  const currentValue = typeof value === "string" ? value : null

  if (options.length === 0) {
    return (
      <div className="text-xs text-neutral-400 italic">
        No options available.
      </div>
    )
  }

  return (
    <div role="radiogroup" aria-label={field.label} className="space-y-2 select-none">
      {options.map((opt) => {
        const isSelected = currentValue === opt.value
        const optKey = opt.id || opt.value || `opt_${opt.label}`
        return (
          <div
            key={optKey}
            onClick={() => onChange?.(opt.value)}
            className={`p-3 rounded-card border transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 ${
              isSelected
                ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xs"
                : "border-neutral-200/80 dark:border-neutral-800 bg-card hover:border-neutral-300 dark:hover:border-neutral-750"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`size-4 rounded-full border flex items-center justify-center transition-all ${
                  isSelected
                    ? "border-primary bg-primary"
                    : "border-neutral-350 dark:border-neutral-700 bg-transparent"
                }`}
              >
                {isSelected && <div className="size-1.5 rounded-full bg-white" />}
              </div>
              <span className={`text-xs font-semibold truncate ${isSelected ? "text-primary" : "text-neutral-850 dark:text-neutral-150"}`}>
                {opt.label || opt.value}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// 3. Checkbox Multi-Select Runner (Array State)
export function CheckboxRunner({ field, value, onChange }: RunnerFieldProps) {
  const options = field.settings?.options || []
  const currentArray: string[] = Array.isArray(value) ? (value as string[]) : []

  if (options.length === 0) {
    return (
      <div className="text-xs text-neutral-400 italic">
        No options available.
      </div>
    )
  }

  const handleToggle = (optValue: string) => {
    const exists = currentArray.includes(optValue)
    const next = exists
      ? currentArray.filter((v) => v !== optValue)
      : [...currentArray, optValue]
    onChange?.(next)
  }

  return (
    <div aria-label={field.label} className="space-y-2 select-none">
      {options.map((opt) => {
        const isChecked = currentArray.includes(opt.value)
        const optKey = opt.id || opt.value || `opt_${opt.label}`
        return (
          <div
            key={optKey}
            onClick={() => handleToggle(opt.value)}
            className={`p-3 rounded-card border transition-all duration-150 cursor-pointer flex items-center justify-between gap-3 ${
              isChecked
                ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xs"
                : "border-neutral-200/80 dark:border-neutral-800 bg-card hover:border-neutral-300 dark:hover:border-neutral-750"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`size-4 rounded-md border flex items-center justify-center transition-all ${
                  isChecked
                    ? "border-primary bg-primary text-white"
                    : "border-neutral-350 dark:border-neutral-700 bg-transparent"
                }`}
              >
                {isChecked && <Check className="size-3 stroke-[3]" />}
              </div>
              <span className={`text-xs font-semibold truncate ${isChecked ? "text-primary" : "text-neutral-850 dark:text-neutral-150"}`}>
                {opt.label || opt.value}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// 4. Yes / No Specialized Boolean Runner (Boolean State)
export function YesNoRunner({ field, value, onChange }: RunnerFieldProps) {
  const yesLabel = field.settings?.yesLabel || "Yes"
  const noLabel = field.settings?.noLabel || "No"
  
  // Coerce boolean value safely
  const currentBool =
    value === true || value === "true"
      ? true
      : value === false || value === "false"
      ? false
      : null

  return (
    <div className="grid grid-cols-2 gap-3 select-none" role="group" aria-label={field.label}>
      {/* Yes Button */}
      <button
        type="button"
        onClick={() => onChange?.(true)}
        className={`h-11 px-4 rounded-card border font-bold text-xs flex items-center justify-center gap-2 transition-all duration-150 ${
          currentBool === true
            ? "border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-xs"
            : "border-neutral-200/80 dark:border-neutral-800 bg-card text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-750"
        }`}
      >
        <div
          className={`size-4 rounded-full border flex items-center justify-center transition-all ${
            currentBool === true
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-neutral-350 dark:border-neutral-700"
          }`}
        >
          {currentBool === true && <div className="size-1.5 rounded-full bg-white" />}
        </div>
        <span>{yesLabel}</span>
      </button>

      {/* No Button */}
      <button
        type="button"
        onClick={() => onChange?.(false)}
        className={`h-11 px-4 rounded-card border font-bold text-xs flex items-center justify-center gap-2 transition-all duration-150 ${
          currentBool === false
            ? "border-red-600 bg-red-500/10 text-red-700 dark:text-red-400 shadow-xs"
            : "border-neutral-200/80 dark:border-neutral-800 bg-card text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-750"
        }`}
      >
        <div
          className={`size-4 rounded-full border flex items-center justify-center transition-all ${
            currentBool === false
              ? "border-red-600 bg-red-600 text-white"
              : "border-neutral-350 dark:border-neutral-700"
          }`}
        >
          {currentBool === false && <div className="size-1.5 rounded-full bg-white" />}
        </div>
        <span>{noLabel}</span>
      </button>
    </div>
  )
}

export default DropdownRunner;
