"use client"

import * as React from "react"
import { ArrowLeft, Eye, Send, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { useFormBuilder } from "@/form-builder/state/FormBuilderContext"

export interface FormToolbarProps {
  onBack: () => void;
}

export function FormToolbar({ onBack }: FormToolbarProps) {
  const { state, renameForm } = useFormBuilder();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    renameForm(e.target.value);
  };

  return (
    <header className="h-14 bg-card border-b border-neutral-200/80 dark:border-neutral-800/80 px-4 flex items-center justify-between shrink-0 transition-colors duration-200">
      {/* Left section: Back + Name + Status */}
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 px-2 h-8"
        >
          <ArrowLeft className="size-4 mr-1.5" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        
        <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800" />

        <div className="flex items-center gap-2.5 min-w-0">
          <input
            type="text"
            value={state.schema.name}
            onChange={handleNameChange}
            placeholder="Untitled Form"
            className="text-sm font-bold text-neutral-800 dark:text-white bg-transparent border-none outline-none focus:ring-1 focus:ring-primary/45 rounded-md px-1.5 py-0.5 truncate max-w-[180px] sm:max-w-[280px]"
          />
          <StatusBadge status="neutral" label="Draft" className="shrink-0 scale-90" />
        </div>
      </div>

      {/* Right section: Action Placeholders */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          disabled
          className="text-neutral-400 dark:text-neutral-500 border-neutral-200/60 dark:border-neutral-850 h-8 gap-1.5 px-2.5"
        >
          <Eye className="size-3.5" />
          <span className="hidden sm:inline">Preview</span>
        </Button>
        
        <Button
          disabled
          size="sm"
          className="bg-primary/50 text-white cursor-not-allowed h-8 gap-1.5 px-2.5"
        >
          <Send className="size-3.5" />
          <span className="hidden sm:inline">Publish</span>
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 h-8 w-8"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
    </header>
  )
}
export default FormToolbar;
