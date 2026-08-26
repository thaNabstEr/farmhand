"use client"

import * as React from "react"
import { AppShell } from "@/components/layout/AppShell"
import { FormBuilderWorkspace } from "@/components/forms/FormBuilderWorkspace"
import { PageHeader } from "@/components/shared/PageHeader"
import { MetricCard } from "@/components/shared/MetricCard"
import { DataTable, Column } from "@/components/shared/DataTable"
import { Card } from "@/components/shared/Card"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import {
  Plus,
  ArrowRight,
  ArrowUpRight,
  Play,
  Layers,
  FileText,
  Eye,
  Edit2,
} from "lucide-react"

import { FormLibraryPage } from "@/components/forms/library/FormLibraryPage"
import { TemplateLibraryPage } from "@/components/templates/TemplateLibraryPage"
import { FormSubmissionsPage } from "@/components/submissions/FormSubmissionsPage"
import { FormRunner } from "@/components/runner/FormRunner"
import { FarmsPage } from "@/components/farms/FarmsPage"
import { FarmersPage } from "@/components/farmers/FarmersPage"
import { FieldsListPage } from "@/components/farms/FieldsListPage"
import { SettingsPage } from "@/components/settings/SettingsPage"
import { SupabaseStatusBadge } from "@/components/shared/SupabaseStatusBadge"
import { localFormRepository } from "@/lib/repositories/LocalFormRepository"
import { supabaseFormRepository } from "@/lib/repositories/SupabaseFormRepository"
import { localSubmissionRepository } from "@/lib/repositories/LocalSubmissionRepository"
import {
  supabaseSubmissionRepository,
  FormSubmissionRecord,
} from "@/lib/repositories/SupabaseSubmissionRepository"
import { FormMetadata } from "@/lib/repositories/types"
import { FormSchema } from "@/form-builder/types"
import { syncEngine, SyncEngineStatus } from "@/lib/offline/syncEngine"

