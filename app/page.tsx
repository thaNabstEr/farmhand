"use client"

import * as React from "react"
import { AppShell } from "@/components/layout/AppShell"
import { FormBuilderWorkspace } from "@/components/forms/FormBuilderWorkspace"
import { PageHeader } from "@/components/shared/PageHeader"
import { MetricCard } from "@/components/shared/MetricCard"
import { DataTable, Column } from "@/components/shared/DataTable"
import { Card } from "@/components/shared/Card"
import { StatusBadge, StatusType } from "@/components/shared/StatusBadge"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import {
  Plus,
  ArrowRight,
  ArrowUpRight,
  Play,
  Layers,
  FileText
} from "lucide-react"
import {
  mockProjects,
  ProjectData
} from "@/data/mock/dashboard"

import { FormLibraryPage } from "@/components/forms/library/FormLibraryPage"
import { TemplateLibraryPage } from "@/components/templates/TemplateLibraryPage"
import { FormSubmissionsPage } from "@/components/submissions/FormSubmissionsPage"
import { FormRunner } from "@/components/runner/FormRunner"
import { localFormRepository } from "@/lib/repositories/LocalFormRepository"
import { localSubmissionRepository } from "@/lib/repositories/LocalSubmissionRepository"
import { FormMetadata } from "@/lib/repositories/types"
import { FormSchema } from "@/form-builder/types"

