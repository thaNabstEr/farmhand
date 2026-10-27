"use client"

import * as React from "react"
import {
  CheckCircle2,
  RotateCcw,
  Eye,
  ArrowLeft,
  CloudCheck,
  CloudOff,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export interface SuccessStateProps {
  formName?: string
  syncStatus?: "synced" | "pending" | "preview" | "failed"
  errorMessage?: string
  onRetry?: () => void
  onViewSubmission?: () => void
  onViewSubmissions?: () => void
  onStartAnother?: () => void
  onBackToForms?: () => void
}

export function SuccessState({
  formName,
  syncStatus = "synced",
  errorMessage,
  onRetry,
  onViewSubmission,
  onViewSubmissions,
  onStartAnother,
  onBackToForms,
}: SuccessStateProps) {
  // 1. Preview mode
  if (syncStatus === "preview") {
    return (
      <div className="bg-card rounded-card border border-indigo-500/30 dark:border-indigo-500/30 p-8 sm:p-12 shadow-card text-center space-y-6 max-w-md mx-auto my-8 animate-in fade-in zoom-in-95 duration-200 select-none">
        <div className="size-16 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto shadow-xs">
          <Eye className="size-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
            Preview / Test Mode
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
            Preview Test Complete
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
            This was a preview test submission of {formName ? `"${formName}"` : "this form"}. Form validation succeeded, and no responses were saved to the database.
          </p>
        </div>

        <div className="pt-2 flex flex-col items-stretch gap-2.5 max-w-xs mx-auto">
          {onViewSubmission && (
            <Button
              type="button"
              variant="outline"
              onClick={onViewSubmission}
              className="w-full h-9 gap-1.5 font-bold text-xs border-indigo-500/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/10"
            >
              <Eye className="size-3.5" />
              <span>Inspect Test Responses</span>
            </Button>
          )}

          {onStartAnother && (
            <Button
              type="button"
              onClick={onStartAnother}
              className="w-full h-9 gap-1.5 font-bold text-xs"
            >
              <RotateCcw className="size-3.5" />
              <span>Test Again</span>
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
              <span>Back to Form Builder</span>
            </Button>
          )}
        </div>
      </div>
    )
  }

  // 2. Offline / Pending Sync mode
  if (syncStatus === "pending") {
    return (
      <div className="bg-card rounded-card border border-blue-500/30 dark:border-blue-500/30 p-8 sm:p-12 shadow-card text-center space-y-6 max-w-md mx-auto my-8 animate-in fade-in zoom-in-95 duration-200 select-none">
        <div className="size-16 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto shadow-xs">
          <CloudOff className="size-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
            Stored Locally (Offline)
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
            Submission Saved
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
            Your submission for {formName ? `"${formName}"` : "this form"} is stored safely on this device. It will automatically synchronize to Supabase once connection is restored.
          </p>
        </div>

        <div className="pt-2 flex flex-col items-stretch gap-2.5 max-w-xs mx-auto">
          {onViewSubmission && (
            <Button
              type="button"
              variant="outline"
              onClick={onViewSubmission}
              className="w-full h-9 gap-1.5 font-bold text-xs border-blue-500/30 text-blue-700 dark:text-blue-400 hover:bg-blue-500/10"
            >
              <Eye className="size-3.5" />
              <span>View Local Record</span>
            </Button>
          )}

          {onViewSubmissions && (
            <Button
              type="button"
              variant="outline"
              onClick={onViewSubmissions}
              className="w-full h-9 gap-1.5 font-semibold text-xs border-neutral-200 dark:border-neutral-800"
            >
              <span>View All Submissions</span>
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

  // 3. Failed submission mode
  if (syncStatus === "failed") {
    return (
      <div className="bg-card rounded-card border border-rose-500/30 dark:border-rose-500/30 p-8 sm:p-12 shadow-card text-center space-y-6 max-w-md mx-auto my-8 animate-in fade-in zoom-in-95 duration-200 select-none">
        <div className="size-16 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle className="size-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
            Persistence Failed
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
            Submission Could Not Be Saved
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
            {errorMessage || "An error occurred while saving your responses. Please check your connection and try again."}
          </p>
        </div>

        <div className="pt-2 flex flex-col items-stretch gap-2.5 max-w-xs mx-auto">
          {onRetry && (
            <Button
              type="button"
              onClick={onRetry}
              className="w-full h-9 gap-1.5 font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              <RefreshCw className="size-3.5" />
              <span>Retry Submission</span>
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

  // 4. Default: Successfully synced to cloud
  return (
    <div className="bg-card rounded-card border border-emerald-500/30 dark:border-emerald-500/30 p-8 sm:p-12 shadow-card text-center space-y-6 max-w-md mx-auto my-8 animate-in fade-in zoom-in-95 duration-200 select-none">
      <div className="size-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-xs">
        <CheckCircle2 className="size-8" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
          <CloudCheck className="size-3" />
          <span>Synced to Cloud</span>
        </div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
          Submission Complete
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
          {formName ? `"${formName}"` : "Form"} was saved and synced to Supabase successfully.
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
