"use client"

import * as React from "react"
import { ArrowLeft, Monitor, Smartphone, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip } from "@/components/shared/Tooltip"
import { cn } from "@/lib/utils"

export interface PreviewToolbarProps {
  formName: string;
  viewport: "desktop" | "mobile";
  onViewportChange: (mode: "desktop" | "mobile") => void;
  onBackToBuilder: () => void;
  onResetResponses: () => void;
}

export function PreviewToolbar({
  formName,
  viewport,
  onViewportChange,
  onBackToBuilder,
  onResetResponses
}: PreviewToolbarProps) {
  return (
    <header className="h-14 bg-card border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 flex items-center justify-between shrink-0 transition-colors duration-200 relative z-30 select-none">
      {/* Left section: Back to Builder + Form Title + Preview Badge */}
      <div className="flex items-center gap-3 min-w-0">
        <Tooltip content="Return to Form Builder" shortcut="Esc">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToBuilder}
            className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 px-2 h-8 shrink-0 font-semibold text-xs"
          >
            <ArrowLeft className="size-4 mr-1.5" />
            <span>Back to Builder</span>
          </Button>
        </Tooltip>

        <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 shrink-0" />

        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-sm font-bold text-neutral-850 dark:text-white truncate max-w-[160px] sm:max-w-[240px]">
            {formName || "Untitled Form"}
          </span>

          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider scale-95 select-none shrink-0">
            Preview Mode
          </span>
        </div>
      </div>

      {/* Right section: Viewport Switcher + Reset */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Viewport Segmented Control */}
        <div className="flex items-center p-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-850 border border-neutral-200/60 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => onViewportChange("desktop")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-150",
              viewport === "desktop"
                ? "bg-card text-neutral-900 dark:text-neutral-50 shadow-xs"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
            )}
          >
            <Monitor className="size-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>

          <button
            type="button"
            onClick={() => onViewportChange("mobile")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-150",
              viewport === "mobile"
                ? "bg-card text-neutral-900 dark:text-neutral-50 shadow-xs"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
            )}
          >
            <Smartphone className="size-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Reset Responses Button */}
        <Tooltip content="Clear temporary preview responses">
          <Button
            variant="outline"
            size="sm"
            onClick={onResetResponses}
            className="text-neutral-600 dark:text-neutral-300 border-neutral-200/80 dark:border-neutral-800 h-8 gap-1.5 px-2.5 shrink-0 text-xs font-semibold"
          >
            <RotateCcw className="size-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </Tooltip>
      </div>
    </header>
  )
}

export default PreviewToolbar;
