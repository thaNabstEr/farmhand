"use client"

import * as React from "react"
import { ArrowLeft, Eye, Send, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFormBuilder } from "@/form-builder/state/FormBuilderContext"

import { OverflowMenu } from "./OverflowMenu"
import { Tooltip } from "@/components/shared/Tooltip"
import { ClearFormDialog } from "./ClearFormDialog"

export interface FormToolbarProps {
  onBack: () => void;
}

export function FormToolbar({ onBack }: FormToolbarProps) {
  const { state, renameForm, setIsClearFormDialogOpen } = useFormBuilder()

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    renameForm(e.target.value)
  }

  return (
    <header className="h-14 bg-card border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 flex items-center justify-between shrink-0 transition-colors duration-200 relative z-30">
      {/* Left section: Back + Name + Status */}
      <div className="flex items-center gap-3 min-w-0">
        <Tooltip content="Return to Forms" shortcut="Esc">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 px-2 h-8 shrink-0"
          >
            <ArrowLeft className="size-4 mr-1.5" />
            <span className="hidden sm:inline">Back</span>
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
          
          {/* Custom Draft Status Indicator */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200/50 dark:border-neutral-850 scale-90 shrink-0 font-medium select-none text-[10px]">
            <div className="size-1.5 rounded-full bg-neutral-450 dark:bg-neutral-500" />
            <span>Draft • Unsaved Changes</span>
          </div>
        </div>
      </div>



      {/* Right section: Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <Tooltip content="Preview Form" shortcut="P">
          <Button
            variant="outline"
            size="sm"
            disabled
            className="text-neutral-400 dark:text-neutral-550 border-neutral-200/60 dark:border-neutral-850 h-8 gap-1.5 px-2.5 opacity-50 cursor-not-allowed shrink-0"
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

