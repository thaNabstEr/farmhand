"use client"

import * as React from "react"
import {
  Farm,
  Field,
  supabaseFarmRepository,
} from "@/lib/repositories/SupabaseFarmRepository"
import { useAuth } from "@/lib/auth/AuthContext"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { FieldModal } from "./FieldModal"
import { DeleteConfirmModal } from "./DeleteConfirmModal"
import {
  Search,
  MapPin,
  Building2,
  Edit2,
  Trash2,
  RefreshCw,
  Plus,
  ArrowRight,
} from "lucide-react"

export interface FieldWithFarm extends Field {
  farmName: string
}

export interface FieldsListPageProps {
  onNavigateToFarm?: (farmId: string) => void
}

export function FieldsListPage({ onNavigateToFarm }: FieldsListPageProps) {
  const { user } = useAuth()
  const [fields, setFields] = React.useState<FieldWithFarm[]>([])
  const [farms, setFarms] = React.useState<Farm[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")

  // Modal states
  const [fieldModalOpen, setFieldModalOpen] = React.useState(false)
  const [editingField, setEditingField] = React.useState<Field | null>(null)
  const [selectedFarmId, setSelectedFarmId] = React.useState<string>("")
  const [deleteTarget, setDeleteTarget] = React.useState<{
    type: "field"
    field: Field
  } | null>(null)

  const loadAllFields = React.useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const farmsList = await supabaseFarmRepository.getFarms()
      setFarms(farmsList)

      const fieldPromises = farmsList.map(async (farm) => {
        try {
          const farmFields = await supabaseFarmRepository.getFieldsByFarmId(farm.id)
          return farmFields.map((f) => ({
            ...f,
            farmName: farm.name,
          }))
        } catch {
          return []
        }
      })

      const results = await Promise.all(fieldPromises)
      const allFields = results.flat()
      setFields(allFields)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load fields"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [user])

  React.useEffect(() => {
    loadAllFields()
  }, [loadAllFields])

  const filteredFields = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return fields
    return fields.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.farmName.toLowerCase().includes(q) ||
        (f.description && f.description.toLowerCase().includes(q))
    )
  }, [fields, searchQuery])

  const handleOpenAdd = () => {
    if (farms.length === 0) return
    setEditingField(null)
    setSelectedFarmId(farms[0].id)
    setFieldModalOpen(true)
  }

  const handleOpenEdit = (field: FieldWithFarm) => {
    setEditingField(field)
    setSelectedFarmId(field.farm_id)
    setFieldModalOpen(true)
  }

  const handleSaveField = async (
    name: string,
    area?: number | null,
    areaUnit?: string,
    description?: string
  ) => {
    if (editingField) {
      await supabaseFarmRepository.updateField(
        editingField.id,
        name,
        area,
        areaUnit || "hectares",
        description
      )
    } else if (selectedFarmId) {
      await supabaseFarmRepository.createField(
        selectedFarmId,
        name,
        area,
        areaUnit || "hectares",
        description
      )
    }
    setFieldModalOpen(false)
    setEditingField(null)
    await loadAllFields()
  }

  const handleDeleteField = async () => {
    if (!deleteTarget?.field) return
    await supabaseFarmRepository.deleteField(deleteTarget.field.id)
    setDeleteTarget(null)
    await loadAllFields()
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Fields Registry"
        description="Master index of all registered agricultural fields, plots, and acreage across your farms."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadAllFields}
              disabled={loading}
              className="h-9 px-3 gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            {farms.length > 0 && (
              <Button
                onClick={handleOpenAdd}
                className="h-9 px-3.5 gap-1.5 text-xs font-bold shadow-sm"
              >
                <Plus className="size-4" />
                <span>Add Field</span>
              </Button>
            )}
          </div>
        }
      />

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300 text-xs font-medium flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={loadAllFields} className="h-7 text-xs">
            Retry
          </Button>
        </div>
      )}

      {/* Search Bar */}
      {fields.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search fields by name, farm, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-card text-foreground placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-card animate-pulse space-y-3"
            >
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-2/3" />
              <div className="h-3 bg-neutral-100 dark:bg-neutral-850 rounded w-1/2" />
              <div className="h-3 bg-neutral-100 dark:bg-neutral-850 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : fields.length === 0 ? (
        <EmptyState
          title="No fields registered"
          description={
            farms.length === 0
              ? "You must register at least one farm before you can add fields."
              : "Add your first field plot to track boundaries, soil types, and crop activities."
          }
          iconName="Map"
          actionLabel={farms.length === 0 ? undefined : "Add Field"}
          onAction={farms.length === 0 ? undefined : handleOpenAdd}
        />
      ) : filteredFields.length === 0 ? (
        <div className="p-8 text-center bg-card rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-2">
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            No fields match &quot;{searchQuery}&quot;
          </p>
          <p className="text-xs text-neutral-500">
            Try adjusting your search keywords or clear the filter.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="text-xs mt-2"
          >
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFields.map((field) => (
            <div
              key={field.id}
              className="p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-card hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 shadow-xs flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                      <MapPin className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                        {field.name}
                      </h3>
                      {field.area !== null && field.area !== undefined && (
                        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                          {field.area} {field.area_unit || "hectares"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(field)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      title="Edit Field"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ type: "field", field })}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Delete Field"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {field.description && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                    {field.description}
                  </p>
                )}

                {/* Parent Farm Badge */}
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-850 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                    <Building2 className="size-3.5 text-neutral-400" />
                    <span className="font-medium truncate max-w-[150px]">
                      {field.farmName}
                    </span>
                  </div>

                  {onNavigateToFarm && (
                    <button
                      onClick={() => onNavigateToFarm(field.farm_id)}
                      className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                    >
                      <span>View Farm</span>
                      <ArrowRight className="size-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Field Create/Edit Modal */}
      <FieldModal
        isOpen={fieldModalOpen}
        onClose={() => {
          setFieldModalOpen(false)
          setEditingField(null)
        }}
        onSave={handleSaveField}
        initialData={editingField}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteField}
        title="Delete Field"
        itemName={deleteTarget?.field?.name || "Field"}
        itemType="field"
      />
    </div>
  )
}
