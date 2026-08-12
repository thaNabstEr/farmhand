"use client"

import * as React from "react"
import { X, CheckCircle2, Clock, MapPin, Calculator, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormSubmission } from "@/lib/repositories/types"
import { FormSchema, Field, LocationResponse, PhotoItem } from "@/form-builder/types"
import { evaluateExpression } from "@/lib/calculations/engine"

export interface SubmissionDetailDialogProps {
  submission: FormSubmission | null
  formSchema: FormSchema | null
  isOpen: boolean
  onClose: () => void
}

export function SubmissionDetailDialog({
  submission,
  formSchema,
  isOpen,
  onClose,
}: SubmissionDetailDialogProps) {
  if (!isOpen || !submission) return null

  const responses = submission.responses || {}
  const fields = formSchema?.fields || []

  const formattedSubmittedDate = submission.submittedAt
    ? new Date(submission.submittedAt).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null

  const formattedCreatedDate = new Date(submission.createdAt).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  })

  // Render field response formatted according to field type
  const renderResponseValue = (field: Field, val: unknown) => {
    if (val === undefined || val === null || val === "") {
      return <span className="text-neutral-400 dark:text-neutral-500 italic text-xs">—</span>
    }

    // 1. Choice: Dropdown / Radio
    if (field.type === "dropdown" || field.type === "radio") {
      const option = field.settings?.options?.find((opt) => opt.value === String(val))
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
          {option?.label || String(val)}
        </span>
      )
    }

    // 2. Choice: Checkbox / Multi-Select
    if (field.type === "checkbox" || field.type === "checkboxes") {
      const arr = Array.isArray(val) ? val : [val]
      if (arr.length === 0) return <span className="text-neutral-400 italic text-xs">—</span>
      return (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {arr.map((itemVal) => {
            const option = field.settings?.options?.find((opt) => opt.value === String(itemVal))
            return (
              <span
                key={String(itemVal)}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
              >
                {option?.label || String(itemVal)}
              </span>
            )
          })}
        </div>
      )
    }

    // 3. Choice: Yes / No
    if (field.type === "yes_no") {
      const yesLabel = field.settings?.yesLabel || "Yes"
      const noLabel = field.settings?.noLabel || "No"
      const isYes = val === true || val === "true"
      const isNo = val === false || val === "false"

      if (isYes) {
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            ✓ {yesLabel}
          </span>
        )
      }
      if (isNo) {
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20">
            ✕ {noLabel}
          </span>
        )
      }
    }

    // 4. Field Data: Location / GPS
    if (field.type === "location" || field.type === "gps") {
      if (typeof val === "object" && val !== null && "latitude" in (val as Record<string, unknown>)) {
        const loc = val as LocationResponse
        return (
          <div className="p-3 rounded-card border border-emerald-500/30 bg-emerald-500/5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <MapPin className="size-3.5" />
              <span>Location Captured</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-[9px] font-bold text-neutral-400 uppercase block">Latitude</span>
                <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">{loc.latitude}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-neutral-400 uppercase block">Longitude</span>
                <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">{loc.longitude}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-neutral-400 uppercase block">Accuracy</span>
                <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">{loc.accuracy} m</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-neutral-400 uppercase block">Captured</span>
                <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                  {new Date(loc.capturedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          </div>
        )
      }
    }

    // 5. Field Data: Photo
    if (field.type === "photo") {
      const photos: PhotoItem[] = Array.isArray(val)
        ? (val as PhotoItem[])
        : typeof val === "object" && val !== null && "dataUrl" in (val as Record<string, unknown>)
        ? [val as PhotoItem]
        : []
      if (photos.length === 0) return <span className="text-neutral-400 italic text-xs">—</span>

      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {photos.map((photo) => (
            <div key={photo.id} className="relative rounded-card overflow-hidden border border-neutral-200 dark:border-neutral-800 aspect-square shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.dataUrl} alt={photo.name || "Photo"} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )
    }

    // 6. Advanced: Calculated
    if (field.type === "calculated") {
      const unit = field.calculation?.unit
      const computed = field.calculation?.expression
        ? evaluateExpression(field.calculation.expression, responses, formSchema || undefined)
        : null
      const display = computed !== null ? String(computed) : String(val)
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-card bg-neutral-100 dark:bg-neutral-800 font-mono font-bold text-xs text-neutral-900 dark:text-neutral-100">
          <Calculator className="size-3.5 text-blue-500 shrink-0" />
          <span>{display}</span>
          {unit && <span className="text-[10px] font-sans font-medium text-neutral-400">{unit}</span>}
        </div>
      )
    }

    // 7. Advanced: Repeat Group
    if (field.type === "repeat_group") {
      const items = Array.isArray(val) ? (val as Record<string, unknown>[]) : []
      if (items.length === 0) return <span className="text-neutral-400 italic text-xs">No repeat items recorded</span>

      const childFields = field.settings?.childFields || []

      return (
        <div className="space-y-3 pt-1">
          {items.map((item, idx) => (
            <div
              key={`repeat_item_${idx}`}
              className="p-3.5 rounded-card border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-2.5"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                <Layers className="size-3.5 text-primary" />
                <span>Item #{idx + 1}</span>
              </div>
              <div className="space-y-2 pl-2 border-l-2 border-primary/30">
                {childFields.map((child) => (
                  <div key={child.id} className="space-y-0.5">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                      {child.label}
                    </span>
                    <div>{renderResponseValue(child, item[child.id])}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    }

    // Default String / Numeric display
    return <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">{String(val)}</span>
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-card border border-neutral-200 dark:border-neutral-800 rounded-card shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-4 shrink-0 bg-neutral-50/50 dark:bg-neutral-900/40">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 truncate">
                {formSchema?.name || "Form Submission"}
              </h2>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  submission.status === "submitted"
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                }`}
              >
                {submission.status === "submitted" ? "Submitted" : "Draft"}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-medium font-mono">
              <span>ID: {submission.id}</span>
              <span>•</span>
              <span>Version: v{submission.formVersion}</span>
            </div>
          </div>

          <Button type="button" variant="ghost" size="icon" onClick={onClose} className="size-8 rounded-full">
            <X className="size-4" />
          </Button>
        </div>

        {/* Submission Metadata Banner */}
        <div className="px-6 py-2.5 bg-neutral-100/60 dark:bg-neutral-850 border-b border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-400 gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-neutral-400" />
            <span>Created: {formattedCreatedDate}</span>
          </div>
          {formattedSubmittedDate && (
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" />
              <span>Submitted: {formattedSubmittedDate}</span>
            </div>
          )}
        </div>

        {/* Responses Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
          {fields.length === 0 ? (
            <div className="text-center py-10 text-xs text-neutral-400 font-medium">
              No schema fields defined for this submission.
            </div>
          ) : (
            fields.map((field) => {
              if (field.type === "section" || field.type === "divider") return null
              const rawVal = responses[field.id]

              return (
                <div
                  key={field.id}
                  className="p-4 rounded-card border border-neutral-200/70 dark:border-neutral-800/80 bg-neutral-50/30 dark:bg-neutral-900/20 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      {field.label}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-400 uppercase">
                      {field.type}
                    </span>
                  </div>

                  {field.description && (
                    <p className="text-[11px] text-neutral-400 font-medium leading-normal">
                      {field.description}
                    </p>
                  )}

                  <div className="pt-1">{renderResponseValue(field, rawVal)}</div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-end shrink-0">
          <Button type="button" onClick={onClose} className="px-4 font-bold text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SubmissionDetailDialog
