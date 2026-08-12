"use client"

import * as React from "react"
import { MoreVertical, Edit3, Copy, Trash2, Archive, Calendar, FileText, Play, Eye, Layers } from "lucide-react"
import { FormMetadata, FormStatus } from "@/lib/repositories/types"
import { Button } from "@/components/ui/button"
import { localSubmissionRepository } from "@/lib/repositories/LocalSubmissionRepository"

export interface FormCardProps {
  form: FormMetadata
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onRename: (form: FormMetadata) => void
  onArchive: (id: string) => void
  onDelete: (form: FormMetadata) => void
  onStartSubmission?: (id: string) => void
  onViewSubmissions?: (id: string) => void
}

export function FormCard({
  form,
  onEdit,
  onDuplicate,
  onRename,
  onArchive,
  onDelete,
  onStartSubmission,
  onViewSubmissions,
}: FormCardProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [submissionCount, setSubmissionCount] = React.useState<number>(0)
  const menuRef = React.useRef<HTMLDivElement>(null)

  // Load real submission count for this form
  React.useEffect(() => {
    let isMounted = true
    localSubmissionRepository.getByFormId(form.id).then((subs) => {
      if (isMounted) setSubmissionCount(subs.length)
    })
    return () => {
      isMounted = false
    }
  }, [form.id])

  // Close dropdown on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isMenuOpen])

  // Format relative time helper
  const getRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      const diffMs = Date.now() - date.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffMins < 1) return "Just now"
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
      return date.toLocaleDateString()
    } catch {
      return "Recently"
    }
  }

  const renderStatusBadge = (status: FormStatus) => {
    switch (status) {
      case "published":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
            Published
          </span>
        )
      case "archived":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
            Archived
          </span>
        )
      case "draft":
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200/50 dark:border-neutral-800 uppercase tracking-wider">
            Draft
          </span>
        )
    }
  }

  return (
    <div
      onClick={() => onEdit(form.id)}
      className="group relative bg-card rounded-card border border-neutral-200/80 dark:border-neutral-850 p-5 shadow-card hover:shadow-hover hover:border-neutral-300 dark:hover:border-neutral-750 transition-all duration-200 cursor-pointer flex flex-col justify-between select-none"
    >
      <div className="space-y-3">
        {/* Top Header: Title + Status + Overflow Menu */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-50 group-hover:text-primary transition-colors truncate">
                {form.name}
              </h3>
              {renderStatusBadge(form.status)}
            </div>
            {form.description ? (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium line-clamp-2 leading-relaxed">
                {form.description}
              </p>
            ) : (
              <p className="text-xs text-neutral-400 dark:text-neutral-600 font-medium italic">
                No description provided
              </p>
            )}
          </div>

          {/* Context Actions Menu Button */}
          <div className="relative shrink-0" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="size-7 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md"
            >
              <MoreVertical className="size-4" />
            </Button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-card rounded-lg border border-neutral-200/80 dark:border-neutral-800 shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                {onStartSubmission && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false)
                      onStartSubmission(form.id)
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 flex items-center gap-2"
                  >
                    <Play className="size-3.5 fill-current" />
                    <span>Fill Form</span>
                  </button>
                )}

                {onViewSubmissions && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false)
                      onViewSubmissions(form.id)
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <Eye className="size-3.5" />
                    <span>Submissions ({submissionCount})</span>
                  </button>
                )}

                <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false)
                    onEdit(form.id)
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                >
                  <Edit3 className="size-3.5" />
                  <span>Edit Form</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false)
                    onDuplicate(form.id)
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                >
                  <Copy className="size-3.5" />
                  <span>Duplicate</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false)
                    onRename(form)
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                >
                  <Edit3 className="size-3.5" />
                  <span>Rename</span>
                </button>

                {form.status !== "archived" && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false)
                      onArchive(form.id)
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <Archive className="size-3.5" />
                    <span>Archive</span>
                  </button>
                )}

                <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false)
                    onDelete(form)
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2"
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer: Metadata (Fields + Submissions + Updated Time) */}
      <div className="pt-4 mt-3 border-t border-neutral-100 dark:border-neutral-850 flex items-center justify-between text-[11px] font-medium text-neutral-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <FileText className="size-3.5 text-neutral-400" />
            <span>{form.fieldCount} field{form.fieldCount !== 1 ? "s" : ""}</span>
          </div>

          <div
            onClick={(e) => {
              e.stopPropagation()
              onViewSubmissions?.(form.id)
            }}
            className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
          >
            <Layers className="size-3.5" />
            <span className="font-bold text-neutral-700 dark:text-neutral-300">{submissionCount} sub{submissionCount !== 1 ? "s" : ""}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Calendar className="size-3.5 text-neutral-400" />
          <span>Updated {getRelativeTime(form.updatedAt)}</span>
        </div>
      </div>
    </div>
  )
}

export default FormCard
