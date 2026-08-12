"use client"

import * as React from "react"
import { Edit3, X } from "lucide-react"
import { FormMetadata } from "@/lib/repositories/types"
import { Button } from "@/components/ui/button"

export interface RenameFormDialogProps {
  form: FormMetadata | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (id: string, newName: string) => void
}

export function RenameFormDialog({
  form,
  isOpen,
  onClose,
  onConfirm,
}: RenameFormDialogProps) {
  const [name, setName] = React.useState("")

  React.useEffect(() => {
    if (form) {
      setName(form.name)
    }
  }, [form])

  if (!isOpen || !form) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onConfirm(form.id, name.trim())
  }

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

        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Edit3 className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
              Rename Form
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              Enter a new name for this data collection form.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              Form Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter form name..."
              autoFocus
              className="w-full h-10 px-3.5 rounded-input border border-neutral-250 dark:border-neutral-800 bg-card text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-primary/25 font-semibold"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs font-semibold">
              Cancel
            </Button>

            <Button type="submit" size="sm" disabled={!name.trim()} className="text-xs font-bold px-4">
              Save Name
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RenameFormDialog;
