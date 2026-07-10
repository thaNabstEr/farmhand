"use client"

import * as React from "react"
import { MoreHorizontal, Copy, FileInput, FileOutput, History, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export function OverflowMenu() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="relative animate-fade-in">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 h-8 w-8"
        aria-label="More actions"
      >
        <MoreHorizontal className="size-4" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Dropdown Menu Card */}
          <div className="absolute right-0 mt-1.5 w-52 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-card p-1 shadow-lg z-50 text-neutral-800 dark:text-neutral-200 text-xs font-semibold animate-in fade-in slide-in-from-top-1.5 duration-150">
            <button
              disabled
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md opacity-40 cursor-not-allowed text-left font-medium"
            >
              <Copy className="size-3.5 text-neutral-400" />
              Duplicate Form
            </button>
            
            <button
              disabled
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md opacity-40 cursor-not-allowed text-left font-medium"
            >
              <FileInput className="size-3.5 text-neutral-400" />
              Import Form
            </button>

            <button
              disabled
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md opacity-40 cursor-not-allowed text-left font-medium"
            >
              <FileOutput className="size-3.5 text-neutral-400" />
              Export JSON
            </button>

            <div className="h-px bg-neutral-100 dark:bg-neutral-800 my-1" />

            <button
              disabled
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md opacity-40 cursor-not-allowed text-left font-medium"
            >
              <History className="size-3.5 text-neutral-400" />
              Version History
            </button>

            <button
              disabled
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md opacity-40 cursor-not-allowed text-left font-medium"
            >
              <Settings className="size-3.5 text-neutral-400" />
              Settings
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default OverflowMenu;
