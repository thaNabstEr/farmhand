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
  User,
  Edit2,
  Folder,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormMetadata } from "@/lib/repositories/types"
import { localSubmissionRepository } from "@/lib/repositories/LocalSubmissionRepository"
import { localFormRepository } from "@/lib/repositories/LocalFormRepository"
import { supabaseFormRepository } from "@/lib/repositories/SupabaseFormRepository"
import {
  supabaseSubmissionRepository,
  FormSubmissionRecord,
} from "@/lib/repositories/SupabaseSubmissionRepository"
import { supabaseFarmRepository, Farm, Field } from "@/lib/repositories/SupabaseFarmRepository"
import { supabaseFarmerRepository, Farmer } from "@/lib/repositories/SupabaseFarmerRepository"
import { supabaseProjectRepository, ProjectRecord } from "@/lib/repositories/SupabaseProjectRepository"
import { offlineDB } from "@/lib/offline/db"
import { syncEngine } from "@/lib/offline/syncEngine"
import { generateSubmissionsCsv, generateSubmissionsJson, triggerFileDownload } from "@/lib/export/exportSubmissions"
import { SubmissionDetailDialog } from "./SubmissionDetailDialog"
import { DeleteSubmissionDialog } from "./DeleteSubmissionDialog"

export interface FormSubmissionsPageProps {
  initialFormId?: string | null
  initialProjectId?: string | null
  onBackToForms?: () => void
  onStartSubmission?: (formId: string) => void
  onEditSubmission?: (submission: FormSubmissionRecord) => void
}

