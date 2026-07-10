"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// PropertyLabel
export interface PropertyLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  label: string;
  hint?: string;
}

export function PropertyLabel({ label, hint, className, ...props }: PropertyLabelProps) {
  return (
    <div className="flex items-center justify-between gap-2 select-none mb-1">
      <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
      {hint && (
        <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium">
          {hint}
        </span>
      )}
    </div>
  )
}

// PropertyInput
export interface PropertyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  hint?: string;
}

export function PropertyInput({ label, value, onChange, hint, className, ...props }: PropertyInputProps) {
  return (
    <div className="flex flex-col w-full">
      <label className="block">
        <PropertyLabel label={label} hint={hint} />
        <input
          {...props}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full h-8 px-2.5 rounded-input border border-neutral-200 dark:border-neutral-800 bg-neutral-50/20 dark:bg-neutral-900/10 text-xs text-neutral-800 dark:text-neutral-100 placeholder-neutral-450 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150 font-medium",
            className
          )}
        />
      </label>
    </div>
  )
}

// PropertyTextarea
export interface PropertyTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  hint?: string;
}

export function PropertyTextarea({ label, value, onChange, hint, className, ...props }: PropertyTextareaProps) {
  return (
    <div className="flex flex-col w-full">
      <label className="block">
        <PropertyLabel label={label} hint={hint} />
        <textarea
          {...props}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={props.rows || 2}
          className={cn(
            "w-full p-2.5 rounded-input border border-neutral-200 dark:border-neutral-800 bg-neutral-50/20 dark:bg-neutral-900/10 text-xs text-neutral-800 dark:text-neutral-100 placeholder-neutral-450 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150 font-medium resize-none leading-relaxed",
            className
          )}
        />
      </label>
    </div>
  )
}

// PropertyToggle
export interface PropertyToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export function PropertyToggle({ label, checked, onChange, description }: PropertyToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <div className="flex flex-col min-w-0 select-none">
        <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 leading-tight">
          {label}
        </span>
        {description && (
          <span className="text-[9.5px] text-neutral-450 dark:text-neutral-500 font-medium mt-0.5 leading-snug">
            {description}
          </span>
        )}
      </div>
      
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/25",
          checked ? "bg-primary" : "bg-neutral-250 dark:bg-neutral-800"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block size-3.5 transform rounded-full bg-white shadow-sm transition duration-150 ease-in-out",
            checked ? "translate-x-3.5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  )
}

// PropertySelect
export interface PropertySelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange"> {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  hint?: string;
}

export function PropertySelect({ label, value, onChange, options, hint, className, ...props }: PropertySelectProps) {
  return (
    <div className="flex flex-col w-full">
      <label className="block">
        <PropertyLabel label={label} hint={hint} />
        <select
          {...props}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full h-8 px-2 rounded-input border border-neutral-200 dark:border-neutral-800 bg-neutral-50/20 dark:bg-neutral-900/10 text-xs text-neutral-800 dark:text-neutral-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150 font-medium",
            className
          )}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-card text-neutral-800 dark:text-neutral-100 font-medium">
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

// PropertyDivider
export function PropertyDivider() {
  return <div className="h-px bg-neutral-100 dark:bg-neutral-800/80 my-3" />
}
