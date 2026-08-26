"use client"

import * as React from "react"
import { useAuth } from "@/lib/auth/AuthContext"
import { getSupabaseClient } from "@/lib/supabase/client"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import {
  User,
  Mail,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Key,
} from "lucide-react"

export function SettingsPage() {
  const { user } = useAuth()
  const [displayName, setDisplayName] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  // Password reset state inside settings
  const [sendingReset, setSendingReset] = React.useState(false)
  const [resetSent, setResetSent] = React.useState(false)

  // Load user profile from Supabase
  const loadProfile = React.useCallback(async () => {
    if (!user) return
    setLoading(true)
    setErrorMessage(null)
    try {
      const supabase = getSupabaseClient()
      if (!supabase) throw new Error("Supabase is not configured.")

      const { data, error } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle()

      if (error) throw error

      if (data?.display_name) {
        setDisplayName(data.display_name)
      } else if (user.user_metadata?.display_name) {
        setDisplayName(user.user_metadata.display_name)
      } else if (user.email) {
        setDisplayName(user.email.split("@")[0])
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load profile"
      setErrorMessage(msg)
    } finally {
      setLoading(false)
    }
  }, [user])

  React.useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      const supabase = getSupabaseClient()
      if (!supabase) throw new Error("Supabase is not configured.")

      const trimmedName = displayName.trim()
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: trimmedName || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      setSuccessMessage("Profile display name successfully updated.")
      setTimeout(() => setSuccessMessage(null), 4000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile"
      setErrorMessage(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleSendPasswordReset = async () => {
    if (!user?.email) return
    setSendingReset(true)
    setErrorMessage(null)
    try {
      const supabase = getSupabaseClient()
      if (!supabase) throw new Error("Supabase is not configured.")

      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
      })

      if (error) throw error

      setResetSent(true)
      setTimeout(() => setResetSent(false), 5000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send reset email"
      setErrorMessage(msg)
    } finally {
      setSendingReset(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      <PageHeader
        title="Account Settings"
        description="Manage your user profile identity, account security, and workspace preferences."
      />

      {/* Success / Error Alerts */}
      {successMessage && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2.5">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2.5">
          <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Profile Section */}
      <div className="p-6 sm:p-8 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-card shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800/80 pb-4">
          <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <User className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Profile Information
            </h3>
            <p className="text-xs text-neutral-500">
              Your personal details and identification on inspections.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
            <div className="h-10 bg-neutral-100 dark:bg-neutral-850 rounded w-full" />
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Email (Readonly) */}
            <div className="space-y-1.5 max-w-md">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Email Address
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs text-neutral-500 font-mono">
                <Mail className="size-4 text-neutral-400 shrink-0" />
                <span className="truncate">{user?.email || "No email available"}</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Email is managed through your authentication provider.
              </p>
            </div>

            {/* Display Name */}
            <div className="space-y-1.5 max-w-md">
              <label
                htmlFor="settings-display-name"
                className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
              >
                Display Name
              </label>
              <input
                id="settings-display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-card text-foreground placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <p className="text-[11px] text-neutral-400">
                Displayed in the application sidebar, dashboard, and recorded with your audits.
              </p>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={saving}
                className="h-9 px-4 text-xs font-bold gap-1.5 shadow-sm"
              >
                {saving ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="size-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Security Section */}
      <div className="p-6 sm:p-8 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-card shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800/80 pb-4">
          <div className="size-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center justify-center border border-neutral-200 dark:border-neutral-700">
            <Shield className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Security & Password
            </h3>
            <p className="text-xs text-neutral-500">
              Manage your password and session credentials.
            </p>
          </div>
        </div>

        <div className="space-y-3 max-w-md">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Need to update your password? We will send a secure password reset link to your registered email address.
          </p>

          {resetSent ? (
            <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Password reset email dispatched. Check your inbox!</span>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={handleSendPasswordReset}
              disabled={sendingReset}
              className="h-9 px-4 text-xs font-semibold gap-2"
            >
              {sendingReset ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Key className="size-3.5 text-neutral-500" />
              )}
              <span>Send Password Reset Link</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
