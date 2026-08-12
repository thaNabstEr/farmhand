"use client"

import * as React from "react"
import { Camera } from "lucide-react"
import { FieldRendererProps } from "@/form-builder/types"

export function PhotoField({ field }: FieldRendererProps) {
  const buttonLabel = field.settings?.buttonLabel || "Add Photo"
  const maxPhotos = field.settings?.maxPhotos || 1

  return (
    <div className="space-y-2 pointer-events-none select-none">
      <div className="h-10 px-4 rounded-input border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-900/60 text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-2 w-fit">
        <Camera className="size-4 text-primary shrink-0" />
        <span>{buttonLabel}</span>
      </div>
      <div className="text-[10px] font-medium text-neutral-400">
        Camera / Image Upload (Max {maxPhotos} photo{maxPhotos !== 1 ? "s" : ""})
      </div>
    </div>
  )
}

export default PhotoField;
