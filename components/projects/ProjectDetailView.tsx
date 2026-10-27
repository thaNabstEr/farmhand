"use client"

import * as React from "react"
import {
  ProjectDetailRecord,
  ProjectStatus,
  ParticipatingRegistry,
  supabaseProjectRepository,
} from "@/lib/repositories/SupabaseProjectRepository"
import { FormSubmissionRecord, supabaseSubmissionRepository } from "@/lib/repositories/SupabaseSubmissionRepository"
import { FormMetadata } from "@/lib/repositories/types"
import { supabaseFormRepository } from "@/lib/repositories/SupabaseFormRepository"
import { localFormRepository } from "@/lib/repositories/LocalFormRepository"
import { Card } from "@/components/shared/Card"
import { MetricCard } from "@/components/shared/MetricCard"
import { DataTable, Column } from "@/components/shared/DataTable"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { ProjectModal } from "./ProjectModal"
import { DeleteConfirmModal } from "@/components/farms/DeleteConfirmModal"
import { SubmissionDetailDialog } from "@/components/submissions/SubmissionDetailDialog"
import { generateSubmissionsCsv } from "@/lib/export/exportSubmissions"
import {
  ArrowLeft,
  MapPin,
  User,
  Plus,
  Play,
  CheckCircle2,
  Archive,
  Trash2,
  Edit2,
  Download,
  AlertTriangle,
  Building2,
} from "lucide-react"

interface ProjectDetailViewProps {
  projectId: string
  onBack: () => void
  onStartSubmission: (formId: string, projectId: string) => void
  onViewAllSubmissions?: (projectId: string) => void
}

