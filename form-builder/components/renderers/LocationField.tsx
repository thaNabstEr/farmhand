"use client"

import * as React from "react"
import { MapPin } from "lucide-react"
import { FieldRendererProps } from "@/form-builder/types"

export function LocationField({ field }: FieldRendererProps) {
  const buttonLabel = field.settings?.buttonLabel || "Capture Location"

  return (
    <div className="space-y-2 pointer-events-none select-none">
      <div className="h-10 px-4 rounded-input border border-neutral-250 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/60 text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-2 w-fit">
        <MapPin className="size-4 text-primary shrink-0" />
        <span>{buttonLabel}</span>
      </div>
      <div className="text-[10px] font-medium text-neutral-400">
        GPS Geolocation API (Browser coordinates & accuracy)
      </div>
    </div>
  )
}

export default LocationField;
