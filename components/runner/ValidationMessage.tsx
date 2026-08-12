"use client"

import * as React from "react"
import { AlertCircle } from "lucide-react"

export interface ValidationMessageProps {
  message?: string | null;
}

export function ValidationMessage({ message }: ValidationMessageProps) {
  if (!message) return null

  return (
    <div
      role="alert"
      className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-red-500 animate-in fade-in slide-in-from-top-0.5 duration-150"
    >
      <AlertCircle className="size-3.5 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

export default ValidationMessage;
