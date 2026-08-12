"use client"

import * as React from "react"
import { CheckCircle2, RotateCcw, Eye, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface SuccessStateProps {
  formName?: string
  onViewSubmission?: () => void
  onViewSubmissions?: () => void
  onStartAnother?: () => void
  onBackToForms?: () => void
}

export function SuccessState({
  formName,
  onViewSubmission,
  onViewSubmissions,
  onStartAnother,
  onBackToForms,
}: SuccessStateProps) {
  return (
    <div className="bg-card rounded-card border border-emerald-500/30 dark:border-emerald-500/30 p-8 sm:p-12 shadow-card text-center space-y-6 max-w-md mx-auto my-8 animate-in fade-in zoom-in-95 duration-200 select-none">
      <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-xs">
        <CheckCircle2 className="size-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
          Submission Complete
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
          {formName ? `"${formName}"` : "Form"} was submitted successfully.
        </p>
      </div>

      <div className="pt-2 flex flex-col items-stretch gap-2.5 max-w-xs mx-auto">
        {onViewSubmission && (
          <Button
            type="button"
            variant="outline"
            onClick={onViewSubmission}
            className="w-full h-9 gap-1.5 font-bold text-xs border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
          >
            <Eye className="size-3.5" />
            <span>View Submission</span>
          </Button>
        )}

        {onViewSubmissions && (
          <Button
            type="button"
            variant="outline"
            onClick={onViewSubmissions}
            className="w-full h-9 gap-1.5 font-semibold text-xs border-neutral-200 dark:border-neutral-800"
          >
            <span>View All Records</span>
          </Button>
        )}

        {onStartAnother && (
          <Button
            type="button"
            onClick={onStartAnother}
            className="w-full h-9 gap-1.5 font-bold text-xs"
          >
            <RotateCcw className="size-3.5" />
            <span>Start Another Submission</span>
          </Button>
        )}

        {onBackToForms && (
          <Button
            type="button"
            variant="ghost"
            onClick={onBackToForms}
            className="w-full h-9 gap-1.5 font-semibold text-xs text-neutral-500"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Forms</span>
          </Button>
        )}
      </div>
    </div>
  )
}

export default SuccessState