export function FormSubmissionsPage({
  initialFormId,
  initialProjectId,
  onBackToForms,
  onStartSubmission,
  onEditSubmission,
}: FormSubmissionsPageProps) {
  // Primary records & lists
  const [remoteRecords, setRemoteRecords] = React.useState<FormSubmissionRecord[]>([])
  const [forms, setForms] = React.useState<FormMetadata[]>([])
  const [farmers, setFarmers] = React.useState<Farmer[]>([])
  const [farms, setFarms] = React.useState<Farm[]>([])
  const [fields, setFields] = React.useState<Field[]>([])
  const [projects, setProjects] = React.useState<ProjectRecord[]>([])

  // Combined Filters state
  const [selectedFormId, setSelectedFormId] = React.useState<string>(initialFormId || "all")
  const [selectedProjectId, setSelectedProjectId] = React.useState<string>(initialProjectId || "all")
  const [selectedFarmerId, setSelectedFarmerId] = React.useState<string>("all")
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
  const [remoteFetchError, setRemoteFetchError] = React.useState<string | null>(null)

  // Dialog states
  const [viewingRecord, setViewingRecord] = React.useState<FormSubmissionRecord | null>(null)
  const [deletingSubmission, setDeletingSubmission] = React.useState<FormSubmissionRecord | null>(null)

  // Load all submissions, forms, farmers, farms, and fields
  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    setRemoteFetchError(null)
    try {
      // 1. Fetch remote submissions from Supabase
      let remoteSubs: FormSubmissionRecord[] = []
      try {
        remoteSubs = await supabaseSubmissionRepository.getSubmissions()
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.warn("Supabase submissions fetch error:", msg)
        setRemoteFetchError(msg)
      }

      // 2. Fetch offline drafts and sync queue from IndexedDB
      let offlineDrafts: FormSubmissionRecord[] = []
      try {
        const drafts = await offlineDB.getAllDrafts()
        offlineDrafts = drafts.map((d) => ({
          id: d.id,
          ownerId: d.userId,
          formId: d.formId,
          farmerId: d.farmerId,
          farmId: d.farmId,
          fieldId: d.fieldId,
          projectId: d.projectId,
          clientSubmissionId: d.id,
          formSchemaSnapshot: d.schemaSnapshot,
          responses: d.responses,
          status: (d.syncStatus === "failed" ? "sync_failed" : d.syncStatus === "pending" ? "pending" : d.status) as "submitted" | "draft",
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
          farmerName: d.farmerName || undefined,
          farmName: d.farmName || undefined,
          fieldName: d.fieldName || undefined,
          projectName: d.projectName || undefined,
          projectCode: d.projectCode || undefined,
          formName: d.formName || d.schemaSnapshot?.name || "Form",
        }))
      } catch {
        // ignore offline storage fallback
      }

      // 3. Merge remote & offline records (deduplicating by ID or clientSubmissionId)
      const mergedMap = new Map<string, FormSubmissionRecord>()
      remoteSubs.forEach((r) => mergedMap.set(r.id, r))
      offlineDrafts.forEach((d) => {
        const alreadyInRemote = remoteSubs.some(
          (r) => r.id === d.id || (d.clientSubmissionId && r.clientSubmissionId === d.clientSubmissionId)
        )
        if (!alreadyInRemote && !mergedMap.has(d.id)) {
          mergedMap.set(d.id, d)
        }
      })

      const combinedRecords = Array.from(mergedMap.values())
      setRemoteRecords(combinedRecords)

      // 4. Fetch forms, farmers, farms, fields, and projects metadata for filters
      const [remoteForms, localForms, allFarmers, allFarms, allProjects] = await Promise.all([
        supabaseFormRepository.getForms().catch(() => []),
        localFormRepository.getAll().catch(() => []),
        supabaseFarmerRepository.getFarmers().catch(() => []),
        supabaseFarmRepository.getFarms().catch(() => []),
        supabaseProjectRepository.getProjects().catch(async () => offlineDB.getAllProjects()),
      ])

      const formsMap = new Map<string, FormMetadata>()
      remoteForms.forEach((f) => formsMap.set(f.id, f))
      localForms.forEach((f) => {
        if (!formsMap.has(f.id)) formsMap.set(f.id, f)
      })
      const allForms = Array.from(formsMap.values())

      setForms(allForms)
      setFarmers(allFarmers)
      setFarms(allFarms)
      setProjects(allProjects)

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
    setSelectedProjectId("all")
    setSelectedFarmerId("all")
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
        // Project filter
        if (selectedProjectId !== "all" && rec.projectId !== selectedProjectId) return false
        // Farmer filter
        if (selectedFarmerId !== "all" && rec.farmerId !== selectedFarmerId) return false
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
          const farmerMatch = rec.farmerName?.toLowerCase().includes(q) || false
          const formMatch = rec.formName?.toLowerCase().includes(q) || rec.formSchemaSnapshot?.name?.toLowerCase().includes(q) || false
          const farmMatch = rec.farmName?.toLowerCase().includes(q) || false
          const fieldMatch = rec.fieldName?.toLowerCase().includes(q) || false
          const responseMatch = JSON.stringify(rec.responses).toLowerCase().includes(q)
          return idMatch || clientSubMatch || farmerMatch || formMatch || farmMatch || fieldMatch || responseMatch
        }
        return true
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime()
        const timeB = new Date(b.createdAt).getTime()
        return sortOrder === "newest" ? timeB - timeA : timeA - timeB
      })
  }, [remoteRecords, selectedFormId, selectedProjectId, selectedFarmerId, selectedFarmId, selectedFieldId, statusFilter, fromDate, toDate, searchQuery, sortOrder])

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

  // Check if any filter is active
  const isFiltered =
    selectedFormId !== "all" ||
    selectedProjectId !== "all" ||
    selectedFarmerId !== "all" ||
    selectedFarmId !== "all" ||
    selectedFieldId !== "all" ||
    statusFilter !== "all" ||
    fromDate !== "" ||
    toDate !== "" ||
    searchQuery.trim() !== ""

  // Export handlers
  const handleExportCsv = () => {
    const csvData = generateSubmissionsCsv(filteredRecords)
    const timestamp = new Date().toISOString().slice(0, 10)
    triggerFileDownload(csvData, `farmhand-submissions-${timestamp}.csv`, "text/csv")
  }

  const handleExportJson = () => {
    const jsonData = generateSubmissionsJson(filteredRecords)
    const timestamp = new Date().toISOString().slice(0, 10)
    triggerFileDownload(jsonData, `farmhand-submissions-${timestamp}.json`, "application/json")
  }

  // Trigger sync queue processing
  const handleTriggerSync = async () => {
    setIsSyncing(true)
    try {
      await syncEngine.processSyncQueue()
      await loadData()
    } finally {
      setIsSyncing(false)
    }
  }

  // Delete submission handler
  const handleDeleteConfirm = async () => {
    if (!deletingSubmission) return

    try {
      // 1. Delete from remote Supabase
      if (!deletingSubmission.id.startsWith("sub-")) {
        try {
          await supabaseSubmissionRepository.deleteSubmission(deletingSubmission.id)
        } catch {
          // ignore
        }
      }

      // 2. Delete from local / offline stores
      await localSubmissionRepository.delete(deletingSubmission.id)
      await offlineDB.removeQueueItem(deletingSubmission.id)

      setRemoteRecords((prev) => prev.filter((r) => r.id !== deletingSubmission.id))
      setDeletingSubmission(null)
    } catch (err) {
      console.error("Failed to delete submission:", err)
    }
  }

  // Render Status Badge helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="size-3" />
            Submitted
          </span>
        )
      case "draft":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            <Clock className="size-3" />
            Draft
          </span>
        )
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
            <RefreshCw className="size-3 animate-spin" />
            Pending Sync
          </span>
        )
      case "sync_failed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="size-3" />
            Sync Failed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {onBackToForms && (
              <button
                onClick={onBackToForms}
                className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-850 transition-colors"
                title="Back to Forms"
              >
                <ArrowLeft className="size-4" />
              </button>
            )}
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
              Submission Management
            </h1>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
            Search, filter, inspect, and export agricultural records collected in the field.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTriggerSync}
            disabled={isSyncing}
            className="h-8 text-xs font-semibold gap-1.5 border-neutral-200 dark:border-neutral-800"
          >
            <RefreshCw className={`size-3.5 ${isSyncing ? "animate-spin text-primary" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={filteredRecords.length === 0}
            className="h-8 text-xs font-semibold gap-1.5 border-neutral-200 dark:border-neutral-800"
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
            className="h-8 text-xs font-semibold gap-1.5 border-neutral-200 dark:border-neutral-800"
          >
            <FileJson className="size-3.5 text-blue-600" />
            <span>Export JSON</span>
          </Button>

          {onStartSubmission && selectedFormId !== "all" && (
            <Button
              type="button"
              size="sm"
              onClick={() => onStartSubmission(selectedFormId)}
              className="h-8 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Play className="size-3 fill-current" />
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

      {/* Data Quality / Alert Banners */}
      {remoteFetchError && (
        <div className="p-3.5 rounded-card bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 font-semibold gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-600 shrink-0" />
            <span>
              Server connection unavailable ({remoteFetchError}). Displaying local offline records.
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => loadData()}
            className="h-7 text-[11px] font-bold border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300"
          >
            Retry Fetch
          </Button>
        </div>
      )}

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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Form, Farmer, Farm, Field, ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full h-9 pl-9 pr-3 rounded-input border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-xs font-semibold text-neutral-900 dark:text-neutral-100 outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Farmer Selector */}
          <div>
            <select
              value={selectedFarmerId}
              onChange={(e) => {
                setSelectedFarmerId(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full h-9 px-3 rounded-input border border-neutral-200 dark:border-neutral-800 bg-card text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="all">All Farmers ({farmers.length})</option>
              {farmers.map((farmer) => (
                <option key={farmer.id} value={farmer.id}>
                  {farmer.first_name} {farmer.last_name}
                </option>
              ))}
            </select>
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

        {/* Row 2: Form, Project, Date Range, Status Filters, & Reset */}
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

            {/* Project / Campaign Selector (Phase 8) */}
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value)
                setCurrentPage(1)
              }}
              className="h-8 px-2.5 rounded-input border border-neutral-200 dark:border-neutral-800 bg-card text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="all">All Projects ({projects.length})</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.code ? `(${p.code})` : ""}
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

            {/* Date Range: From */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-semibold">
              <span>From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-8 px-2 rounded-input border border-neutral-200 dark:border-neutral-800 bg-card text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Date Range: To */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-semibold">
              <span>To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-8 px-2 rounded-input border border-neutral-200 dark:border-neutral-800 bg-card text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
              className="h-8 px-2.5 rounded-input border border-neutral-200 dark:border-neutral-800 bg-card text-xs font-semibold text-neutral-800 dark:text-neutral-200 outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
            </select>
          </div>

          {/* Reset Filters Action */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            >
              <FilterX className="size-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Submissions List Container */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
              Showing {filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{" "}
              {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length} records
            </span>
            {isFiltered && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                Filtered from {remoteRecords.length}
              </span>
            )}
          </div>
        </div>

        {/* List Records */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-5 rounded-card border border-neutral-200/60 dark:border-neutral-850 bg-card animate-pulse space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3" />
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-20" />
                </div>
                <div className="h-3 bg-neutral-100 dark:bg-neutral-850 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center rounded-card border border-dashed border-neutral-200 dark:border-neutral-800 space-y-3 bg-card">
            <div className="size-12 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
              <FileText className="size-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
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
                      {sub.projectName && (
                        <span className="inline-flex items-center gap-1 text-primary font-semibold">
                          <Folder className="size-3 text-primary" />
                          {sub.projectName}
                        </span>
                      )}
                      {sub.farmerName && (
                        <span className="inline-flex items-center gap-1 text-neutral-700 dark:text-neutral-300 font-semibold">
                          <User className="size-3 text-emerald-600" />
                          {sub.farmerName}
                        </span>
                      )}
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

                    {onEditSubmission && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onEditSubmission(sub)}
                        className="h-8 text-xs font-semibold gap-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
                        title="Edit Submission"
                      >
                        <Edit2 className="size-3 text-emerald-600" />
                        <span>Edit</span>
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingRecord(sub)}
                      className="h-8 text-xs font-semibold gap-1.5 border-neutral-200 dark:border-neutral-800"
                    >
                      <Eye className="size-3.5" />
                      <span>View Record</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingSubmission(sub)}
                      className="h-8 text-xs font-semibold gap-1.5 border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                      title="Delete Submission"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-850">
            <span className="text-xs text-neutral-400 font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 px-2.5 text-xs font-semibold gap-1"
              >
                <ChevronLeft className="size-3.5" />
                <span>Previous</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 px-2.5 text-xs font-semibold gap-1"
              >
                <span>Next</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
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
          farmerName={viewingRecord.farmerName}
          farmName={viewingRecord.farmName}
          fieldName={viewingRecord.fieldName}
          clientSubmissionId={viewingRecord.clientSubmissionId || undefined}
          rawRecord={viewingRecord}
          isOpen={!!viewingRecord}
          onClose={() => setViewingRecord(null)}
          onEdit={onEditSubmission}
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