export default function Home() {
  const [activePath, setActivePath] = React.useState<string>("Dashboard")
  const [currentFormId, setCurrentFormId] = React.useState<string | null>(null)
  const [submissionsFormId, setSubmissionsFormId] = React.useState<string>("all")
  const [searchValue, setSearchValue] = React.useState<string>("")
  const [mockActionMessage, setMockActionMessage] = React.useState<string | null>(null)

  // Real data state from Form and Submission Repositories
  const [localForms, setLocalForms] = React.useState<FormMetadata[]>([])
  const [recentSubmissions, setRecentSubmissions] = React.useState<FormSubmissionRecord[]>([])
  const [submissionStats, setSubmissionStats] = React.useState<{ total: number; recentCount: number }>({
    total: 0,
    recentCount: 0,
  })

  // Live Sync Status from syncEngine
  const [syncStatus, setSyncStatus] = React.useState<SyncEngineStatus>(syncEngine.getStatus())

  // Fill Form Runner state
  const [fillSchema, setFillSchema] = React.useState<FormSchema | null>(null)
  const [fillSubmissionId, setFillSubmissionId] = React.useState<string | undefined>(undefined)
  const [fillEditSubmission, setFillEditSubmission] = React.useState<FormSubmissionRecord | null>(null)
  const [fillFarmerId, setFillFarmerId] = React.useState<string | undefined>(undefined)
  const [fillFarmId, setFillFarmId] = React.useState<string | undefined>(undefined)
  const [fillFieldId, setFillFieldId] = React.useState<string | undefined>(undefined)

  // Subscribe to live syncEngine events
  React.useEffect(() => {
    const unsubscribe = syncEngine.subscribe((status) => {
      setSyncStatus(status)
    })
    return () => unsubscribe()
  }, [])

  // Refresh real metrics from repositories
  const refreshDashboardData = React.useCallback(async () => {
    try {
      // 1. Load forms
      const forms = await localFormRepository.getAll()
      setLocalForms(forms)

      // 2. Load submissions from Supabase with fallback to local
      let subs: FormSubmissionRecord[] = []
      try {
        subs = await supabaseSubmissionRepository.getSubmissions({ limit: 10 })
      } catch {
        const localSubs = await localSubmissionRepository.getAll()
        subs = localSubs.map((s) => ({
          id: s.id,
          ownerId: "current-user",
          formId: s.formId,
          farmId: null,
          fieldId: null,
          formSchemaSnapshot: {
            id: s.formId,
            name: "Field Inspection",
            description: "",
            version: s.formVersion || 1,
            fields: [],
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
          },
          responses: s.responses,
          status: s.status === "submitted" ? "submitted" : "draft",
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
          formName: "Field Inspection",
        }))
      }

      setRecentSubmissions(subs)
      setSubmissionStats({
        total: subs.length,
        recentCount: subs.filter((s) => s.status === "submitted").length,
      })
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err)
    }
  }, [])

  React.useEffect(() => {
    refreshDashboardData()
  }, [activePath, refreshDashboardData])

  // Clear mock action message after 3 seconds
  React.useEffect(() => {
    if (mockActionMessage) {
      const timer = setTimeout(() => {
        setMockActionMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [mockActionMessage])

  const openFormInBuilder = (formId: string) => {
    setCurrentFormId(formId)
    setActivePath("FormBuilder")
  }

  const startFormSubmission = async (
    formId: string,
    submissionId?: string,
    farmId?: string,
    fieldId?: string,
    farmerId?: string
  ) => {
    let schema: FormSchema | null = null
    try {
      schema = await supabaseFormRepository.getFormById(formId)
    } catch {
      // fallback to local repository
    }
    if (!schema) {
      try {
        schema = await localFormRepository.getById(formId)
      } catch {
        // ignore
      }
    }
    if (!schema) return
    setFillSchema(schema)
    setFillSubmissionId(submissionId)
    setFillEditSubmission(null)
    setFillFarmerId(farmerId)
    setFillFarmId(farmId)
    setFillFieldId(fieldId)
    setActivePath("FillForm")
  }

  const editExistingSubmission = (submission: FormSubmissionRecord) => {
    const schema = submission.formSchemaSnapshot || {
      id: submission.formId || "form",
      name: submission.formName || "Field Form",
      description: "",
      version: 1,
      fields: [],
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
    }
    setFillSchema(schema)
    setFillEditSubmission(submission)
    setFillSubmissionId(submission.id)
    setFillFarmerId(submission.farmerId || undefined)
    setFillFarmId(submission.farmId || undefined)
    setFillFieldId(submission.fieldId || undefined)
    setActivePath("FillForm")
  }

  const openSubmissionsPage = (formId?: string) => {
    setSubmissionsFormId(formId || "all")
    setActivePath("Submissions")
  }

  // Filter recent submissions based on search query
  const filteredSubmissions = recentSubmissions.filter((sub) => {
    const q = searchValue.toLowerCase().trim()
    if (!q) return true
    const formName = sub.formName || sub.formSchemaSnapshot?.name || ""
    const farmName = sub.farmName || ""
    const farmerName = sub.farmerName || ""
    const fieldName = sub.fieldName || ""
    return (
      formName.toLowerCase().includes(q) ||
      farmName.toLowerCase().includes(q) ||
      farmerName.toLowerCase().includes(q) ||
      fieldName.toLowerCase().includes(q) ||
      sub.status.toLowerCase().includes(q)
    )
  })

  // Columns for real Recent Submissions table
  const submissionColumns: Column<FormSubmissionRecord>[] = [
    {
      key: "formName",
      header: "Form Template",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-neutral-900 dark:text-neutral-50 hover:text-primary transition-colors cursor-pointer">
            {row.formName || row.formSchemaSnapshot?.name || "Field Inspection"}
          </span>
          <span className="text-[11px] text-neutral-400 font-mono">
            {row.clientSubmissionId ? `ID: ${row.clientSubmissionId.substring(0, 8)}...` : `ID: ${row.id.substring(0, 8)}...`}
          </span>
        </div>
      ),
    },
    {
      key: "context",
      header: "Operational Context",
      render: (row) => {
        const parts = [row.farmerName, row.farmName, row.fieldName].filter(Boolean)
        if (parts.length === 0) {
          return <span className="text-xs text-neutral-400 italic">No context attached</span>
        }
        return (
          <div className="flex flex-col">
            <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
              {row.farmName || row.farmerName}
            </span>
            {row.fieldName && (
              <span className="text-[11px] text-neutral-400">
                Field: {row.fieldName}
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (row) => (
        <StatusBadge
          status={row.status === "submitted" ? "success" : "neutral"}
          label={row.status === "submitted" ? "Submitted" : "Draft"}
        />
      ),
    },
    {
      key: "createdAt",
      header: "Collected At",
      render: (row) => (
        <span className="text-neutral-500 dark:text-neutral-400 text-xs font-medium">
          {new Date(row.createdAt).toLocaleDateString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => editExistingSubmission(row)}
            className="h-7 text-xs px-2 gap-1 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
            title="Edit Submission"
          >
            <Edit2 className="size-3 text-emerald-600" />
            <span>Edit</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openSubmissionsPage(row.formId || "all")}
            className="h-7 text-xs px-2 gap-1"
          >
            <Eye className="size-3 text-neutral-500" />
            <span>View</span>
          </Button>
        </div>
      ),
    },
  ]

  const handleQuickAction = (actionTitle: string) => {
    if (actionTitle.includes("Form") || actionTitle.includes("Template")) {
      setActivePath("Forms")
    } else if (actionTitle.includes("Farm")) {
      setActivePath("Farms")
    } else if (actionTitle.includes("Farmer")) {
      setActivePath("Farmers")
    } else {
      setMockActionMessage(`Action "${actionTitle}" triggered!`)
    }
  }

  // Render Dashboard Contents with Real Repository Metrics
  const renderDashboard = () => {
    const totalForms = localForms.length
    const publishedForms = localForms.filter((f) => f.status === "published").length
    const recentForms = localForms.slice(0, 3)

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* Page Title & Main Header */}
        <PageHeader
          title="Operations Dashboard"
          description="Monitor offline inspections, form submissions, and field staff syncing."
          actions={
            <div className="flex items-center gap-2">
              <SupabaseStatusBadge />
              <Button
                onClick={() => openSubmissionsPage("all")}
                variant="outline"
                className="font-bold text-xs gap-1.5 border-neutral-200 dark:border-neutral-800"
              >
                <Layers className="size-3.5" />
                <span>View Submissions ({submissionStats.total})</span>
              </Button>
              <Button onClick={() => setActivePath("Forms")} className="shadow-sm font-bold text-xs gap-1.5">
                <Plus className="size-4" />
                <span>Manage Forms</span>
              </Button>
            </div>
          }
        />

        {/* Real KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Forms"
            value={totalForms.toString()}
            change={`${publishedForms} active`}
            changeType="increase"
            iconName="FileText"
            status="info"
            description="Templates and custom forms"
          />
          <MetricCard
            title="Total Submissions"
            value={submissionStats.total.toString()}
            change={`${submissionStats.recentCount} completed`}
            changeType="increase"
            iconName="Layers"
            status="success"
            description="Persisted records"
          />
          <MetricCard
            title="Sync Status"
            value={
              syncStatus.isOnline
                ? syncStatus.isSyncing
                  ? "Syncing..."
                  : "Online"
                : "Offline"
            }
            change={
              syncStatus.pendingCount > 0
                ? `${syncStatus.pendingCount} pending upload`
                : syncStatus.isOnline
                ? "All queues synced"
                : "Offline queue active"
            }
            changeType={syncStatus.isOnline ? "increase" : "neutral"}
            iconName={syncStatus.isOnline ? "CheckCircle" : "AlertCircle"}
            status={syncStatus.isOnline ? "success" : "warning"}
            description={
              syncStatus.lastSyncTime
                ? `Last sync: ${new Date(syncStatus.lastSyncTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Background sync engine active"
            }
          />
          <MetricCard
            title="Registry State"
            value="Supabase"
            change="RLS Protected"
            changeType="increase"
            iconName="Building2"
            status="success"
            description="Farmers, Farms & Fields"
          />
        </div>

        {/* Real Form Templates & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Form Launch Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <FileText className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span>Ready-to-Use Forms</span>
              </h2>
              <button
                onClick={() => setActivePath("Forms")}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                <span>View all forms</span>
                <ArrowRight className="size-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentForms.map((form) => (
                <div
                  key={form.id}
                  className="p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-card hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 shadow-xs flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                        {form.status}
                      </span>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        v{form.schemaVersion || 1}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {form.name}
                    </h3>
                    {form.description && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                        {form.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                    <Button
                      onClick={() => startFormSubmission(form.id)}
                      size="sm"
                      className="h-8 font-bold text-xs gap-1.5"
                    >
                      <Play className="size-3 fill-current" />
                      <span>Start Form</span>
                    </Button>
                    <button
                      onClick={() => openFormInBuilder(form.id)}
                      className="text-xs font-semibold text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                    >
                      Edit Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Operational Shortcuts */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Operational Actions
            </h2>
            <div className="space-y-2.5">
              <button
                onClick={() => setActivePath("Forms")}
                className="w-full p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-card hover:border-emerald-500/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all text-left flex items-center justify-between group shadow-xs"
              >
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    Create New Form Template
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Design custom forms with logic and calculation fields
                  </p>
                </div>
                <ArrowUpRight className="size-4 text-neutral-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0 ml-2" />
              </button>

              <button
                onClick={() => setActivePath("Farms")}
                className="w-full p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-card hover:border-emerald-500/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all text-left flex items-center justify-between group shadow-xs"
              >
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    Manage Farm Registry
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Configure agricultural properties, boundaries, and fields
                  </p>
                </div>
                <ArrowUpRight className="size-4 text-neutral-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0 ml-2" />
              </button>

              <button
                onClick={() => setActivePath("Farmers")}
                className="w-full p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-card hover:border-emerald-500/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all text-left flex items-center justify-between group shadow-xs"
              >
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    Manage Farmer Registry
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Register producers, contact details, and locations
                  </p>
                </div>
                <ArrowUpRight className="size-4 text-neutral-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0 ml-2" />
              </button>

              <button
                onClick={() => openSubmissionsPage("all")}
                className="w-full p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-card hover:border-emerald-500/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all text-left flex items-center justify-between group shadow-xs"
              >
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    Review Collected Data
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    Filter, search, inspect responses and export CSV/JSON
                  </p>
                </div>
                <ArrowUpRight className="size-4 text-neutral-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0 ml-2" />
              </button>
            </div>
          </div>
        </div>

        {/* Real Recent Submissions Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Recent Field Submissions
              </h3>
              <p className="text-xs text-neutral-400">
                Live inspection logs and synchronized data records from field operators
              </p>
            </div>
            {recentSubmissions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openSubmissionsPage("all")}
                className="text-xs h-8 gap-1"
              >
                <span>View All Records</span>
                <ArrowRight className="size-3" />
              </Button>
            )}
          </div>

          <Card className="p-2 overflow-hidden">
            {recentSubmissions.length === 0 ? (
              <EmptyState
                title="No submissions recorded yet"
                description="Start and complete a form inspection to see real-time collection logs appear here."
                iconName="Layers"
                actionLabel="Start Form"
                onAction={() => setActivePath("Forms")}
              />
            ) : (
              <DataTable<FormSubmissionRecord>
                data={filteredSubmissions}
                columns={submissionColumns}
              />
            )}
          </Card>
        </div>
      </div>
    )
  }

  // Fallback View for placeholders
  const renderFallbackView = (viewName: string) => {
    const details = {
      title: viewName,
      desc: `Manage and view all ${viewName.toLowerCase()} settings in FarmHand.`,
      icon: "Layers" as const,
    }

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
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
  if (activePath === "Farmers") {
    return (
      <AppShell activePath={activePath} onNavigate={setActivePath} searchValue={searchValue} onSearchChange={setSearchValue}>
        <FarmersPage onNavigateToFarm={() => setActivePath("Farms")} />
      </AppShell>
    )
  }

  if (activePath === "Farms") {
    return (
      <AppShell activePath={activePath} onNavigate={setActivePath} searchValue={searchValue} onSearchChange={setSearchValue}>
        <FarmsPage />
      </AppShell>
    )
  }

  if (activePath === "Fields") {
    return (
      <AppShell activePath={activePath} onNavigate={setActivePath} searchValue={searchValue} onSearchChange={setSearchValue}>
        <FieldsListPage onNavigateToFarm={() => setActivePath("Farms")} />
      </AppShell>
    )
  }

  if (activePath === "Settings") {
    return (
      <AppShell activePath={activePath} onNavigate={setActivePath} searchValue={searchValue} onSearchChange={setSearchValue}>
        <SettingsPage />
      </AppShell>
    )
  }

  if (activePath === "Forms") {
    return (
      <AppShell activePath={activePath} onNavigate={setActivePath} searchValue={searchValue} onSearchChange={setSearchValue}>
        <FormLibraryPage
          onOpenBuilder={openFormInBuilder}
          onOpenTemplates={() => setActivePath("Templates")}
          onStartSubmission={(id) => startFormSubmission(id)}
          onStartSubmissionWithContext={(formId, farmId, fieldId, farmerId) => startFormSubmission(formId, undefined, farmId, fieldId, farmerId)}
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
          onEditSubmission={editExistingSubmission}
        />
      </AppShell>
    )
  }

  if (activePath === "FillForm" && fillSchema) {
    return (
      <div className="h-screen w-screen overflow-y-auto bg-background p-6 sm:p-10 scrollbar-thin">
        <FormRunner
          schema={fillSchema}
          mode={fillEditSubmission ? "edit" : "fill"}
          submissionId={fillSubmissionId}
          editSubmission={fillEditSubmission}
          farmerId={fillFarmerId}
          farmId={fillFarmId}
          fieldId={fillFieldId}
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
