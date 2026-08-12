"use client"

import * as React from "react"
import { AlertTriangle, X } from "lucide-react"
import { FormMetadata } from "@/lib/repositories/types"
import { Button } from "@/components/ui/button"

export interface DeleteFormDialogProps {
  form: FormMetadata | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (id: string) => void
}

export function DeleteFormDialog({
  form,
  isOpen,
  onClose,
  onConfirm,
}: DeleteFormDialogProps) {
  if (!isOpen || !form) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div
        className="w-full max-w-md bg-card rounded-card border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-2xl space-y-5 relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="size-11 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="size-5" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
              Delete &quot;{form.name}&quot;?
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
              This will permanently remove this form and all its schema rules from this device. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs font-semibold">
            Cancel
          </Button>

          <Button
            size="sm"
            onClick={() => onConfirm(form.id)}
            className="text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs"
          >
            Delete Form
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DeleteFormDialog;
