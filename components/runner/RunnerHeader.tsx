import * as React from "react"
import { FormSchema } from "@/form-builder/types"
import { MapPin, Map, Wifi, WifiOff, RefreshCw } from "lucide-react"
import { useConnectivity } from "@/lib/offline/useConnectivity"

export interface RunnerHeaderProps {
  schema: FormSchema
  mode?: "preview" | "fill"
  saveStatus?: "saved" | "saving" | "unsaved"
  farmName?: string
  fieldName?: string
}

export function RunnerHeader({
  schema,
  mode = "preview",
  saveStatus = "saved",
  farmName,
  fieldName,
}: RunnerHeaderProps) {
  const { isOnline, isSyncing, pendingCount } = useConnectivity()

  const renderSaveBadge = () => {
    if (mode !== "fill") return null

    switch (saveStatus) {
      case "saving":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <span className="size-1.5 rounded-full bg-blue-500 animate-ping" />
            Saving Draft...
          </span>
        )
      case "unsaved":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Unsaved Changes
          </span>
        )
      case "saved":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            {isOnline ? "✓ Draft Saved" : "✓ Saved Locally"}
          </span>
        )
    }
  }

  const renderConnectivityBadge = () => {
    if (isSyncing) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <RefreshCw className="size-3 animate-spin" />
          Syncing ({pendingCount})...
        </span>
      )
    }

    if (!isOnline) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <WifiOff className="size-3 text-amber-600" />
          Offline Mode
        </span>
      )
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <Wifi className="size-3 text-emerald-600" />
        Online
      </span>
    )
  }

  return (
    <div className="bg-card rounded-card border border-neutral-200/80 dark:border-neutral-850 p-6 sm:p-8 shadow-card space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
          {schema.name || "Untitled Form"}
        </h1>

        <div className="flex items-center gap-2 shrink-0">
          {renderConnectivityBadge()}
          {renderSaveBadge()}
        </div>
      </div>
      
      {/* Operational Farm & Field Context Pills */}
      {(farmName || fieldName) && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {farmName && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              <MapPin className="size-3.5 text-emerald-600" />
              <span>Farm: {farmName}</span>
            </span>
          )}
          {fieldName && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
              <Map className="size-3.5 text-blue-600" />
              <span>Field: {fieldName}</span>
            </span>
          )}
        </div>
      )}

      {schema.description && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
          {schema.description}
        </p>
      )}
    </div>
  )
}

export default RunnerHeader
