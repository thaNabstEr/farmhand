"use client"

import * as React from "react"
import { Trash2, Copy, Settings } from "lucide-react"
import * as Icons from "lucide-react"
import { Field } from "../types"
import { FieldRenderer } from "./FieldRenderer"
import { cn } from "@/lib/utils"
import { DragHandle } from "@/form-builder/components/dnd/DragHandle"

export interface CanvasFieldCardProps {
  field: Field;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
}

export function CanvasFieldCard({
  field,
  isActive,
  onSelect,
  onRemove,
  onDuplicate
}: CanvasFieldCardProps) {
  // Map field type to its corresponding Lucide icon
  const getFieldIcon = (type: string): React.ComponentType<{ className?: string }> => {
    const iconMap: Record<string, keyof typeof Icons> = {
      text: "Type",
      number: "Hash",
      paragraph: "AlignLeft",
      email: "Mail",
      phone: "Phone",
      date: "Calendar",
      time: "Clock",
      dropdown: "ChevronDown",
      radio: "CircleDot",
      checkboxes: "CheckSquare",
      photo: "Camera",
      signature: "PenTool",
      barcode: "Barcode",
      qrcode: "QrCode",
      gps: "MapPin",
      map: "Map",
      section: "Layout",
      repeat_group: "Repeat",
      divider: "Minus"
    };

    const iconName = iconMap[type] || "HelpCircle";
    return (Icons[iconName] as React.ComponentType<{ className?: string }>) || Icons.HelpCircle;
  };

  const IconComponent = getFieldIcon(field.type);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={cn(
        "group relative flex gap-4 p-5 rounded-card bg-card border transition-all duration-200 cursor-pointer shadow-card hover:shadow-hover",
        isActive
          ? "border-primary bg-primary-soft/10 dark:bg-primary-soft/5 ring-2 ring-primary/20 shadow-hover"
          : "border-neutral-200/60 dark:border-neutral-800/40 hover:border-neutral-350 dark:hover:border-neutral-700"
      )}
    >
      {/* Left: Drag Handle */}
      <DragHandle className="-ml-1 text-neutral-350 dark:text-neutral-700 group-hover:text-neutral-500 transition-colors" />

      {/* Middle: Content */}
      <div className="flex-1 min-w-0 space-y-3.5">
        {/* Card Header (Icon + Label + Badges) */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/40 dark:border-neutral-800/40 text-neutral-500 dark:text-neutral-400 shrink-0">
              <IconComponent className="size-3.5" />
            </div>
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">
              {field.label}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {field.required && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-wider scale-95 select-none">
                Required
              </span>
            )}
            
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-450 border border-neutral-200/40 dark:border-neutral-800/40 uppercase tracking-wider scale-95 select-none font-mono">
              {field.type}
            </span>
          </div>
        </div>

        {/* Input Block Renderer */}
        <div className="min-w-0 pointer-events-none">
          <FieldRenderer field={field} />
        </div>
      </div>

      {/* Hover Action Menu Panel */}
      <div className="absolute right-4 top-4 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 flex items-center gap-1 bg-card border border-neutral-200/60 dark:border-neutral-800/60 rounded-lg p-1 shadow-sm select-none z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          disabled
          className="p-1.5 rounded-md text-neutral-300 dark:text-neutral-750 cursor-not-allowed"
          title="Field Properties (Milestone 5)"
        >
          <Settings className="size-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-1.5 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
          title="Duplicate Field"
        >
          <Copy className="size-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1.5 rounded-md hover:bg-red-500/10 text-neutral-400 hover:text-red-500 transition-colors"
          title="Delete Field"
        >
          <Trash2 className="size-3.5" />
        </button>
        <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-0.5" />
        <DragHandle 
          className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-grab active:cursor-grabbing size-7 items-center justify-center rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-900" 
          title="Move Handle"
        />
      </div>
    </div>
  )
}
export default CanvasFieldCard;
