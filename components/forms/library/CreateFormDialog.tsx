"use client"

import * as React from "react"
import { FilePlus, LayoutGrid, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface CreateFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelectBlank: () => void
  onSelectTemplate: () => void
}

export function CreateFormDialog({
  isOpen,
  onClose,
  onSelectBlank,
  onSelectTemplate,
}: CreateFormDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div
        className="w-full max-w-md bg-card rounded-card border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
        >
          <X className="size-4" />
        </button>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
            Create a New Form
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
            Choose how you would like to start building your inspection or data collection form.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Option 1: Blank Form */}
          <button
            type="button"
            onClick={onSelectBlank}
            className="p-4 rounded-card border border-neutral-200/80 dark:border-neutral-800 hover:border-primary dark:hover:border-primary bg-neutral-50/50 dark:bg-neutral-900/40 hover:bg-primary/5 dark:hover:bg-primary/10 text-left space-y-3 transition-all duration-150 group cursor-pointer"
          >
            <div className="size-10 rounded-xl bg-card border border-neutral-200/60 dark:border-neutral-800 text-primary flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <FilePlus className="size-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-primary transition-colors">
                Blank Form
              </h4>
              <p className="text-[11px] text-neutral-400 font-medium leading-normal">
                Start from scratch with an empty canvas.
              </p>
            </div>
          </button>

          {/* Option 2: Pre-built Template */}
          <button
            type="button"
            onClick={onSelectTemplate}
            className="p-4 rounded-card border border-neutral-200/80 dark:border-neutral-800 hover:border-primary dark:hover:border-primary bg-neutral-50/50 dark:bg-neutral-900/40 hover:bg-primary/5 dark:hover:bg-primary/10 text-left space-y-3 transition-all duration-150 group cursor-pointer"
          >
            <div className="size-10 rounded-xl bg-card border border-neutral-200/60 dark:border-neutral-800 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <LayoutGrid className="size-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-primary transition-colors">
                Use Template
              </h4>
              <p className="text-[11px] text-neutral-400 font-medium leading-normal">
                Start from a pre-built agricultural form template.
              </p>
            </div>
          </button>
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs font-semibold">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CreateFormDialog;
