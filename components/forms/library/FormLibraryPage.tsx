"use client"

import * as React from "react"
import { Search, Plus, SlidersHorizontal, ArrowUpDown, Sparkles } from "lucide-react"
import { FormMetadata, FormStatus } from "@/lib/repositories/types"
import { localFormRepository } from "@/lib/repositories/LocalFormRepository"
import { supabaseFormRepository } from "@/lib/repositories/SupabaseFormRepository"
import { templateRepository } from "@/lib/templates"
import { FormCard } from "./FormCard"
import { CreateFormDialog } from "./CreateFormDialog"
import { DeleteFormDialog } from "./DeleteFormDialog"
import { RenameFormDialog } from "./RenameFormDialog"
import { StartSubmissionModal } from "@/components/submissions/StartSubmissionModal"
import { Button } from "@/components/ui/button"

export interface FormLibraryPageProps {
  onOpenBuilder: (id: string) => void
  onOpenTemplates: () => void
  onStartSubmission?: (id: string) => void
  onStartSubmissionWithContext?: (formId: string, farmId: string, fieldId?: string) => void
  onViewSubmissions?: (id: string) => void
}

export function FormLibraryPage({
  onOpenBuilder,
  onOpenTemplates,
  onStartSubmission,
  onStartSubmissionWithContext,
  onViewSubmissions,
}: FormLibraryPageProps) {
  const [forms, setForms] = React.useState<FormMetadata[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"all" | FormStatus>("all")
  const [sortBy, setSortBy] = React.useState<"updated" | "created" | "name" | "status">("updated")

  // Modal dialog states
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [deletingForm, setDeletingForm] = React.useState<FormMetadata | null>(null)
  const [renamingForm, setRenamingForm] = React.useState<FormMetadata | null>(null)
  const [submissionTargetForm, setSubmissionTargetForm] = React.useState<FormMetadata | null>(null)

  // Load forms from SupabaseFormRepository with local fallback
  const refreshForms = React.useCallback(async () => {
    setLoading(true)
    try {
      let list: FormMetadata[] = []
      try {
        list = await supabaseFormRepository.getForms()
      } catch (err) {
        console.warn("Supabase form fetch failed, using local repository fallback:", err)
      }

      if (list.length === 0) {
        const localList = await localFormRepository.getAll()
        if (localList.length === 0) {
          await templateRepository.createFromTemplate("template_farm_inspection")
          list = await localFormRepository.getAll()
        } else {
          list = localList
        }
      }

      setForms(list)
    } catch (e) {
      console.error("Failed to load forms from repository:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    refreshForms()
  }, [refreshForms])

  // Handlers for Form Actions
  const handleCreateBlank = async () => {
    setIsCreateOpen(false)
    try {
      const newForm = await supabaseFormRepository.createForm({
        name: "Untitled Form",
        description: "",
        version: 1,
        fields: [],
      })
      onOpenBuilder(newForm.id)
    } catch (err) {
      console.warn("Supabase create failed, using local fallback:", err)
      const newLocalForm = await localFormRepository.create({
        id: "",
        name: "Untitled Form",
        description: "",
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fields: [],
      })
      onOpenBuilder(newLocalForm.id)
    }
  }

  const handleDuplicate = async (id: string) => {
    await localFormRepository.duplicate(id)
    await refreshForms()
  }

  const handleArchive = async (id: string) => {
    await localFormRepository.archive(id)
    await refreshForms()
  }

  const handleConfirmRename = async (id: string, newName: string) => {
    try {
      const formSchema = await supabaseFormRepository.getFormById(id)
      if (formSchema) {
        await supabaseFormRepository.updateForm({ ...formSchema, name: newName })
      } else {
        const localSchema = await localFormRepository.getById(id)
        if (localSchema) {
          await localFormRepository.update({ ...localSchema, name: newName })
        }
      }
    } catch (err) {
      console.warn("Rename in Supabase failed, trying local fallback:", err)
      const localSchema = await localFormRepository.getById(id)
      if (localSchema) {
        await localFormRepository.update({ ...localSchema, name: newName })
      }
    }
    await refreshForms()
    setRenamingForm(null)
  }

  const handleConfirmDelete = async (id: string) => {
    try {
      await supabaseFormRepository.deleteForm(id)
    } catch (err) {
      console.warn("Supabase delete failed, trying local delete:", err)
    }
    try {
      await localFormRepository.delete(id)
    } catch {
      // ignore
    }
    await refreshForms()
    setDeletingForm(null)
  }

  // Filter & Sort Logic
  const filteredAndSortedForms = React.useMemo(() => {
    const result = forms.filter((f) => {
      // Search match
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query ||
        f.name.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query)

      // Status filter
      const matchesStatus = statusFilter === "all" ? f.status !== "archived" : f.status === statusFilter

      return matchesSearch && matchesStatus
    })

    // Sort
    return result.sort((a, b) => {
      if (sortBy === "created") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      if (sortBy === "name") {
        return a.name.localeCompare(b.name)
      }
      if (sortBy === "status") {
        return a.status.localeCompare(b.status)
      }
      // Default: updated
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  }, [forms, searchQuery, statusFilter, sortBy])

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
            Form Library
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
            Manage, duplicate, and build your enterprise data collection forms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onOpenTemplates}
            className="h-10 text-xs font-semibold gap-1.5 border-neutral-200/80 dark:border-neutral-800"
          >
            <Sparkles className="size-4 text-purple-500" />
            <span>Template Gallery</span>
          </Button>

          <Button
            onClick={() => setIsCreateOpen(true)}
            className="h-10 px-4 font-bold text-xs gap-1.5 shadow-sm"
          >
            <Plus className="size-4" />
            <span>Create Form</span>
          </Button>
        </div>
      </div>

      {/* Controls Bar: Search + Status Tabs + Sorting */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-2 border-b border-neutral-200/60 dark:border-neutral-850">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search forms by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-input border border-neutral-250 dark:border-neutral-800 bg-card text-xs font-medium text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-primary/25 transition-all duration-150"
          />
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
          {/* Status Filter Tabs */}
          <div className="flex items-center p-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-850 border border-neutral-200/60 dark:border-neutral-800 text-xs">
            {(["all", "draft", "published", "archived"] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-md font-semibold capitalize transition-all duration-150 ${
                  statusFilter === st
                    ? "bg-card text-neutral-900 dark:text-neutral-50 shadow-xs"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 px-3 h-9 rounded-input border border-neutral-200/80 dark:border-neutral-800 bg-card text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            <ArrowUpDown className="size-3.5 text-neutral-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "updated" | "created" | "name" | "status")}
              className="bg-transparent outline-none border-none text-xs font-bold text-neutral-850 dark:text-neutral-200 cursor-pointer"
            >
              <option value="updated">Recently Updated</option>
              <option value="created">Recently Created</option>
              <option value="name">Form Name</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Forms Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-neutral-400 font-medium">
          Loading forms repository...
        </div>
      ) : filteredAndSortedForms.length === 0 ? (
        <div className="bg-card rounded-card border border-neutral-200/80 dark:border-neutral-850 p-12 text-center space-y-4 my-8">
          <div className="size-12 rounded-xl bg-neutral-100 dark:bg-neutral-850 text-neutral-400 flex items-center justify-center mx-auto">
            <SlidersHorizontal className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-neutral-850 dark:text-neutral-150">
              No forms found
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto font-medium">
              {searchQuery
                ? `No forms match your search query "${searchQuery}".`
                : "Create your first data collection form or start from a pre-built agricultural template."}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Button onClick={handleCreateBlank} className="text-xs font-bold px-4">
              <Plus className="size-4 mr-1.5" />
              Create Blank Form
            </Button>
            <Button variant="outline" onClick={onOpenTemplates} className="text-xs font-semibold px-4">
              Start from Template
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAndSortedForms.map((form) => (
            <FormCard
              key={form.id}
              form={form}
              onEdit={onOpenBuilder}
              onDuplicate={handleDuplicate}
              onRename={(f) => setRenamingForm(f)}
              onArchive={handleArchive}
              onDelete={(f) => setDeletingForm(f)}
              onStartSubmission={(id) => {
                const target = forms.find((f) => f.id === id)
                if (target) setSubmissionTargetForm(target)
                else onStartSubmission?.(id)
              }}
              onViewSubmissions={onViewSubmissions}
            />
          ))}
        </div>
      )}

      {/* Dialog Modals */}
      <CreateFormDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSelectBlank={handleCreateBlank}
        onSelectTemplate={() => {
          setIsCreateOpen(false)
          onOpenTemplates()
        }}
      />

      <RenameFormDialog
        form={renamingForm}
        isOpen={!!renamingForm}
        onClose={() => setRenamingForm(null)}
        onConfirm={handleConfirmRename}
      />

      <DeleteFormDialog
        form={deletingForm}
        isOpen={!!deletingForm}
        onClose={() => setDeletingForm(null)}
        onConfirm={handleConfirmDelete}
      />

      <StartSubmissionModal
        isOpen={!!submissionTargetForm}
        formName={submissionTargetForm?.name || "Form"}
        onClose={() => setSubmissionTargetForm(null)}
        onStart={(farmId, fieldId) => {
          if (submissionTargetForm) {
            if (onStartSubmissionWithContext) {
              onStartSubmissionWithContext(submissionTargetForm.id, farmId, fieldId)
            } else if (onStartSubmission) {
              onStartSubmission(submissionTargetForm.id)
            }
          }
        }}
      />
    </div>
  )
}

export default FormLibraryPage;
