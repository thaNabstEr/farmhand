"use client"

import * as React from "react"
import { Send, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface RunnerActionsProps {
  completedCount: number;
  totalCount: number;
  isReady: boolean;
  onSubmit: () => void;
  disabled?: boolean;
}

export function RunnerActions({
  completedCount,
  totalCount,
  isReady,
  onSubmit,
  disabled
}: RunnerActionsProps) {
  return (
    <div className="bg-card rounded-card border border-neutral-200/80 dark:border-neutral-850 p-5 sm:p-6 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
      {/* Progress & Ready Indicator */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
            {completedCount} of {totalCount} fields completed
          </span>
          <div className="w-32 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        {isReady && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold animate-in fade-in duration-200 shrink-0">
            <CheckCircle2 className="size-3.5" />
            <span>Ready to submit</span>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="button"
        onClick={onSubmit}
        disabled={disabled}
        className="w-full sm:w-auto h-10 px-6 font-bold gap-2 shadow-sm"
      >
        <span>Submit Form</span>
        <Send className="size-4" />
      </Button>
    </div>
  )
}

export default RunnerActions;
