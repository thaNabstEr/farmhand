"use client"

import * as React from "react"
import {
  ProjectRecord,
  supabaseProjectRepository,
} from "@/lib/repositories/SupabaseProjectRepository"
import { Button } from "@/components/ui/button"
import { AlertCircle, X, Folder, Calendar, Target, Hash } from "lucide-react"

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  project?: ProjectRecord | null
}

export function ProjectModal({
  isOpen,
  onClose,
  onSuccess,
  project,
}: ProjectModalProps) {
  const isEditing = Boolean(project)

  const [name, setName] = React.useState("")
  const [code, setCode] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [targetSubmissions, setTargetSubmissions] = React.useState<string>("")
  const [startDate, setStartDate] = React.useState("")
  const [endDate, setEndDate] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Initialize or reset form state when modal opens
  React.useEffect(() => {
    if (!isOpen) return
    setError(null)
    if (project) {
      setName(project.name)
      setCode(project.code || "")
      setDescription(project.description || "")
      setTargetSubmissions(project.targetSubmissions !== null ? String(project.targetSubmissions) : "")
      setStartDate(project.startDate || "")
      setEndDate(project.endDate || "")
    } else {
      setName("")
      setCode("")
      setDescription("")
      setTargetSubmissions("")
      setStartDate("")
      setEndDate("")
    }
  }, [isOpen, project])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanName = name.trim()
    if (!cleanName) {
      setError("Project name is required.")
      return
    }
    if (cleanName.length > 150) {
      setError("Project name cannot exceed 150 characters.")
      return
    }

    let parsedTarget: number | null = null
    if (targetSubmissions.trim() !== "") {
      const parsed = parseInt(targetSubmissions.trim(), 10)
      if (isNaN(parsed) || parsed < 0) {
        setError("Target submissions must be a non-negative integer.")
        return
      }
      parsedTarget = parsed
    }

    if (startDate && endDate && endDate < startDate) {
      setError("End date must be on or after the start date.")
      return
    }

    setIsSubmitting(true)
    try {
      if (isEditing && project) {
        await supabaseProjectRepository.updateProject(project.id, {
          name: cleanName,
          code: code.trim() || null,
          description: description.trim() || null,
          targetSubmissions: parsedTarget,
          startDate: startDate || null,
          endDate: endDate || null,
        })
      } else {
        await supabaseProjectRepository.createProject({
          name: cleanName,
          code: code.trim() || null,
          description: description.trim() || null,
          status: "planning", // Defaults safely to planning
          targetSubmissions: parsedTarget,
          startDate: startDate || null,
          endDate: endDate || null,
        })
      }
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Folder className="size-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                {isEditing ? "Edit Project" : "Create New Project"}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isEditing ? "Update campaign parameters and target quotas" : "New operational campaign (starts in Planning status)"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={150}
              placeholder="e.g. 2026 Smallholder Cocoa Certification Audit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Code & Target Submissions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Project Code <span className="text-neutral-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <Hash className="size-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="PRJ-2026-01"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <p className="text-[10px] text-neutral-400 mt-1">Unique within your workspace</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Target Submissions <span className="text-neutral-400 font-normal">(Quota)</span>
              </label>
              <div className="relative">
                <Target className="size-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 250"
                  value={targetSubmissions}
                  onChange={(e) => setTargetSubmissions(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <p className="text-[10px] text-neutral-400 mt-1">Expected number of inspection forms</p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="size-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                End Date
              </label>
              <div className="relative">
                <Calendar className="size-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Description / Scope
            </label>
            <textarea
              rows={3}
              placeholder="Outline the operational objective, mandate, or client requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="gap-1.5"
            >
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
