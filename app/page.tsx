"use client"

import * as React from "react"
import * as Icons from "lucide-react"
import { AppShell } from "@/components/layout/AppShell"
import { PageHeader } from "@/components/shared/PageHeader"
import { MetricCard } from "@/components/shared/MetricCard"
import { DataTable, Column } from "@/components/shared/DataTable"
import { Card } from "@/components/shared/Card"
import { StatusBadge, StatusType } from "@/components/shared/StatusBadge"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import {
  Plus,
  FolderPlus,
  FilePlus,
  UserPlus,
  UserCheck,
  ArrowRight,
  Database,
  RefreshCw,
  FileSpreadsheet,
  User,
  ArrowUpRight
} from "lucide-react"
import {
  mockKPIs,
  mockProjects,
  mockActivities,
  mockQuickActions,
  ProjectData
} from "@/data/mock/dashboard"

export default function Home() {
  const [activePath, setActivePath] = React.useState<string>("Dashboard")
  const [searchValue, setSearchValue] = React.useState<string>("")
  const [mockActionMessage, setMockActionMessage] = React.useState<string | null>(null)

  // Auto-clear toast action messages
  React.useEffect(() => {
    if (mockActionMessage) {
      const timer = setTimeout(() => setMockActionMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [mockActionMessage])

  // Filter projects based on search query
  const filteredProjects = mockProjects.filter((project) =>
    project.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    project.region.toLowerCase().includes(searchValue.toLowerCase()) ||
    project.status.toLowerCase().includes(searchValue.toLowerCase())
  )

  // Filter activities based on search query
  const filteredActivities = mockActivities.filter((activity) =>
    activity.user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    activity.action.toLowerCase().includes(searchValue.toLowerCase()) ||
    activity.target.toLowerCase().includes(searchValue.toLowerCase())
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
      render: (row) => {
        const statusMap: Record<string, { label: string; status: StatusType }> = {
          active: { label: "Active", status: "success" },
          completed: { label: "Completed", status: "info" },
          draft: { label: "Draft", status: "neutral" },
          archived: { label: "Archived", status: "error" }
        }
        const mapped = statusMap[row.status] || { label: row.status, status: "neutral" }
        return <StatusBadge status={mapped.status} label={mapped.label} />
      }
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
    setMockActionMessage(`Action "${actionTitle}" triggered! (Prototype Only)`)
  }

  // Render Dashboard Contents
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Page Title & Main Header */}
      <PageHeader
        title="Operations Dashboard"
        description="Monitor offline inspections, form submissions, and field staff syncing."
        actions={
          <Button onClick={() => handleQuickAction("Create New Project")} className="shadow-sm">
            <Plus className="size-4 mr-1.5" />
            Create Project
          </Button>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockKPIs.map((kpi) => (
          <MetricCard
            key={kpi.id}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            changeType={kpi.changeType}
            iconName={kpi.icon as keyof typeof Icons}
            status={kpi.status}
            description={kpi.description}
          />
        ))}
      </div>

      {/* Main Grid: Projects, Activities & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width on large screens): Recent Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
              Recent Projects
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setActivePath("Projects")} className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
              View All <ArrowRight className="size-3 ml-1" />
            </Button>
          </div>
          
          <DataTable
            columns={projectColumns}
            data={filteredProjects}
            emptyText={searchValue ? "No projects found matching search" : "No projects created yet"}
            onRowClick={(row) => handleQuickAction(`Project details for: ${row.name}`)}
          />
        </div>

        {/* Right Column (1/3 width): Quick Actions & Recent Activity */}
        <div className="space-y-6">
          {/* Quick Actions List */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
              Quick Actions
            </h2>
            <Card className="p-4 divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {mockQuickActions.map((action) => {
                const actionIcons = {
                  FolderPlus: FolderPlus,
                  FilePlus: FilePlus,
                  UserPlus: UserPlus,
                  UserCheck: UserCheck
                }
                const ActionIcon = actionIcons[action.icon as keyof typeof actionIcons] || FolderPlus

                return (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.title)}
                    className="w-full flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 px-2 rounded-lg transition-colors group text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/30 text-neutral-600 dark:text-neutral-400 group-hover:bg-primary-soft group-hover:text-primary transition-all duration-200 shrink-0">
                        <ActionIcon className="size-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                          {action.title}
                        </h4>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium mt-0.5 line-clamp-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="size-3.5 text-neutral-300 dark:text-neutral-700 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-2" />
                  </button>
                )
              })}
            </Card>
          </div>

          {/* Recent Activities Feed */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
              Recent Activity
            </h2>
            <Card className="p-4 space-y-4">
              {filteredActivities.length === 0 ? (
                <div className="text-center py-6 text-xs text-neutral-400 dark:text-neutral-500">
                  No activity found
                </div>
              ) : (
                filteredActivities.map((act) => {
                  const activityIconStyles = {
                    submission: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/30",
                    sync: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/30",
                    update: "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800/40",
                    registry: "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900/30"
                  }
                  
                  const activityIcons = {
                    submission: FileSpreadsheet,
                    sync: RefreshCw,
                    update: Icons.Settings,
                    registry: User
                  }

                  const ActIcon = activityIcons[act.type] || Database

                  return (
                    <div key={act.id} className="flex gap-3 text-sm">
                      {/* Initials Badge */}
                      <div className="size-8 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 text-neutral-700 dark:text-neutral-300 font-semibold text-xs flex items-center justify-center shrink-0 shadow-sm">
                        {act.user.initials}
                      </div>
                      
                      {/* Event Details */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="text-neutral-800 dark:text-neutral-200 leading-snug">
                          <span className="font-semibold text-neutral-900 dark:text-neutral-50">
                            {act.user.name}
                          </span>{" "}
                          {act.action}{" "}
                          <span className="font-semibold text-neutral-900 dark:text-neutral-50">
                            {act.target}
                          </span>
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className={`p-0.5 rounded border ${activityIconStyles[act.type]}`}>
                            <ActIcon className="size-2.5" />
                          </div>
                          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
                            {act.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )

  // Render Visual Fallback/Empty States for Other Pages
  const renderFallbackView = (viewName: string) => {
    const pageDetails: Record<string, { title: string; desc: string; icon: keyof typeof Icons }> = {
      Projects: {
        title: "Field Projects",
        desc: "Deploy field inspection tasks, organize structures, and monitor active operational campaigns.",
        icon: "Folder"
      },
      Forms: {
        title: "Mobile Form Builder",
        desc: "Create robust, logic-driven collection surveys that support offline offline synchronization.",
        icon: "FileSpreadsheet"
      },
      Submissions: {
        title: "Field Submissions",
        desc: "Review incoming offline reports, check validation flags, and export raw data.",
        icon: "Inbox"
      },
      Farmers: {
        title: "Farmer Registry",
        desc: "Manage profiles, demographic details, contact cards, and associated farming regions.",
        icon: "User"
      },
      Farms: {
        title: "Farm Registry",
        desc: "Registry of geographic fields, plot areas, crop types, and soil properties.",
        icon: "MapPin"
      },
      Maps: {
        title: "Geographical Mapping",
        desc: "Visualize coordinates, plot boundaries, and track GPS pathways mapped by operators.",
        icon: "Map"
      },
      Reports: {
        title: "Operational Analytics",
        desc: "Generate performance audits, yield analysis, and compliance status reports.",
        icon: "BarChart3"
      },
      Team: {
        title: "Field Operators & Staff",
        desc: "Manage operator accounts, assign permission roles, and provision client keys.",
        icon: "Users"
      },
      Settings: {
        title: "System Settings",
        desc: "Adjust branding tokens, update offline sync profiles, and manage system preferences.",
        icon: "Settings"
      }
    }

    const details = pageDetails[viewName] || {
      title: viewName,
      desc: "This section is under active milestone implementation.",
      icon: "Database"
    }

    return (
      <div className="space-y-6">
        <PageHeader
          title={details.title}
          description="View properties, configuration configurations, and visual records."
          actions={
            <Button onClick={() => handleQuickAction(`Create inside ${viewName}`)} className="shadow-sm">
              <Plus className="size-4 mr-1.5" />
              Add Record
            </Button>
          }
        />
        <EmptyState
          title={`No ${details.title} Found`}
          description={details.desc}
          iconName={details.icon}
          actionLabel={`Create First ${viewName.slice(0, -1) || "Record"}`}
          onAction={() => handleQuickAction(`Empty state action for ${viewName}`)}
        />
      </div>
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