export default function Home() {
  const [activePath, setActivePath] = React.useState<string>("Dashboard")
  const [currentFormId, setCurrentFormId] = React.useState<string | null>(null)
  const [searchValue, setSearchValue] = React.useState<string>("")
  const [mockActionMessage, setMockActionMessage] = React.useState<string | null>(null)
  const [localForms, setLocalForms] = React.useState<FormMetadata[]>([])

  // Submission Runner state
  const [fillSchema, setFillSchema] = React.useState<FormSchema | null>(null)
  const [fillSubmissionId, setFillSubmissionId] = React.useState<string | undefined>(undefined)
  const [submissionsFormId, setSubmissionsFormId] = React.useState<string | null>(null)

  // Real Submissions metrics
  const [submissionStats, setSubmissionStats] = React.useState({
    total: 0,
    submitted: 0,
    drafts: 0,
  })

  // Fetch real local repository metrics
  const fetchLocalMetrics = React.useCallback(async () => {
    try {
      const [formsList, subsList] = await Promise.all([
        localFormRepository.getAll(),
        localSubmissionRepository.getAll(),
      ])
      setLocalForms(formsList)
      setSubmissionStats({
        total: subsList.length,
        submitted: subsList.filter((s) => s.status === "submitted").length,
        drafts: subsList.filter((s) => s.status === "draft").length,
      })
    } catch (e) {
      console.error("Failed to fetch local metrics", e)
    }
  }, [])

  React.useEffect(() => {
    fetchLocalMetrics()
  }, [fetchLocalMetrics, activePath])

  // Auto-clear toast action messages
  React.useEffect(() => {
    if (mockActionMessage) {
      const timer = setTimeout(() => setMockActionMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [mockActionMessage])

  const openFormInBuilder = (formId: string) => {
    setCurrentFormId(formId)
    setActivePath("FormBuilder")
  }

  const startFormSubmission = async (formId: string, submissionId?: string) => {
    const schema = await localFormRepository.getById(formId)
    if (!schema) return
    setFillSchema(schema)
    setFillSubmissionId(submissionId)
    setActivePath("FillForm")
  }

  const openSubmissionsPage = (formId?: string) => {
    setSubmissionsFormId(formId || "all")
    setActivePath("Submissions")
  }

  // Filter projects based on search query
  const filteredProjects = mockProjects.filter((project) =>
    project.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    project.region.toLowerCase().includes(searchValue.toLowerCase()) ||
    project.status.toLowerCase().includes(searchValue.toLowerCase())
  )

  // Column definitions for Projects table
  const projectColumns: Column<ProjectData>[] = [
    {
      key: "name",
      header: "Project Name",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-neutral-900 dark:text-neutral-50 hover:text-primary transition-colors cursor-pointer">
            {row.name}
          </span>
          <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
            {row.region}
          </span>
        </div>
      )
    },
    {
      key: "formsCount",
      header: "Forms",
      align: "center",
      render: (row) => (
        <span className="font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded-md text-xs font-semibold">
          {row.formsCount}
        </span>
      )
    },
    {
      key: "submissionsCount",
      header: "Submissions",
      align: "center",
      render: (row) => (
        <span className="font-mono font-medium text-neutral-600 dark:text-neutral-400">
          {row.submissionsCount}
        </span>
      )
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (row) => <StatusBadge status={row.status as StatusType} label={row.status} />
    },
    {
      key: "lastUpdated",
      header: "Last Updated",
      render: (row) => (
        <span className="text-neutral-400 dark:text-neutral-500 text-xs font-medium">
          {row.lastUpdated}
        </span>
      )
    }
  ]

  const handleQuickAction = (actionTitle: string) => {
    if (actionTitle.includes("Form") || actionTitle.includes("Template")) {
      setActivePath("Forms")
    } else {
      setMockActionMessage(`Action "${actionTitle}" triggered! (Prototype Only)`)
    }
  }

  // Render Dashboard Contents with Real Repository Metrics
  const renderDashboard = () => {
    const totalForms = localForms.length
    const publishedForms = localForms.filter((f) => f.status === "published").length
    const recentForms = localForms.slice(0, 3)

    return (
      <div className="space-y-6">
        {/* Page Title & Main Header */}
        <PageHeader
          title="Operations Dashboard"
          description="Monitor offline inspections, form submissions, and field staff syncing."
          actions={
            <div className="flex items-center gap-2">
              <Button onClick={() => openSubmissionsPage("all")} variant="outline" className="font-bold text-xs gap-1.5 border-neutral-200 dark:border-neutral-800">
                <Layers className="size-3.5" />
                View Submissions ({submissionStats.total})
              </Button>
              <Button onClick={() => setActivePath("Forms")} className="shadow-sm font-bold text-xs gap-1.5">
                <Plus className="size-4" />
                Manage Forms
              </Button>
            </div>
          }
        />

        {/* Real KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Forms"
            value={totalForms.toString()}
            change="+100%"
            changeType="increase"
            iconName="FileText"
            status="info"
            description="Stored in local repository"
          />
          <MetricCard
            title="Submitted Records"
            value={submissionStats.submitted.toString()}
            change="Completed"
            changeType="increase"
            iconName="CheckCircle2"
            status="success"
            description="Total completed submissions"
          />
          <MetricCard
            title="Unfinished Drafts"
            value={submissionStats.drafts.toString()}
            change="In Progress"
            changeType="neutral"
            iconName="Clock"
            status="warning"
            description="Pending draft submissions"
          />
          <MetricCard
            title="Published Forms"
            value={publishedForms.toString()}
            change="Ready"
            changeType="increase"
            iconName="Send"
            status="success"
            description="Ready for field operators"
          />
        </div>

        {/* Main Grid: Recent Forms & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3 width): Recent Forms */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
                  Recently Updated Forms
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActivePath("Forms")}
                  className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  View All Forms <ArrowRight className="size-3 ml-1" />
                </Button>
              </div>

              {recentForms.length === 0 ? (
                <Card className="p-6 text-center text-xs text-neutral-400">
                  No forms created yet. Click Manage Forms to create your first form.
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {recentForms.map((form) => (
                    <div
                      key={form.id}
                      onClick={() => openFormInBuilder(form.id)}
                      className="p-4 rounded-card border border-neutral-200/80 dark:border-neutral-850 bg-card hover:border-neutral-300 dark:hover:border-neutral-750 transition-all duration-200 cursor-pointer space-y-3 select-none group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-850 dark:text-neutral-100 truncate group-hover:text-primary transition-colors">
                          {form.name}
                        </span>
                        <ArrowUpRight className="size-3.5 text-neutral-400 group-hover:text-primary transition-colors" />
                      </div>

                      <p className="text-[11px] text-neutral-400 font-medium truncate">
                        {form.fieldCount} fields • {form.status}
                      </p>

                      <div className="flex items-center gap-1.5 pt-1 border-t border-neutral-100 dark:border-neutral-850" onClick={(e) => e.stopPropagation()}>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => startFormSubmission(form.id)}
                          className="h-7 text-[11px] font-bold gap-1 px-2 flex-1"
                        >
                          <Play className="size-3 fill-current" />
                          <span>Fill Form</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openSubmissionsPage(form.id)}
                          className="h-7 text-[11px] font-semibold px-2 border-neutral-200 dark:border-neutral-800"
                        >
                          <Layers className="size-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Projects Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
                  Recent Projects
                </h2>
              </div>
              
              <DataTable
                columns={projectColumns}
                data={filteredProjects}
                emptyText="No active projects found matching your query."
              />
            </div>
          </div>

          {/* Right Column (1/3 width): Quick Actions */}
          <div className="space-y-6">
            <Card className="p-5 space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
                  Quick Actions
                </h3>
                <p className="text-xs text-neutral-400 font-medium">
                  Perform common administrative tasks
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  type="button"
                  onClick={() => openSubmissionsPage("all")}
                  variant="outline"
                  className="w-full justify-start text-xs font-semibold gap-2 border-neutral-200 dark:border-neutral-800 h-9"
                >
                  <Layers className="size-4 text-primary" />
                  <span>Inspect All Records</span>
                </Button>

                <Button
                  type="button"
                  onClick={() => setActivePath("Forms")}
                  variant="outline"
                  className="w-full justify-start text-xs font-semibold gap-2 border-neutral-200 dark:border-neutral-800 h-9"
                >
                  <FileText className="size-4 text-primary" />
                  <span>Open Form Library</span>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Fallback View for placeholders
  const renderFallbackView = (viewName: string) => {
    const details = {
      title: viewName,
      desc: `Manage and view all ${viewName.toLowerCase()} settings in FarmHand.`,
      icon: "Layers" as const
    }

    return (
      <div className="space-y-6">
        <PageHeader title={details.title} description={details.desc} />
        <EmptyState
          title={`No ${viewName} Available`}
          description={details.desc}
          iconName={details.icon}
          actionLabel={`Create First ${viewName.slice(0, -1) || "Record"}`}
          onAction={() => handleQuickAction(`Empty state action for ${viewName}`)}
        />
      </div>
    )
  }

  // Navigation Switcher
  if (activePath === "Forms") {
    return (
      <AppShell activePath={activePath} onNavigate={setActivePath} searchValue={searchValue} onSearchChange={setSearchValue}>
        <FormLibraryPage
          onOpenBuilder={openFormInBuilder}
          onOpenTemplates={() => setActivePath("Templates")}
          onStartSubmission={(id) => startFormSubmission(id)}
          onViewSubmissions={(id) => openSubmissionsPage(id)}
        />
      </AppShell>
    )
  }

  if (activePath === "Templates") {
    return (
      <AppShell activePath={activePath} onNavigate={setActivePath} searchValue={searchValue} onSearchChange={setSearchValue}>
        <TemplateLibraryPage
          onBackToForms={() => setActivePath("Forms")}
          onOpenBuilder={openFormInBuilder}
        />
      </AppShell>
    )
  }

  if (activePath === "Submissions") {
    return (
      <AppShell activePath={activePath} onNavigate={setActivePath} searchValue={searchValue} onSearchChange={setSearchValue}>
        <FormSubmissionsPage
          initialFormId={submissionsFormId}
          onBackToForms={() => setActivePath("Forms")}
          onStartSubmission={(id) => startFormSubmission(id)}
        />
      </AppShell>
    )
  }

  if (activePath === "FillForm" && fillSchema) {
    return (
      <div className="h-screen w-screen overflow-y-auto bg-background p-6 sm:p-10 scrollbar-thin">
        <FormRunner
          schema={fillSchema}
          mode="fill"
          submissionId={fillSubmissionId}
          onBackToForms={() => setActivePath("Forms")}
          onViewSubmissions={() => openSubmissionsPage(fillSchema.id)}
        />
      </div>
    )
  }

  if (activePath === "FormBuilder") {
    return (
      <FormBuilderWorkspace
        formId={currentFormId || undefined}
        onBack={() => setActivePath("Forms")}
        onStartSubmission={(id) => startFormSubmission(id)}
        onViewSubmissions={(id) => openSubmissionsPage(id)}
      />
    )
  }

  return (
    <AppShell
      activePath={activePath}
      onNavigate={setActivePath}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
    >
      {/* Visual action alerts/toasts */}
      {mockActionMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs px-4 py-3 rounded-button shadow-lg border border-neutral-800 dark:border-neutral-200 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="size-1.5 rounded-full bg-primary animate-ping" />
          <span className="font-semibold">{mockActionMessage}</span>
        </div>
      )}

      {/* Main content switch */}
      {activePath === "Dashboard" ? renderDashboard() : renderFallbackView(activePath)}
    </AppShell>
  )
}
