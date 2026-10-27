"use client"

import * as React from "react"
import {
  ProjectRecord,
  ProjectStatus,
  supabaseProjectRepository,
} from "@/lib/repositories/SupabaseProjectRepository"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card } from "@/components/shared/Card"
import { MetricCard } from "@/components/shared/MetricCard"
import { SearchBar } from "@/components/shared/SearchBar"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { ProjectModal } from "./ProjectModal"
import { ProjectDetailView } from "./ProjectDetailView"
import {
  ArrowRight,
  Play,
  Calendar,
  Layers,
  AlertCircle,
  Plus,
} from "lucide-react"

interface ProjectsPageProps {
  onStartSubmissionWithContext?: (formId: string, projectId: string) => void
  onNavigateToSubmissions?: (projectId?: string) => void
}

export function ProjectsPage({
  onStartSubmissionWithContext,
  onNavigateToSubmissions,
}: ProjectsPageProps) {
  const [projects, setProjects] = React.useState<ProjectRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"all" | ProjectStatus>("all")

  // Selected project drill-down view
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null)

  // Dialog state
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const refreshProjects = React.useCallback(async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const data = await supabaseProjectRepository.getProjects({
        status: statusFilter,
        search: searchQuery,
      })
      setProjects(data)
    } catch (err: unknown) {
      console.error("Failed to load projects:", err)
      setErrorMessage(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [statusFilter, searchQuery])

  React.useEffect(() => {
    refreshProjects()
  }, [refreshProjects])

  // Drill down into Project Detail View
  if (selectedProjectId) {
    return (
      <ProjectDetailView
        projectId={selectedProjectId}
        onBack={() => {
          setSelectedProjectId(null)
          refreshProjects()
        }}
        onStartSubmission={(formId, projectId) => {
          if (onStartSubmissionWithContext) {
            onStartSubmissionWithContext(formId, projectId)
          }
        }}
        onViewAllSubmissions={onNavigateToSubmissions}
      />
    )
  }

  // Summary Metrics calculations
  const totalCount = projects.length
  const activeCount = projects.filter((p) => p.status === "active").length
  const planningCount = projects.filter((p) => p.status === "planning").length
  const totalSubmissions = projects.reduce((acc, p) => acc + p.submissionsCount, 0)

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
      {/* Page Header */}
      <PageHeader
        title="Projects & Field Campaigns"
        description="Organize inspection protocols, monitor data collection campaigns, and track submission quotas across agricultural programmes."
        actions={
          <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5 shadow-sm">
            <Plus className="size-4" />
            <span>Create Project</span>
          </Button>
        }
      />

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Campaigns"
          value={String(activeCount)}
          change="Open"
          changeType="increase"
          iconName="Folder"
          status="success"
          description="Campaigns currently open for field data collection"
        />
        <MetricCard
          title="In Planning"
          value={String(planningCount)}
          change="Upcoming"
          changeType="neutral"
          iconName="Clock"
          status="info"
          description="Upcoming projects being configured"
        />
        <MetricCard
          title="Total Campaigns"
          value={String(totalCount)}
          change="Workspace"
          changeType="neutral"
          iconName="Layers"
          status="info"
          description="All operational programmes in workspace"
        />
        <MetricCard
          title="Campaign Submissions"
          value={String(totalSubmissions)}
          change="Logged"
          changeType="increase"
          iconName="FileText"
          status="success"
          description="Total inspections logged under projects"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(["all", "active", "planning", "completed", "archived"] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all shrink-0 ${
                statusFilter === status
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full sm:w-72">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search campaigns by name, code..."
          />
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-neutral-400">
          Loading campaigns...
        </div>
      ) : projects.length === 0 ? (
        <Card className="p-10">
          <EmptyState
            title="No projects found"
            description={
              searchQuery || statusFilter !== "all"
                ? "No campaigns match your selected filters. Try clearing your search query."
                : "Create your first agricultural campaign to group inspection forms and set submission targets."
            }
            iconName="Folder"
            actionLabel={statusFilter === "all" && !searchQuery ? "Create Project" : undefined}
            onAction={() => setIsCreateOpen(true)}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="p-5 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-xs transition-all"
            >
              <div className="space-y-3">
                {/* Status & Code */}
                <div className="flex items-center justify-between gap-2">
                  {renderStatusBadge(project.status)}
                  {project.code && (
                    <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                      {project.code}
                    </span>
                  )}
                </div>

                {/* Name & Description */}
                <div>
                  <h3
                    onClick={() => setSelectedProjectId(project.id)}
                    className="text-base font-bold text-neutral-900 dark:text-neutral-100 hover:text-primary transition-colors cursor-pointer line-clamp-1"
                  >
                    {project.name}
                  </h3>
                  {project.description ? (
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  ) : (
                    <p className="text-xs text-neutral-400 italic mt-1">
                      No operational description provided
                    </p>
                  )}
                </div>

                {/* Progress Bar (Stage 11 Exact Rules) */}
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500 font-medium">Progress</span>
                    <span className="font-bold text-neutral-900 dark:text-neutral-100 font-mono">
                      {project.targetSubmissions === null ? (
                        <span>{project.submissionsCount} Recorded</span>
                      ) : project.targetSubmissions === 0 ? (
                        <span>0 / 0</span>
                      ) : (
                        <span>
                          {project.submissionsCount} / {project.targetSubmissions}{" "}
                          <span className="text-neutral-400 font-normal">
                            ({project.progressPercentage}%)
                          </span>
                        </span>
                      )}
                    </span>
                  </div>

                  {project.targetSubmissions !== null && project.targetSubmissions > 0 && (
                    <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${project.progressBarPercentage}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Metadata badges: Assigned Forms & Date range */}
                <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                  <div className="flex items-center gap-1">
                    <Layers className="size-3 text-neutral-400" />
                    <span>{project.formsCount} form(s)</span>
                  </div>
                  {project.startDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3 text-neutral-400" />
                      <span>{new Date(project.startDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-4 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProjectId(project.id)}
                  className="text-xs h-8 gap-1"
                >
                  <span>View Campaign</span>
                  <ArrowRight className="size-3" />
                </Button>

                {project.status === "active" && project.formsCount > 0 && (
                  <Button
                    size="sm"
                    onClick={() => setSelectedProjectId(project.id)}
                    className="text-xs h-8 gap-1"
                  >
                    <Play className="size-3" />
                    <span>Collect</span>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <ProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={refreshProjects}
      />
    </div>
  )
}
