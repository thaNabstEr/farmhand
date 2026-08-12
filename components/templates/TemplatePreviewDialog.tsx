"use client"

import * as React from "react"
import { X, ArrowRight, Lock } from "lucide-react"
import { TemplateDefinition } from "@/lib/templates"
import { Button } from "@/components/ui/button"

export interface TemplatePreviewDialogProps {
  template: TemplateDefinition | null
  isOpen: boolean
  onClose: () => void
  onUseTemplate: (templateId: string) => void
}

export function TemplatePreviewDialog({
  template,
  isOpen,
  onClose,
  onUseTemplate,
}: TemplatePreviewDialogProps) {
  if (!isOpen || !template) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div
        className="w-full max-w-2xl bg-card rounded-card border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
        >
          <X className="size-4" />
        </button>

        {/* Header */}
        <div className="space-y-2 border-b border-neutral-100 dark:border-neutral-850 pb-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 uppercase tracking-wider">
              {template.category}
            </span>
            <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1">
              <Lock className="size-3" /> Read-Only Preview
            </span>
          </div>

          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
            {template.name}
          </h2>

          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
            {template.description}
          </p>
        </div>

        {/* Field List Container */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
            <span>Template Fields ({template.fieldCount})</span>
          </div>

          {template.schema.fields.map((field, idx) => (
            <div
              key={field.id}
              className="p-4 rounded-card border border-neutral-200/60 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/40 space-y-2 select-none"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-bold text-neutral-400 font-mono">#{idx + 1}</span>
                  <span className="text-xs font-bold text-neutral-850 dark:text-neutral-150 truncate">
                    {field.label}
                  </span>
                  {field.required && <span className="text-red-500 font-bold text-xs">*</span>}
                </div>

                {/* Indicators & Badges */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {field.logic?.enabled && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase">
                      ⚡ Conditional
                    </span>
                  )}
                  {field.type === "calculated" && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase">
                      Calculated
                    </span>
                  )}
                  {field.type === "repeat_group" && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 uppercase">
                      Repeat
                    </span>
                  )}
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-neutral-200/60 dark:bg-neutral-800 text-neutral-500 uppercase">
                    {field.type}
                  </span>
                </div>
              </div>

              {field.description && (
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                  {field.description}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-850 flex items-center justify-between shrink-0">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs font-semibold">
            Back
          </Button>

          <Button
            size="sm"
            onClick={() => onUseTemplate(template.id)}
            className="text-xs font-bold gap-1.5 px-4"
          >
            <span>Use Template</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TemplatePreviewDialog;
