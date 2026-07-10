"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { useFormBuilder } from "@/form-builder/state/FormBuilderContext"
import { useToast } from "@/components/shared/ToastProvider"

export function ClearFormDialog() {
  const { state, clearFields, setIsClearFormDialogOpen } = useFormBuilder()
  const { showToast } = useToast()

  if (!state.isClearFormDialogOpen) return null

  const handleConfirm = () => {
    clearFields()
    setIsClearFormDialogOpen(false)
    showToast("Form Cleared", "warning")
  }

  const handleClose = () => {
    setIsClearFormDialogOpen(false)
  }

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-neutral-950/40 dark:bg-neutral-950/60 backdrop-blur-xs transition-opacity duration-200 animate-fade-in" 
        onClick={handleClose} 
      />

      {/* Dialog Content */}
      <div className="bg-card dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-dialog p-6 shadow-xl max-w-sm w-full relative z-10 transition-all duration-200 animate-in fade-in zoom-in-95 duration-150">
        <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
          Clear Form?
        </h3>
        
        <p className="mt-2.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
          This will remove every field from the form. Your title and description will remain.
        </p>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose}
            className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 font-semibold"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleConfirm}
            className="font-semibold"
          >
            Clear Form
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ClearFormDialog;

