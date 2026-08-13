"use client"

import * as React from "react"
import {
  Farm,
  Field,
  supabaseFarmRepository,
} from "@/lib/repositories/SupabaseFarmRepository"
import { Button } from "@/components/ui/button"
import { AlertCircle, X, MapPin, Map, Play } from "lucide-react"

interface StartSubmissionModalProps {
  isOpen: boolean
  formName: string
  onClose: () => void
  onStart: (farmId: string, fieldId?: string) => void
}

export function StartSubmissionModal({
  isOpen,
  formName,
  onClose,
  onStart,
}: StartSubmissionModalProps) {
  const [farms, setFarms] = React.useState<Farm[]>([])
  const [fields, setFields] = React.useState<Field[]>([])
  const [selectedFarmId, setSelectedFarmId] = React.useState<string>("")
  const [selectedFieldId, setSelectedFieldId] = React.useState<string>("")

  const [loadingFarms, setLoadingFarms] = React.useState(false)
  const [loadingFields, setLoadingFields] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch farms on open
  React.useEffect(() => {
    if (!isOpen) return
    setError(null)
    setSelectedFarmId("")
    setSelectedFieldId("")
    setFields([])

    const fetchFarms = async () => {
      setLoadingFarms(true)
      try {
        const list = await supabaseFarmRepository.getFarms()
        setFarms(list)
        if (list.length > 0) {
          setSelectedFarmId(list[0].id)
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        setError(msg)
      } finally {
        setLoadingFarms(false)
      }
    }

    fetchFarms()
  }, [isOpen])

  // Fetch fields when farm changes
  React.useEffect(() => {
    if (!selectedFarmId) {
      setFields([])
      setSelectedFieldId("")
      return
    }

    const fetchFields = async () => {
      setLoadingFields(true)
      try {
        const list = await supabaseFarmRepository.getFieldsByFarmId(selectedFarmId)
        setFields(list)
        setSelectedFieldId(list.length > 0 ? list[0].id : "")
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error("Failed to load fields:", msg)
      } finally {
        setLoadingFields(false)
      }
    }

    fetchFields()
  }, [selectedFarmId])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFarmId) {
      setError("Please select a farm for this data collection submission.")
      return
    }

    onStart(selectedFarmId, selectedFieldId || undefined)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Play className="size-4" />
            </div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Start Data Collection
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800">
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
              Form Template
            </span>
            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate block">
              {formName}
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Farm Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <MapPin className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Select Farm <span className="text-red-500">*</span></span>
            </label>

            {loadingFarms ? (
              <div className="h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
            ) : farms.length === 0 ? (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
                No farms found. Please create a farm first before completing submissions.
              </div>
            ) : (
              <select
                value={selectedFarmId}
                onChange={(e) => setSelectedFarmId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              >
                {farms.map((farm) => (
                  <option key={farm.id} value={farm.id}>
                    {farm.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Field Selector */}
          {selectedFarmId && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Map className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Select Field <span className="text-neutral-400 font-normal">(Optional)</span></span>
              </label>

              {loadingFields ? (
                <div className="h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
              ) : (
                <select
                  value={selectedFieldId}
                  onChange={(e) => setSelectedFieldId(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                >
                  <option value="">-- General Farm (No Specific Field) --</option>
                  {fields.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.name} {field.area ? `(${field.area} ${field.area_unit})` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedFarmId || loadingFarms}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-2"
            >
              <Play className="size-3.5 fill-current" />
              <span>Begin Entry</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
