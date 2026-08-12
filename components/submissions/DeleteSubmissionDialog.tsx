"use client"

import * as React from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormSubmission } from "@/lib/repositories/types"

export interface DeleteSubmissionDialogProps {
  submission: FormSubmission | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function DeleteSubmissionDialog({
  submission,
  isOpen,
  onClose,
  onConfirm,
}: DeleteSubmissionDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)

  if (!isOpen || !submission) return null

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150" onClick={onClose} />

      {/* Dialog Card */}
      <div className="relative w-full max-w-md bg-card border border-neutral-200 dark:border-neutral-800 rounded-card shadow-2xl p-6 space-y-4 z-50 animate-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 shrink-0">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50">
              Delete Submission?
            </h3>
            <p className="text-xs text-neutral-400 font-mono">
              ID: {submission.id}
            </p>
          </div>
        </div>

        <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
          Are you sure you want to delete this submission record? This action cannot be undone.
        </p>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs font-bold gap-1.5"
          >
            {isDeleting && <Loader2 className="size-3.5 animate-spin" />}
            <span>Delete Submission</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DeleteSubmissionDialog
