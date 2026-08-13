"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2, X } from "lucide-react"

interface DeleteConfirmModalProps {
  isOpen: boolean
  title: string
  itemName: string
  itemType: "farm" | "field"
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function DeleteConfirmModal({
  isOpen,
  title,
  itemName,
  itemType,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setError(null)
  }, [isOpen])

  if (!isOpen) return null

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)
    try {
      await onConfirm()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
              <AlertTriangle className="size-4" />
            </div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
              {error}
            </div>
          )}

          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-neutral-900 dark:text-neutral-100">&quot;{itemName}&quot;</span>?
          </p>

          {itemType === "farm" && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs space-y-1">
              <span className="font-semibold block">Cascade Deletion Warning:</span>
              <span className="text-[11px] leading-normal opacity-90 block">
                Deleting this farm will automatically delete all fields associated with it. This action cannot be undone.
              </span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={loading}
              onClick={handleConfirm}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete {itemType === "farm" ? "Farm" : "Field"}</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
