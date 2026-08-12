"use client"

import * as React from "react"
import { Search, Eye, Trash2, ArrowLeft, FileText, CheckCircle2, Clock, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormSubmission, SubmissionStatus, FormMetadata } from "@/lib/repositories/types"
import { FormSchema } from "@/form-builder/types"
import { localSubmissionRepository } from "@/lib/repositories/LocalSubmissionRepository"
import { localFormRepository } from "@/lib/repositories/LocalFormRepository"
import { SubmissionDetailDialog } from "./SubmissionDetailDialog"
import { DeleteSubmissionDialog } from "./DeleteSubmissionDialog"

export interface FormSubmissionsPageProps {
  initialFormId?: string | null
  onBackToForms?: () => void
  onStartSubmission?: (formId: string) => void
}

export function FormSubmissionsPage({
  initialFormId,
  onBackToForms,
  onStartSubmission,
}: FormSubmissionsPageProps) {
  const [submissions, setSubmissions] = React.useState<FormSubmission[]>([])
  const [forms, setForms] = React.useState<FormMetadata[]>([])
  const [selectedFormId, setSelectedFormId] = React.useState<string>(initialFormId || "all")
  const [statusFilter, setStatusFilter] = React.useState<"all" | SubmissionStatus>("all")
  const [sortOrder, setSortOrder] = React.useState<"newest" | "oldest">("newest")
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [isLoading, setIsLoading] = React.useState(true)

  // Dialog states
  const [viewingSubmission, setViewingSubmission] = React.useState<FormSubmission | null>(null)
  const [viewingSchema, setViewingSchema] = React.useState<FormSchema | null>(null)
  const [deletingSubmission, setDeletingSubmission] = React.useState<FormSubmission | null>(null)

  // Load submissions and form metadata
  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [allSubmissions, allForms] = await Promise.all([
        localSubmissionRepository.getAll(),
        localFormRepository.getAll(),
      ])
      setSubmissions(allSubmissions)
      setForms(allForms)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  // Filter & Sort Submissions
  const filteredSubmissions = React.useMemo(() => {
    return submissions
      .filter((sub) => {
        if (selectedFormId !== "all" && sub.formId !== selectedFormId) return false
        if (statusFilter !== "all" && sub.status !== statusFilter) return false

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim()
          const idMatch = sub.id.toLowerCase().includes(q)
          const formMatch = forms.find((f) => f.id === sub.formId)?.name.toLowerCase().includes(q)
          const responseMatch = JSON.stringify(sub.responses).toLowerCase().includes(q)
          return idMatch || formMatch || responseMatch
        }
        return true
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime()
        const timeB = new Date(b.createdAt).getTime()
        return sortOrder === "newest" ? timeB - timeA : timeA - timeB
      })
  }, [submissions, forms, selectedFormId, statusFilter, searchQuery, sortOrder])

  // Metrics
  const totalCount = submissions.length
  const submittedCount = submissions.filter((s) => s.status === "submitted").length
  const draftCount = submissions.filter((s) => s.status === "draft").length

  const handleOpenDetail = async (sub: FormSubmission) => {
    const schema = await localFormRepository.getById(sub.formId)
    setViewingSchema(schema)
    setViewingSubmission(sub)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingSubmission) return
    await localSubmissionRepository.delete(deletingSubmission.id)
    await loadData()
  }

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#F8FAF8] dark:bg-[#090B09] p-6 sm:p-10 transition-colors duration-200 scrollbar-thin">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {onBackToForms && (
                <button
                  type="button"
                  onClick={onBackToForms}
                  className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
                  title="Back to Forms"
                >
                  <ArrowLeft className="size-4" />
                </button>
              )}
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                Form Submissions & Records
              </h1>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              View, search, filter, and inspect collected field records stored locally.
            </p>
          </div>

          {selectedFormId !== "all" && onStartSubmission && (
            <Button
              type="button"
              onClick={() => onStartSubmission(selectedFormId)}
              className="font-bold text-xs gap-1.5 h-9"
            >
              <Play className="size-3.5 fill-current" />
              <span>Start New Submission</span>
            </Button>
          )}
        </div>

        {/* Metrics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-card border border-neutral-200/60 dark:border-neutral-850 bg-card shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Total Submissions</span>
              <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{totalCount}</span>
            </div>
            <div className="size-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 flex items-center justify-center">
              <FileText className="size-4" />
            </div>
          </div>

          <div className="p-4 rounded-card border border-emerald-500/20 dark:border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Submitted Records</span>
              <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{submittedCount}</span>
            </div>
            <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </div>

          <div className="p-4 rounded-card border border-amber-500/20 dark:border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Unfinished Drafts</span>
              <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">{draftCount}</span>
            </div>
            <div className="size-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
          </div>
        </div>

        {/* Filter Controls Toolbar */}
        <div className="p-4 rounded-card border border-neutral-200/60 dark:border-neutral-850 bg-card shadow-xs flex flex-wrap items-center justify-between gap-4">
          {/* Left: Form Selector & Search Input */}
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search submission ID or response..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-input border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-xs font-semibold text-neutral-900 dark:text-neutral-100 outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Form Selector */}
            <select
              value={selectedFormId}
              onChange={(e) => setSelectedFormId(e.target.value)}
              className="h-9 px-3 rounded-input border border-neutral-200 dark:border-neutral-800 bg-card text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="all">All Forms ({forms.length})</option>
              {forms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Right: Status Filters & Sorting */}
          <div className="flex items-center gap-2">
            {/* Status Pills */}
            <div className="flex items-center p-0.5 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-900 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  statusFilter === "all" ? "bg-card text-neutral-900 dark:text-neutral-50 shadow-xs" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("submitted")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  statusFilter === "submitted" ? "bg-card text-emerald-700 dark:text-emerald-400 shadow-xs" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                Submitted
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("draft")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  statusFilter === "draft" ? "bg-card text-amber-700 dark:text-amber-400 shadow-xs" : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                Draft
              </button>
            </div>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
              className="h-9 px-3 rounded-input border border-neutral-200 dark:border-neutral-800 bg-card text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Submissions Records List */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-neutral-400 font-medium">
            Loading submissions...
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-12 rounded-card border border-dashed border-neutral-200 dark:border-neutral-800 bg-card text-center space-y-3">
            <FileText className="size-8 text-neutral-300 dark:text-neutral-700 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                No submissions found
              </h3>
              <p className="text-xs text-neutral-400">
                {submissions.length === 0
                  ? "Open a form to start collecting field data."
                  : "No submissions match the current filter or search criteria."}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSubmissions.map((sub) => {
              const formMeta = forms.find((f) => f.id === sub.formId)
              const formName = formMeta?.name || "Form Submission"
              const isSubmitted = sub.status === "submitted"

              const createdDate = new Date(sub.createdAt).toLocaleDateString([], {
                month: "short",
                day: "numeric",
                year: "numeric",
              })

              const submittedDate = sub.submittedAt
                ? new Date(sub.submittedAt).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : null

              return (
                <div
                  key={sub.id}
                  className="p-4 rounded-card border border-neutral-200/80 dark:border-neutral-850 bg-card hover:border-neutral-300 dark:hover:border-neutral-750 transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-50 truncate">
                        {formName}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isSubmitted
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {isSubmitted ? "Submitted" : "Draft"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 font-medium">
                      <span className="font-mono text-[11px]">ID: {sub.id}</span>
                      <span>•</span>
                      <span>Created: {createdDate}</span>
                      {submittedDate && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400">Submitted: {submittedDate}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    {!isSubmitted && onStartSubmission && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onStartSubmission(sub.formId)}
                        className="h-8 text-xs font-semibold gap-1.5 border-neutral-200 dark:border-neutral-800"
                      >
                        <Play className="size-3 text-amber-500 fill-current" />
                        <span>Continue Draft</span>
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDetail(sub)}
                      className="h-8 text-xs font-semibold gap-1.5 border-neutral-200 dark:border-neutral-800"
                    >
                      <Eye className="size-3.5" />
                      <span>View Record</span>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingSubmission(sub)}
                      className="size-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      title="Delete Record"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Submission Detail Modal */}
      <SubmissionDetailDialog
        submission={viewingSubmission}
        formSchema={viewingSchema}
        isOpen={!!viewingSubmission}
        onClose={() => setViewingSubmission(null)}
      />

      {/* Delete Submission Confirmation Modal */}
      <DeleteSubmissionDialog
        submission={deletingSubmission}
        isOpen={!!deletingSubmission}
        onClose={() => setDeletingSubmission(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}

export default FormSubmissionsPage
