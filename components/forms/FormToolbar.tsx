"use client"

import * as React from "react"
import { ArrowLeft, Eye, Send, Trash2, Play, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFormBuilder } from "@/form-builder/state/FormBuilderContext"

import { OverflowMenu } from "./OverflowMenu"
import { Tooltip } from "@/components/shared/Tooltip"
import { ClearFormDialog } from "./ClearFormDialog"

export interface FormToolbarProps {
  onBack: () => void;
  onPreview?: () => void;
  onStartSubmission?: () => void;
  onViewSubmissions?: () => void;
}

export function FormToolbar({ onBack, onPreview, onStartSubmission, onViewSubmissions }: FormToolbarProps) {
  const { state, saveStatus, renameForm, setIsClearFormDialogOpen } = useFormBuilder()

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    renameForm(e.target.value)
  }

  const renderSaveBadge = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 scale-90 shrink-0 font-medium select-none text-[10px]">
            <div className="size-1.5 rounded-full bg-blue-500 animate-ping" />
            <span>Saving...</span>
          </div>
        )
      case "error":
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 scale-90 shrink-0 font-medium select-none text-[10px]">
            <div className="size-1.5 rounded-full bg-red-500" />
            <span>Save Error</span>
          </div>
        )
      case "unsaved":
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 scale-90 shrink-0 font-medium select-none text-[10px]">
            <div className="size-1.5 rounded-full bg-amber-500" />
            <span>Unsaved Changes</span>
          </div>
        )
      case "saved":
      default:
        return (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 scale-90 shrink-0 font-medium select-none text-[10px]">
            <div className="size-1.5 rounded-full bg-emerald-500" />
            <span>Saved</span>
          </div>
        )
    }
  }

  return (
    <header className="h-14 bg-card border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 flex items-center justify-between shrink-0 transition-colors duration-200 relative z-30">
      {/* Left section: Back + Name + Status */}
      <div className="flex items-center gap-3 min-w-0">
        <Tooltip content="Return to Form Library" shortcut="Esc">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 px-2 h-8 shrink-0 font-semibold text-xs"
          >
            <ArrowLeft className="size-4 mr-1.5" />
            <span className="hidden sm:inline">Forms</span>
          </Button>
        </Tooltip>
        
        <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 shrink-0" />

        <div className="flex items-center gap-2.5 min-w-0">
          <input
            type="text"
            value={state.schema.name}
            onChange={handleNameChange}
            placeholder="Untitled Form"
            className="text-sm font-bold text-neutral-850 dark:text-white bg-transparent border-none outline-none focus:ring-1 focus:ring-primary/45 rounded-md px-1.5 py-0.5 truncate max-w-[140px] sm:max-w-[200px]"
          />
          
          {renderSaveBadge()}
        </div>
      </div>



      {/* Right section: Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {onStartSubmission && (
          <Tooltip content="Start filling out a new submission">
            <Button
              size="sm"
              onClick={onStartSubmission}
              className="font-bold text-xs h-8 gap-1.5 px-3 shrink-0"
            >
              <Play className="size-3.5 fill-current" />
              <span className="hidden sm:inline">Fill Form</span>
            </Button>
          </Tooltip>
        )}

        {onViewSubmissions && (
          <Tooltip content="View form submissions and records">
            <Button
              variant="outline"
              size="sm"
              onClick={onViewSubmissions}
              className="text-neutral-700 hover:text-neutral-900 dark:text-neutral-200 dark:hover:text-white border-neutral-200/80 dark:border-neutral-800 h-8 gap-1.5 px-2.5 shrink-0 font-semibold"
            >
              <Layers className="size-3.5" />
              <span className="hidden sm:inline">Submissions</span>
            </Button>
          </Tooltip>
        )}

        <Tooltip content="Preview Form" shortcut="P">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            className="text-neutral-700 hover:text-neutral-900 dark:text-neutral-200 dark:hover:text-white border-neutral-200/80 dark:border-neutral-800 h-8 gap-1.5 px-2.5 shrink-0 font-semibold"
          >
            <Eye className="size-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </Button>
        </Tooltip>

        <Tooltip content="Remove all fields from this form" shortcut="Ctrl/Cmd + Shift + Backspace">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsClearFormDialogOpen(true)}
            className="text-red-500 dark:text-red-400 border-red-200/65 dark:border-red-900/40 hover:bg-red-500/10 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-300 h-8 gap-1.5 px-2.5 shrink-0"
          >
            <Trash2 className="size-3.5" />
            <span className="hidden sm:inline">Clear Form</span>
          </Button>
        </Tooltip>
        
        <Tooltip content="Publish Form" shortcut="Ctrl/Cmd + Enter">
          <Button
            disabled
            size="sm"
            className="bg-primary/40 text-neutral-200 dark:bg-primary/20 dark:text-neutral-500 cursor-not-allowed h-8 gap-1.5 px-2.5 shrink-0"
          >
            <Send className="size-3.5" />
            <span className="hidden sm:inline">Publish</span>
          </Button>
        </Tooltip>

        <OverflowMenu />
      </div>

      {/* Render Clear Form dialog here for isolation */}
      <ClearFormDialog />
    </header>
  )
}
export default FormToolbar;

