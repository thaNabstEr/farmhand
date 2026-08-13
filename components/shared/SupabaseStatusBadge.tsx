"use client"

import * as React from "react"
import { Database, CheckCircle2, AlertCircle, HardDrive } from "lucide-react"
import { verifySupabaseConnection, SupabaseConnectionStatus } from "@/lib/supabase/testConnection"

export function SupabaseStatusBadge() {
  const [status, setStatus] = React.useState<SupabaseConnectionStatus | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let isMounted = true
    verifySupabaseConnection().then((res) => {
      if (isMounted) {
        setStatus(res)
        setLoading(false)
      }
    })
    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border border-neutral-200/50 dark:border-neutral-800 animate-pulse">
        <Database className="size-3" />
        <span>Testing Supabase...</span>
      </div>
    )
  }

  if (!status || !status.configured) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-800 cursor-help"
        title={status?.message || "Running in Local Storage mode"}
      >
        <HardDrive className="size-3 text-neutral-400" />
        <span>Local Mode</span>
      </div>
    )
  }

  if (status.connected) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 cursor-help"
        title={status.message}
      >
        <CheckCircle2 className="size-3 text-emerald-500" />
        <span>Supabase Connected</span>
      </div>
    )
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 cursor-help"
      title={status.message}
    >
      <AlertCircle className="size-3 text-red-500" />
      <span>Supabase Error</span>
    </div>
  )
}

export default SupabaseStatusBadge
