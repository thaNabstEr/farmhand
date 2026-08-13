"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { useAuth } from "@/lib/auth/AuthContext"

const PUBLIC_ROUTES = ["/login", "/signup"]

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  React.useEffect(() => {
    if (loading) return

    if (!user && !isPublicRoute) {
      router.replace("/login")
    } else if (user && isPublicRoute) {
      router.replace("/")
    }
  }, [user, loading, isPublicRoute, router])

  // While resolving session, show clean branded loading screen (prevents UI flashing)
  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground transition-colors duration-200">
        <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-card border border-border shadow-sm max-w-sm w-full mx-auto text-center">
          <div className="relative size-16 flex items-center justify-center">
            <Image
              src="/favicon.svg"
              alt="FarmHand"
              width={64}
              height={64}
              className="size-12 animate-pulse dark:hidden"
            />
            <Image
              src="/favicon_dark.svg"
              alt="FarmHand"
              width={64}
              height={64}
              className="size-12 animate-pulse hidden dark:block"
            />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              FarmHand
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Resolving session...
            </p>
          </div>
          <div className="w-12 h-1 rounded-full bg-emerald-500/20 overflow-hidden relative">
            <div className="h-full bg-emerald-600 dark:bg-emerald-400 rounded-full animate-indeterminate" />
          </div>
        </div>
      </div>
    )
  }

  // Prevent flashing protected content before redirect completes
  if (!user && !isPublicRoute) {
    return null
  }
  if (user && isPublicRoute) {
    return null
  }

  return <>{children}</>
}
