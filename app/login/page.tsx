"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/auth/AuthContext"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { isSupabaseConfigured } = useAuth()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const [isForgotOpen, setIsForgotOpen] = React.useState(false)
  const [forgotEmail, setForgotEmail] = React.useState("")
  const [forgotLoading, setForgotLoading] = React.useState(false)
  const [forgotSuccess, setForgotSuccess] = React.useState(false)
  const [forgotError, setForgotError] = React.useState<string | null>(null)

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotError(null)

    if (!forgotEmail.trim()) {
      setForgotError("Please enter your email address.")
      return
    }

    setForgotLoading(true)

    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        setForgotError("Supabase is not configured in this environment.")
        setForgotLoading(false)
        return
      }

      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
      })

      if (error) {
        setForgotError(error.message || "Failed to send reset email.")
        setForgotLoading(false)
        return
      }

      setForgotSuccess(true)
    } catch {
      setForgotError("An unexpected network error occurred. Please try again.")
    } finally {
      setForgotLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.")
      return
    }

    setLoading(true)

    try {
      const supabase = getSupabaseClient()

      if (!supabase) {
        setErrorMessage("Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local and restart the server.")
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMessage("Invalid email or password. Please try again.")
        } else if (error.message.includes("Email not confirmed")) {
          setErrorMessage("Email confirmation is required. Please check your inbox.")
        } else {
          setErrorMessage(error.message || "Unable to sign in. Please verify your credentials.")
        }
        setLoading(false)
        return
      }

      if (data.session) {
        router.replace("/")
      } else {
        setLoading(false)
      }
    } catch {
      setErrorMessage("An unexpected network error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 bg-neutral-50 dark:bg-neutral-950 font-sans transition-colors duration-200">
      <div className="w-full max-w-md space-y-6">
        {/* Branding & Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex items-center justify-center h-14">
            <Image
              src="/fullcolor_logo.svg"
              alt="FarmHand Logo"
              width={224}
              height={56}
              className="h-12 w-auto dark:hidden"
              priority
            />
            <Image
              src="/dark_logo.svg"
              alt="FarmHand Logo"
              width={224}
              height={56}
              className="h-12 w-auto hidden dark:block"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              {isForgotOpen ? "Reset your password" : "Sign in to FarmHand"}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {isForgotOpen
                ? "Enter your email to receive a password recovery link"
                : "Enterprise offline field data collection platform"}
            </p>
          </div>
        </div>

        {/* Card Form */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          {isForgotOpen ? (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              {forgotError && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div className="flex-1">{forgotError}</div>
                </div>
              )}

              {forgotSuccess ? (
                <div className="space-y-4 text-center py-2">
                  <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs leading-relaxed">
                    If an account with <strong>{forgotEmail}</strong> exists, a password reset link has been dispatched to your email inbox.
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsForgotOpen(false)
                      setForgotSuccess(false)
                      setForgotEmail("")
                    }}
                    className="w-full text-xs h-9"
                  >
                    Back to Sign In
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="forgot-email"
                      className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                    >
                      Email Address
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@farm.com"
                      className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full h-10 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Sending reset link...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Password Reset Link</span>
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotOpen(false)
                        setForgotError(null)
                      }}
                      className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 font-medium"
                    >
                      Cancel and return to sign in
                    </button>
                  </div>
                </>
              )}
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isSupabaseConfigured && (
                <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>Supabase Configuration Required</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300/90">
                    To enable sign in, add <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono text-[10px]">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono text-[10px]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono text-[10px]">.env.local</code> file.
                  </p>
                </div>
              )}

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div className="flex-1">{errorMessage}</div>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                >
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@farm.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email)
                      setIsForgotOpen(true)
                      setErrorMessage(null)
                    }}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  id="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Footer Link to Signup */}
        <div className="text-center text-xs text-neutral-500 dark:text-neutral-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  )
}
