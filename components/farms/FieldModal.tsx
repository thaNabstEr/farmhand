"use client"

import * as React from "react"
import { Field } from "@/lib/repositories/SupabaseFarmRepository"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, X, Map } from "lucide-react"

interface FieldModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string, area?: number | null, areaUnit?: string, description?: string) => Promise<void>
  initialData?: Field | null
}

export function FieldModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: FieldModalProps) {
  const [name, setName] = React.useState("")
  const [area, setArea] = React.useState<string>("")
  const [areaUnit, setAreaUnit] = React.useState("hectares")
  const [description, setDescription] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name || "")
      setArea(initialData.area !== null && initialData.area !== undefined ? String(initialData.area) : "")
      setAreaUnit(initialData.area_unit || "hectares")
      setDescription(initialData.description || "")
    } else {
      setName("")
      setArea("")
      setAreaUnit("hectares")
      setDescription("")
    }
    setError(null)
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Field name is required.")
      return
    }

    let parsedArea: number | null = null
    if (area.trim() !== "") {
      parsedArea = parseFloat(area)
      if (isNaN(parsedArea) || parsedArea < 0) {
        setError("Please enter a valid non-negative area number.")
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      await onSave(
        name.trim(),
        parsedArea,
        areaUnit || "hectares",
        description.trim() || undefined
      )
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
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Map className="size-4" />
            </div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              {initialData ? "Edit Field" : "Add New Field"}
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Field Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. North Orchard Block A"
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Area <span className="text-neutral-400 font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. 12.5"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Unit
              </label>
              <input
                type="text"
                disabled
                value={areaUnit}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 font-medium cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Description <span className="text-neutral-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. High yield corn section with drip irrigation."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all resize-none"
            />
          </div>

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
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{initialData ? "Save Changes" : "Add Field"}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