export function ProjectDetailView({
  projectId,
  onBack,
  onStartSubmission,
}: ProjectDetailViewProps) {
  const [project, setProject] = React.useState<ProjectDetailRecord | null>(null)
  const [assignedForms, setAssignedForms] = React.useState<FormMetadata[]>([])
  const [availableForms, setAvailableForms] = React.useState<FormMetadata[]>([])
  const [submissions, setSubmissions] = React.useState<FormSubmissionRecord[]>([])
  const [participatingRegistry, setParticipatingRegistry] = React.useState<ParticipatingRegistry>({
    farms: [],
    fields: [],
    farmers: [],
    counts: { farmsCount: 0, fieldsCount: 0, farmersCount: 0 },
  })

  const [activeTab, setActiveTab] = React.useState<"overview" | "forms" | "submissions" | "participants">("overview")
  const [loading, setLoading] = React.useState(true)

  // Dialog states
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = React.useState(false)
  const [selectedFormIdsToAssign, setSelectedFormIdsToAssign] = React.useState<string[]>([])
  const [removingFormId, setRemovingFormId] = React.useState<string | null>(null)
  const [viewingSubmission, setViewingSubmission] = React.useState<FormSubmissionRecord | null>(null)
  const [actionError, setActionError] = React.useState<string | null>(null)

  const loadProjectData = React.useCallback(async () => {
    setLoading(true)
    try {
      const [proj, forms, subs, registry] = await Promise.all([
        supabaseProjectRepository.getProjectById(projectId),
        supabaseProjectRepository.getProjectForms(projectId).catch(() => []),
        supabaseSubmissionRepository.getSubmissionsByProjectId(projectId).catch(() => []),
        supabaseProjectRepository.getParticipatingRegistry(projectId).catch(() => ({
          farms: [],
          fields: [],
          farmers: [],
          counts: { farmsCount: 0, fieldsCount: 0, farmersCount: 0 },
        })),
      ])

      setProject(proj)
      setAssignedForms(forms)
      setSubmissions(subs)
      setParticipatingRegistry(registry)

      // Fetch all published forms for the assignment picker
      try {
        const allForms = await supabaseFormRepository.getForms()
        setAvailableForms(allForms)
      } catch {
        const localForms = await localFormRepository.getAll()
        setAvailableForms(localForms)
      }
    } catch (err: unknown) {
      console.error("Failed to load project details:", err)
      setActionError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [projectId])

  React.useEffect(() => {
    loadProjectData()
  }, [loadProjectData])

  if (loading && !project) {
    return (
      <div className="p-8 text-center text-sm text-neutral-400">
        Loading project details...
      </div>
    )
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="size-4" /> Back to Projects
        </Button>
        <EmptyState
          title="Project not found"
          description="The requested operational campaign could not be located or has been deleted."
          iconName="Folder"
          actionLabel="Back to Projects"
          onAction={onBack}
        />
      </div>
    )
  }

  // Lifecycle action handler
  const handleLifecycleTransition = async (newStatus: ProjectStatus) => {
    setActionError(null)
    try {
      await supabaseProjectRepository.transitionStatus(project.id, newStatus)
      await loadProjectData()
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err))
    }
  }

  // Handle project deletion (with historical preservation)
  const handleDeleteProject = async () => {
    setActionError(null)
    try {
      await supabaseProjectRepository.deleteProject(project.id)
      onBack()
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err))
    }
  }

  // Assign forms handler
  const handleConfirmAssignForms = async () => {
    if (selectedFormIdsToAssign.length === 0) {
      setIsAssignModalOpen(false)
      return
    }
    setActionError(null)
    try {
      await supabaseProjectRepository.assignFormsToProject(project.id, selectedFormIdsToAssign)
      setIsAssignModalOpen(false)
      setSelectedFormIdsToAssign([])
      await loadProjectData()
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err))
    }
  }

  // Remove form assignment handler
  const handleConfirmRemoveForm = async () => {
    if (!removingFormId) return
    setActionError(null)
    try {
      await supabaseProjectRepository.removeFormFromProject(project.id, removingFormId)
      setRemovingFormId(null)
      await loadProjectData()
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err))
    }
  }

  // CSV Export
  const handleExportCsv = () => {
    if (submissions.length === 0) return
    const csvContent = generateSubmissionsCsv(submissions)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `project_${project.code || project.id}_submissions.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Submissions columns
  const submissionColumns: Column<FormSubmissionRecord>[] = [
    {
      header: "Submission ID",
      key: "id",
      className: "font-mono text-xs w-[160px]",
      render: (row) => (
        <span className="truncate max-w-[140px] block" title={row.id}>
          {row.id.substring(0, 8)}...
        </span>
      ),
    },
    {
      header: "Form Name",
      key: "formName",
      render: (row) => (
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
          {row.formName || "Inspection Form"}
        </span>
      ),
    },
    {
      header: "Farm",
      key: "farmName",
      render: (row) => <span>{row.farmName || "—"}</span>,
    },
    {
      header: "Field",
      key: "fieldName",
      render: (row) => <span>{row.fieldName || "—"}</span>,
    },
    {
      header: "Farmer",
      key: "farmerName",
      render: (row) => <span>{row.farmerName || "—"}</span>,
    },
    {
      header: "Status",
      key: "status",
      render: (row) => (
        <StatusBadge
          status={row.status === "submitted" ? "success" : "warning"}
          label={row.status === "submitted" ? "Submitted" : "Draft"}
        />
      ),
    },
    {
      header: "Date",
      key: "createdAt",
      render: (row) => (
        <span className="text-xs text-neutral-500">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      className: "text-right",
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewingSubmission(row)}
          className="text-xs h-7 px-2.5"
        >
          View Record
        </Button>
      ),
    },
  ]

  // Render Status Badge with explicit styling
  const renderStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case "active":
        return <StatusBadge status="success" label="Active" />
      case "planning":
        return <StatusBadge status="info" label="Planning" />
      case "completed":
        return <StatusBadge status="warning" label="Completed" />
      case "archived":
        return <StatusBadge status="error" label="Archived" />
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Projects</span>
        </Button>

        {/* Lifecycle Action Buttons */}
        <div className="flex items-center gap-2">
          {project.status === "planning" && (
            <Button
              size="sm"
              onClick={() => handleLifecycleTransition("active")}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="size-4" />
              <span>Activate Project</span>
            </Button>
          )}

          {project.status === "active" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLifecycleTransition("completed")}
              className="gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <CheckCircle2 className="size-4" />
              <span>Complete Campaign</span>
            </Button>
          )}

          {project.status === "completed" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLifecycleTransition("archived")}
              className="gap-1.5 text-neutral-600 hover:bg-neutral-100"
            >
              <Archive className="size-4" />
              <span>Archive Project</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            className="gap-1.5"
          >
            <Edit2 className="size-3.5" />
            <span>Edit</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDeleteOpen(true)}
            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 p-2 size-8"
            title="Delete Project"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertTriangle className="size-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Project Header Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                {project.name}
              </h1>
              {renderStatusBadge(project.status)}
              {project.code && (
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">
                  {project.code}
                </span>
              )}
            </div>
            {project.description && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-3xl">
                {project.description}
              </p>
            )}
          </div>

          {/* Quick Collection Action */}
          {project.status === "active" && assignedForms.length > 0 && (
            <div className="shrink-0">
              <Button
                onClick={() => onStartSubmission(assignedForms[0].id, project.id)}
                className="gap-2 shadow-sm"
              >
                <Play className="size-4" />
                <span>Collect Data</span>
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-200 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
            activeTab === "overview"
              ? "border-primary text-primary"
              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("forms")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "forms"
              ? "border-primary text-primary"
              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          }`}
        >
          <span>Assigned Forms</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-100 dark:bg-neutral-800">
            {assignedForms.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("submissions")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "submissions"
              ? "border-primary text-primary"
              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          }`}
        >
          <span>Submissions</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-100 dark:bg-neutral-800">
            {submissions.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("participants")}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "participants"
              ? "border-primary text-primary"
              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
          }`}
        >
          <span>Participating Registry</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-100 dark:bg-neutral-800">
            {participatingRegistry.counts.farmsCount}
          </span>
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* KPI Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Target Quota"
              value={project.targetSubmissions !== null ? String(project.targetSubmissions) : "None Set"}
              change={project.targetSubmissions !== null ? "Quota" : "Open"}
              changeType="neutral"
              iconName="Target"
              status="info"
              description="Expected total inspection submissions"
            />
            <MetricCard
              title="Submissions Recorded"
              value={String(submissions.length)}
              change="Collected"
              changeType="increase"
              iconName="FileText"
              status="success"
              description="Total records collected under this campaign"
            />
            <MetricCard
              title="Assigned Forms"
              value={String(assignedForms.length)}
              change="Templates"
              changeType="neutral"
              iconName="Layers"
              status="info"
              description="Questionnaire templates enabled for project"
            />
            <MetricCard
              title="Participating Farms"
              value={String(participatingRegistry.counts.farmsCount)}
              change="Assets"
              changeType="neutral"
              iconName="MapPin"
              status="info"
              description="Distinct farms inspected in this campaign"
            />
          </div>

          {/* Progress Section (Stage 11 Exact Rules) */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  Campaign Progress
                </h3>
                <p className="text-xs text-neutral-500">
                  {project.targetSubmissions === null
                    ? "Actual submissions recorded (No numerical target specified)"
                    : project.targetSubmissions === 0
                    ? "Target is 0 submissions (0 / 0 recorded)"
                    : `${submissions.length} of ${project.targetSubmissions} target submissions completed (${project.progressPercentage}%)`}
                </p>
              </div>
              <div className="text-sm font-bold font-mono">
                {project.targetSubmissions === null ? (
                  <span>{submissions.length} Records</span>
                ) : (
                  <span>
                    {submissions.length} / {project.targetSubmissions}
                  </span>
                )}
              </div>
            </div>

            {/* Visual Progress Bar (min(pct, 100)) */}
            {project.targetSubmissions !== null && project.targetSubmissions > 0 && (
              <div className="w-full h-3 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${project.progressBarPercentage}%` }}
                />
              </div>
            )}
          </Card>

          {/* Timeline & Campaign Details Card */}
          <Card className="p-6 space-y-3">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Campaign Timeline
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
                <div className="text-neutral-400 font-medium mb-1">Start Date</div>
                <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {project.startDate ? new Date(project.startDate).toLocaleDateString() : "Not specified"}
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
                <div className="text-neutral-400 font-medium mb-1">Target End Date</div>
                <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {project.endDate ? new Date(project.endDate).toLocaleDateString() : "Open-ended"}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 2. ASSIGNED FORMS TAB */}
      {activeTab === "forms" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Assigned Form Templates
            </h3>
            {project.status !== "completed" && project.status !== "archived" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedFormIdsToAssign([])
                  setIsAssignModalOpen(true)
                }}
                className="gap-1.5 text-xs"
              >
                <Plus className="size-3.5" />
                <span>Assign Form</span>
              </Button>
            )}
          </div>

          {assignedForms.length === 0 ? (
            <Card className="p-8">
              <EmptyState
                title="No forms assigned yet"
                description="Assign form templates to this campaign so field workers know which inspection protocols to complete."
                iconName="FileSpreadsheet"
                actionLabel={project.status !== "completed" && project.status !== "archived" ? "Assign First Form" : undefined}
                onAction={() => setIsAssignModalOpen(true)}
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedForms.map((form) => (
                <Card key={form.id} className="p-5 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                        {form.name}
                      </h4>
                      <StatusBadge status="success" label="Published" />
                    </div>
                    {form.description && (
                      <p className="text-xs text-neutral-500 line-clamp-2">
                        {form.description}
                      </p>
                    )}
                    <div className="text-[11px] text-neutral-400 font-mono">
                      {form.fieldCount} fields • Version {form.schemaVersion}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-4 flex items-center justify-between">
                    {project.status === "active" ? (
                      <Button
                        size="sm"
                        onClick={() => onStartSubmission(form.id, project.id)}
                        className="text-xs h-8 gap-1.5"
                      >
                        <Play className="size-3.5" />
                        <span>Collect Data</span>
                      </Button>
                    ) : (
                      <span className="text-xs text-neutral-400 italic">
                        {project.status === "planning" ? "Activate to collect" : "Closed"}
                      </span>
                    )}

                    {project.status !== "completed" && project.status !== "archived" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRemovingFormId(form.id)}
                        className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 h-8"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. SUBMISSIONS TAB */}
      {activeTab === "submissions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Project Submissions ({submissions.length})
            </h3>
            {submissions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                className="gap-1.5 text-xs"
              >
                <Download className="size-3.5" />
                <span>Export CSV</span>
              </Button>
            )}
          </div>

          <Card className="p-2 overflow-hidden">
            {submissions.length === 0 ? (
              <EmptyState
                title="No submissions recorded for this campaign"
                description="Start a form inspection with this project selected to record campaign data."
                iconName="Layers"
                actionLabel={project.status === "active" && assignedForms.length > 0 ? "Start Collection" : undefined}
                onAction={() => assignedForms.length > 0 && onStartSubmission(assignedForms[0].id, project.id)}
              />
            ) : (
              <DataTable<FormSubmissionRecord>
                data={submissions}
                columns={submissionColumns}
              />
            )}
          </Card>
        </div>
      )}

      {/* 4. PARTICIPATING REGISTRY TAB */}
      {activeTab === "participants" && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Participating Registry Assets
            </h3>
            <p className="text-xs text-neutral-500">
              Physical farms, fields, and agricultural operators derived from submissions recorded under this project.
            </p>
          </div>

          {/* Farms Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs text-neutral-700 dark:text-neutral-300">
              <Building2 className="size-4 text-primary" />
              <span>Participating Farms ({participatingRegistry.farms.length})</span>
            </div>
            {participatingRegistry.farms.length === 0 ? (
              <div className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 text-xs text-neutral-400 italic">
                No farms recorded in this project yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {participatingRegistry.farms.map((f) => (
                  <div key={f.id} className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                    <div className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{f.name}</div>
                    {f.farmerName && (
                      <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                        <User className="size-3" />
                        <span>{f.farmerName}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fields Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs text-neutral-700 dark:text-neutral-300">
              <MapPin className="size-4 text-blue-500" />
              <span>Participating Fields ({participatingRegistry.fields.length})</span>
            </div>
            {participatingRegistry.fields.length === 0 ? (
              <div className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 text-xs text-neutral-400 italic">
                No fields recorded in this project yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {participatingRegistry.fields.map((f) => (
                  <div key={f.id} className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                    <div className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{f.name}</div>
                    {f.area && (
                      <div className="text-xs text-neutral-500 mt-1">
                        {f.area} {f.area_unit || "hectares"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Farmers Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs text-neutral-700 dark:text-neutral-300">
              <User className="size-4 text-emerald-500" />
              <span>Participating Farmers ({participatingRegistry.farmers.length})</span>
            </div>
            {participatingRegistry.farmers.length === 0 ? (
              <div className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 text-xs text-neutral-400 italic">
                No farmers recorded in this project yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {participatingRegistry.farmers.map((farmer) => (
                  <div key={farmer.id} className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                    <div className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                      {farmer.first_name} {farmer.last_name}
                    </div>
                    {farmer.phone && (
                      <div className="text-xs text-neutral-500 mt-1">{farmer.phone}</div>
                    )}
                    {farmer.village && (
                      <div className="text-[11px] text-neutral-400 mt-0.5">{farmer.village}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODALS */}

      {/* Edit Project Modal */}
      <ProjectModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={loadProjectData}
        project={project}
      />

      {/* Delete Project Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        title="Delete Campaign"
        itemName={project.name}
        itemType="project"
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteProject}
      />

      {/* Assign Forms Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Assign Forms to Campaign
            </h3>
            <p className="text-xs text-neutral-500">
              Select published forms to include in this operational project.
            </p>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {availableForms
                .filter((f) => !assignedForms.some((af) => af.id === f.id))
                .map((form) => {
                  const isSelected = selectedFormIdsToAssign.includes(form.id)
                  return (
                    <label
                      key={form.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFormIdsToAssign((prev) => [...prev, form.id])
                          } else {
                            setSelectedFormIdsToAssign((prev) => prev.filter((id) => id !== form.id))
                          }
                        }}
                        className="size-4 rounded text-primary focus:ring-primary"
                      />
                      <div className="flex-1 text-xs">
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {form.name}
                        </div>
                        <div className="text-neutral-400 text-[10px]">
                          {form.fieldCount} fields
                        </div>
                      </div>
                    </label>
                  )
                })}
              {availableForms.filter((f) => !assignedForms.some((af) => af.id === f.id)).length === 0 && (
                <div className="py-6 text-center text-xs text-neutral-400 italic">
                  All available forms are already assigned to this project.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAssignModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmAssignForms}
                disabled={selectedFormIdsToAssign.length === 0}
              >
                Assign {selectedFormIdsToAssign.length} Form(s)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Form Confirmation Modal */}
      {removingFormId && (
        <DeleteConfirmModal
          isOpen={Boolean(removingFormId)}
          title="Remove Form from Campaign"
          itemName={assignedForms.find((f) => f.id === removingFormId)?.name || "Form"}
          itemType="form assignment"
          onClose={() => setRemovingFormId(null)}
          onConfirm={handleConfirmRemoveForm}
        />
      )}

      {/* Submission Detail Modal */}
      {viewingSubmission && (
        <SubmissionDetailDialog
          submission={{
            id: viewingSubmission.id,
            formId: viewingSubmission.formId || "general",
            formVersion: viewingSubmission.formSchemaSnapshot?.version || 1,
            status: viewingSubmission.status,
            responses: viewingSubmission.responses,
            createdAt: viewingSubmission.createdAt,
            updatedAt: viewingSubmission.updatedAt,
            submittedAt: viewingSubmission.status === "submitted" ? viewingSubmission.updatedAt : undefined,
          }}
          formSchema={viewingSubmission.formSchemaSnapshot}
          farmerName={viewingSubmission.farmerName}
          farmName={viewingSubmission.farmName}
          fieldName={viewingSubmission.fieldName}
          projectName={viewingSubmission.projectName || project.name}
          clientSubmissionId={viewingSubmission.clientSubmissionId || undefined}
          rawRecord={viewingSubmission}
          isOpen={!!viewingSubmission}
          onClose={() => setViewingSubmission(null)}
        />
      )}
    </div>
  )
}
