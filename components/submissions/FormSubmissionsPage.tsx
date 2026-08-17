"use client"

import * as React from "react"
import {
  Search,
  Eye,
  Trash2,
  ArrowLeft,
  FileText,
  CheckCircle2,
  Clock,
  Play,
  RefreshCw,
  Building2,
  MapPin,
  FileSpreadsheet,
  FileJson,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FilterX,
  WifiOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormMetadata } from "@/lib/repositories/types"
import { localSubmissionRepository } from "@/lib/repositories/LocalSubmissionRepository"
import { localFormRepository } from "@/lib/repositories/LocalFormRepository"
import {
  supabaseSubmissionRepository,
  FormSubmissionRecord,
} from "@/lib/repositories/SupabaseSubmissionRepository"
import { supabaseFarmRepository, Farm, Field } from "@/lib/repositories/SupabaseFarmRepository"
import { offlineDB } from "@/lib/offline/db"
import { syncEngine } from "@/lib/offline/syncEngine"
import { generateSubmissionsCsv, generateSubmissionsJson, triggerFileDownload } from "@/lib/export/exportSubmissions"
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
  // Primary records & lists
  const [remoteRecords, setRemoteRecords] = React.useState<FormSubmissionRecord[]>([])
  const [forms, setForms] = React.useState<FormMetadata[]>([])
  const [farms, setFarms] = React.useState<Farm[]>([])
  const [fields, setFields] = React.useState<Field[]>([])

  // Combined Filters state
  const [selectedFormId, setSelectedFormId] = React.useState<string>(initialFormId || "all")
  const [selectedFarmId, setSelectedFarmId] = React.useState<string>("all")
  const [selectedFieldId, setSelectedFieldId] = React.useState<string>("all")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [fromDate, setFromDate] = React.useState<string>("")
  const [toDate, setToDate] = React.useState<string>("")
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [sortOrder, setSortOrder] = React.useState<"newest" | "oldest">("newest")

  // Pagination state (10 records per page)
  const [currentPage, setCurrentPage] = React.useState<number>(1)
  const pageSize = 10

  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [isSyncing, setIsSyncing] = React.useState<boolean>(false)

  // Dialog states
  const [viewingRecord, setViewingRecord] = React.useState<FormSubmissionRecord | null>(null)
  const [deletingSubmission, setDeletingSubmission] = React.useState<FormSubmissionRecord | null>(null)

  // Load all submissions, forms, farms, and fields
  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      // 1. Fetch remote submissions from Supabase
      let remoteSubs: FormSubmissionRecord[] = []
      try {
        remoteSubs = await supabaseSubmissionRepository.getSubmissions()
      } catch (err) {
        console.warn("Supabase submissions fetch fallback:", err)
      }

      // 2. Fetch offline drafts and sync queue from IndexedDB
      let offlineDrafts: FormSubmissionRecord[] = []
      try {
        const drafts = await offlineDB.getAllDrafts()
        offlineDrafts = drafts.map((d) => ({
          id: d.id,
          ownerId: d.userId,
          formId: d.formId,
          farmId: d.farmId,
          fieldId: d.fieldId,
          clientSubmissionId: d.id,
          formSchemaSnapshot: d.schemaSnapshot,
          responses: d.responses,
          status: (d.syncStatus === "failed" ? "sync_failed" : d.syncStatus === "pending" ? "pending" : d.status) as "submitted" | "draft",
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
          farmName: d.farmName || undefined,
          fieldName: d.fieldName || undefined,
          formName: d.formName || d.schemaSnapshot?.name || "Form",
        }))
      } catch {
        // ignore offline storage fallback
      }

      // 3. Merge remote & offline records (deduplicating by ID or clientSubmissionId)
      const mergedMap = new Map<string, FormSubmissionRecord>()
      remoteSubs.forEach((r) => mergedMap.set(r.id, r))
      offlineDrafts.forEach((d) => {
        // If not already in remote records, include it
        if (!mergedMap.has(d.id) && (!d.clientSubmissionId || !remoteSubs.some(r => r.clientSubmissionId === d.clientSubmissionId))) {
          mergedMap.set(d.id, d)
        }
      })

      const combinedRecords = Array.from(mergedMap.values())
      setRemoteRecords(combinedRecords)

      // 4. Fetch forms, farms, and fields metadata for filters
      const [allForms, allFarms] = await Promise.all([
        localFormRepository.getAll(),
        supabaseFarmRepository.getFarms().catch(() => []),
      ])

      setForms(allForms)
      setFarms(allFarms)

      // Fetch all fields from all farms
      const allFields: Field[] = []
      for (const farm of allFarms) {
        try {
          const farmFields = await supabaseFarmRepository.getFieldsByFarmId(farm.id)
          allFields.push(...farmFields)
        } catch {
          // ignore
        }
      }
      setFields(allFields)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  // Filter available fields based on selected farm
  const availableFields = React.useMemo(() => {
    if (selectedFarmId === "all") return fields
    return fields.filter((f) => f.farm_id === selectedFarmId)
  }, [fields, selectedFarmId])

  // Reset selected field if selected farm changes and field is not in farm
  React.useEffect(() => {
    if (selectedFarmId !== "all" && selectedFieldId !== "all") {
      const exists = availableFields.some((f) => f.id === selectedFieldId)
      if (!exists) setSelectedFieldId("all")
    }
  }, [selectedFarmId, selectedFieldId, availableFields])

  // Reset all filters to default
  const handleResetFilters = () => {
    setSelectedFormId("all")
    setSelectedFarmId("all")
    setSelectedFieldId("all")
    setStatusFilter("all")
    setFromDate("")
    setToDate("")
    setSearchQuery("")
    setSortOrder("newest")
    setCurrentPage(1)
  }

  // Filtered and Sorted Submissions
  const filteredRecords = React.useMemo(() => {
    return remoteRecords
      .filter((rec) => {
        // Form filter
        if (selectedFormId !== "all" && rec.formId !== selectedFormId) return false
        // Farm filter
        if (selectedFarmId !== "all" && rec.farmId !== selectedFarmId) return false
        // Field filter
        if (selectedFieldId !== "all" && rec.fieldId !== selectedFieldId) return false
        // Status filter
        if (statusFilter !== "all") {
          if (statusFilter === "submitted" && rec.status !== "submitted") return false
          if (statusFilter === "draft" && rec.status !== "draft") return false
          if (statusFilter === "pending" && (rec.status as string) !== "pending") return false
          if (statusFilter === "sync_failed" && (rec.status as string) !== "sync_failed") return false
        }
        // Date range
        if (fromDate) {
          const recDate = new Date(rec.createdAt).getTime()
          const fromTime = new Date(fromDate).getTime()
          if (recDate < fromTime) return false
        }
        if (toDate) {
          const recDate = new Date(rec.createdAt).getTime()
          const toTime = new Date(`${toDate}T23:59:59.999Z`).getTime()
          if (recDate > toTime) return false
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim()
          const idMatch = rec.id.toLowerCase().includes(q)
          const clientSubMatch = rec.clientSubmissionId?.toLowerCase().includes(q) || false
          const formMatch = rec.formName?.toLowerCase().includes(q) || rec.formSchemaSnapshot?.name?.toLowerCase().includes(q) || false
          const farmMatch = rec.farmName?.toLowerCase().includes(q) || false
          const fieldMatch = rec.fieldName?.toLowerCase().includes(q) || false
          const responseMatch = JSON.stringify(rec.responses).toLowerCase().includes(q)
          return idMatch || clientSubMatch || formMatch || farmMatch || fieldMatch || responseMatch
        }
        return true
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime()
        const timeB = new Date(b.createdAt).getTime()
        return sortOrder === "newest" ? timeB - timeA : timeA - timeB
      })
  }, [remoteRecords, selectedFormId, selectedFarmId, selectedFieldId, statusFilter, fromDate, toDate, searchQuery, sortOrder])

  // Pagination slicing
  const totalRecords = filteredRecords.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize))
  const paginatedRecords = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredRecords.slice(start, start + pageSize)
  }, [filteredRecords, currentPage, pageSize])

  // Ensure valid current page
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  // Metrics calculation
  const metrics = React.useMemo(() => {
    const total = remoteRecords.length
    const submitted = remoteRecords.filter((r) => r.status === "submitted").length
    const drafts = remoteRecords.filter((r) => r.status === "draft").length
    const pending = remoteRecords.filter((r) => (r.status as string) === "pending").length
    const syncFailed = remoteRecords.filter((r) => (r.status as string) === "sync_failed").length
    return { total, submitted, drafts, pending, syncFailed }
  }, [remoteRecords])

  // Sync Action
  const handleTriggerSync = async () => {
    setIsSyncing(true)
    try {
      await syncEngine.processSyncQueue()
      await loadData()
    } finally {
      setIsSyncing(false)
    }
  }

  // Bulk CSV Export
  const handleExportCsv = () => {
    const csvContent = generateSubmissionsCsv(filteredRecords)
    const timestamp = new Date().toISOString().split("T")[0]
    triggerFileDownload(csvContent, `farmhand_submissions_${timestamp}.csv`, "text/csv")
  }

  // Bulk JSON Export
  const handleExportJson = () => {
    const jsonContent = generateSubmissionsJson(filteredRecords)
    const timestamp = new Date().toISOString().split("T")[0]
    triggerFileDownload(jsonContent, `farmhand_submissions_${timestamp}.json`, "application/json")
  }

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deletingSubmission) return
    try {
      await supabaseSubmissionRepository.deleteSubmission(deletingSubmission.id)
    } catch {
      // ignore
    }
    try {
      await localSubmissionRepository.delete(deletingSubmission.id)
      await offlineDB.removeQueueItem(deletingSubmission.id)
    } catch {
      // ignore
    }
    setDeletingSubmission(null)
    await loadData()
  }

  // Status Badge Component
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="size-3 text-emerald-600" />
            Submitted
          </span>
        )
      case "draft":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            <Clock className="size-3 text-amber-600" />
            Draft
          </span>
        )
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
            <WifiOff className="size-3 text-blue-600" />
            Pending Sync
          </span>
        )
      case "sync_failed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="size-3 text-rose-600" />
            Sync Failed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            {status}
          </span>
        )
    }
  }

  const isFiltered =
    selectedFormId !== "all" ||
    selectedFarmId !== "all" ||
    selectedFieldId !== "all" ||
    statusFilter !== "all" ||
    fromDate !== "" ||
    toDate !== "" ||
    searchQuery !== ""

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
                Submission Management & Review
              </h1>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              Search, filter, inspect, and export collected agricultural field submissions.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={filteredRecords.length === 0}
              className="font-semibold text-xs gap-1.5 h-9 border-neutral-200 dark:border-neutral-800"
            >
              <FileSpreadsheet className="size-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportJson}
              disabled={filteredRecords.length === 0}
              className="font-semibold text-xs gap-1.5 h-9 border-neutral-200 dark:border-neutral-800"
            >
              <FileJson className="size-3.5 text-blue-500" />
              <span>Export JSON</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="font-bold text-xs gap-1.5 h-9 border-neutral-200 dark:border-neutral-800"
            >
              <RefreshCw className={`size-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
            </Button>

            {selectedFormId !== "all" && onStartSubmission && (
              <Button
                type="button"
                size="sm"
                onClick={() => onStartSubmission(selectedFormId)}
                className="font-bold text-xs gap-1.5 h-9"
              >
                <Play className="size-3.5 fill-current" />
                <span>Start New</span>
              </Button>
            )}
          </div>
        </div>

        {/* Operational Overview Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 rounded-card border border-neutral-200/60 dark:border-neutral-850 bg-card shadow-xs">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              Total Records
            </span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                {metrics.total}
              </span>
              <FileText className="size-4 text-neutral-400" />
            </div>
          </div>

          <div className="p-4 rounded-card border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-xs">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Submitted
            </span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {metrics.submitted}
              </span>
              <CheckCircle2 className="size-4 text-emerald-500" />
            </div>
          </div>

          <div className="p-4 rounded-card border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10 shadow-xs">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              Drafts
            </span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                {metrics.drafts}
              </span>
              <Clock className="size-4 text-amber-500" />
            </div>
          </div>

          <div className="p-4 rounded-card border border-blue-500/20 bg-blue-500/5 dark:bg-blue-500/10 shadow-xs">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
              Pending Sync
            </span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {metrics.pending}
              </span>
              <RefreshCw className="size-4 text-blue-500" />
            </div>
          </div>

          <div className="p-4 rounded-card border border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/10 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
              Sync Failed
            </span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-bold text-rose-700 dark:text-rose-400">
                {metrics.syncFailed}
              </span>
              <XCircle className="size-4 text-rose-500" />
            </div>
          </div>
        </div>

        {/* Data Quality / Alert Banner */}
        {metrics.syncFailed > 0 && (
          <div className="p-3.5 rounded-card bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-800 dark:text-rose-300 font-semibold gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-rose-600 shrink-0" />
              <span>
                {metrics.syncFailed} offline submission(s) encountered synchronization errors. Click &quot;Sync Now&quot; or check network connection.
              </span>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleTriggerSync}
              className="h-7 text-[11px] font-bold border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300"
            >
              Retry Sync
            </Button>
          </div>
        )}

        {/* Combined Filter Controls Toolbar */}
        <div className="p-5 rounded-card border border-neutral-200/80 dark:border-neutral-850 bg-card shadow-xs space-y-4">
          {/* Row 1: Search & Filter Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by Form, Farm, Field, ID, or Response values..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full h-9 pl-9 pr-3 rounded-input border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-xs font-semibold text-neutral-900 dark:text-neutral-100 outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Farm Selector */}
            <div>
              <select
                value={selectedFarmId}
                onChange={(e) => {
                  setSelectedFarmId(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full h-9 px-3 rounded-input border border-neutral-200 dark:border-neutral-800 bg-card text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="all">All Farms ({farms.length})</option>
                {farms.map((farm) => (
                  <option key={farm.id} value={farm.id}>
                    {farm.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Field Selector (Dynamic based on selected farm) */}
            <div>
              <select
                value={selectedFieldId}
                onChange={(e) => {
                  setSelectedFieldId(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full h-9 px-3 rounded-input border border-neutral-200 dark:border-neutral-800 bg-card text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="all">All Fields ({availableFields.length})</option>
                {availableFields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Form, Date Range, Status Filters, & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-neutral-100 dark:border-neutral-850">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Form Selector */}
              <select
                value={selectedFormId}
                onChange={(e) => {
                  setSelectedFormId(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-8 px-2.5 rounded-input border border-neutral-200 dark:border-neutral-800 bg-card text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="all">All Form Templates ({forms.length})</option>
                {forms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-8 px-2.5 rounded-input border border-neutral-200 dark:border-neutral-800 bg-card text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending Sync</option>
                <option value="sync_failed">Sync Failed</option>
              </select>

              {/* Date Pickers */}
              <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                <span>From:</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="h-8 px-2 rounded-input border border-neutral-200 dark:border-neutral-800 bg-card text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                <span>To:</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="h-8 px-2 rounded-input border border-neutral-200 dark:border-neutral-800 bg-card text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none"
                />
              </div>
            </div>

            {/* Right: Sort & Reset */}
            <div className="flex items-center gap-2">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
                className="h-8 px-2.5 rounded-input border border-neutral-200 dark:border-neutral-800 bg-card text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>

              {isFiltered && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-8 px-2.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 gap-1"
                >
                  <FilterX className="size-3.5" />
                  <span>Reset</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Submissions Records List */}
        {isLoading ? (
          <div className="p-16 text-center text-xs text-neutral-400 font-medium space-y-2">
            <RefreshCw className="size-5 animate-spin mx-auto text-primary" />
            <div>Loading submission records...</div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-16 rounded-card border border-dashed border-neutral-200 dark:border-neutral-800 bg-card text-center space-y-3">
            <FileText className="size-9 text-neutral-300 dark:text-neutral-700 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                No submissions matching criteria
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                {remoteRecords.length === 0
                  ? "No field submissions collected yet. Open a form template to begin collecting data."
                  : "No records match the active filter or search criteria. Try adjusting or resetting your filters."}
              </p>
            </div>
            {isFiltered && (
              <Button type="button" variant="outline" size="sm" onClick={handleResetFilters} className="text-xs font-semibold">
                Reset All Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedRecords.map((sub) => {
              const formName = sub.formName || sub.formSchemaSnapshot?.name || "Form Submission"
              const isSubmitted = sub.status === "submitted"

              const createdDate = new Date(sub.createdAt).toLocaleDateString([], {
                month: "short",
                day: "numeric",
                year: "numeric",
              })

              const submittedDate = sub.status === "submitted"
                ? new Date(sub.updatedAt).toLocaleDateString([], {
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
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-50 truncate">
                        {formName}
                      </h3>
                      {renderStatusBadge(sub.status)}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                      {sub.farmName && (
                        <span className="inline-flex items-center gap-1 text-neutral-700 dark:text-neutral-300 font-semibold">
                          <Building2 className="size-3 text-emerald-600" />
                          {sub.farmName}
                        </span>
                      )}
                      {sub.fieldName && (
                        <span className="inline-flex items-center gap-1 text-neutral-700 dark:text-neutral-300 font-semibold">
                          <MapPin className="size-3 text-blue-600" />
                          {sub.fieldName}
                        </span>
                      )}
                      <span className="font-mono text-[11px] text-neutral-400">ID: {sub.id.slice(0, 8)}...</span>
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
                    {!isSubmitted && onStartSubmission && sub.formId && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onStartSubmission(sub.formId!)}
                        className="h-8 text-xs font-semibold gap-1.5 border-neutral-200 dark:border-neutral-800"
                      >
                        <Play className="size-3 text-amber-500 fill-current" />
                        <span>Continue</span>
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingRecord(sub)}
                      className="h-8 text-xs font-semibold gap-1.5 border-neutral-200 dark:border-neutral-800"
                    >
                      <Eye className="size-3.5 text-primary" />
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

            {/* Pagination Toolbar */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-850 text-xs font-medium text-neutral-500">
                <div>
                  Showing {(currentPage - 1) * pageSize + 1} -{" "}
                  {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} submissions
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="h-8 px-2.5 text-xs gap-1 border-neutral-200 dark:border-neutral-800"
                  >
                    <ChevronLeft className="size-3.5" />
                    <span>Previous</span>
                  </Button>

                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    Page {currentPage} of {totalPages}
                  </span>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="h-8 px-2.5 text-xs gap-1 border-neutral-200 dark:border-neutral-800"
                  >
                    <span>Next</span>
                    <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submission Detail Modal */}
      {viewingRecord && (
        <SubmissionDetailDialog
          submission={{
            id: viewingRecord.id,
            formId: viewingRecord.formId || "general",
            formVersion: viewingRecord.formSchemaSnapshot?.version || 1,
            status: viewingRecord.status,
            responses: viewingRecord.responses,
            createdAt: viewingRecord.createdAt,
            updatedAt: viewingRecord.updatedAt,
            submittedAt: viewingRecord.status === "submitted" ? viewingRecord.updatedAt : undefined,
          }}
          formSchema={viewingRecord.formSchemaSnapshot}
          farmName={viewingRecord.farmName}
          fieldName={viewingRecord.fieldName}
          clientSubmissionId={viewingRecord.clientSubmissionId || undefined}
          isOpen={!!viewingRecord}
          onClose={() => setViewingRecord(null)}
        />
      )}

      {/* Delete Submission Confirmation Modal */}
      {deletingSubmission && (
        <DeleteSubmissionDialog
          submission={{
            id: deletingSubmission.id,
            formId: deletingSubmission.formId || "general",
            formVersion: deletingSubmission.formSchemaSnapshot?.version || 1,
            status: deletingSubmission.status,
            responses: deletingSubmission.responses,
            createdAt: deletingSubmission.createdAt,
            updatedAt: deletingSubmission.updatedAt,
          }}
          isOpen={!!deletingSubmission}
          onClose={() => setDeletingSubmission(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  )
}

export default FormSubmissionsPage
