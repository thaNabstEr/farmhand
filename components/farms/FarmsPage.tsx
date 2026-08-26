"use client"

import * as React from "react"
import {
  Farm,
  Field,
  supabaseFarmRepository,
} from "@/lib/repositories/SupabaseFarmRepository"
import { supabaseFarmerRepository, Farmer } from "@/lib/repositories/SupabaseFarmerRepository"
import { useAuth } from "@/lib/auth/AuthContext"
import { FarmList } from "./FarmList"
import { FarmDetails } from "./FarmDetails"
import { FarmModal } from "./FarmModal"
import { FieldModal } from "./FieldModal"
import { DeleteConfirmModal } from "./DeleteConfirmModal"
import { RefreshCw } from "lucide-react"

export function FarmsPage() {
  const { user, loading: authLoading } = useAuth()

  const [farms, setFarms] = React.useState<Farm[]>([])
  const [farmers, setFarmers] = React.useState<Farmer[]>([])
  const [selectedFarm, setSelectedFarm] = React.useState<Farm | null>(null)
  const [fields, setFields] = React.useState<Field[]>([])

  const [loadingFarms, setLoadingFarms] = React.useState(true)
  const [loadingFields, setLoadingFields] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Modals state
  const [farmModalOpen, setFarmModalOpen] = React.useState(false)
  const [editingFarm, setEditingFarm] = React.useState<Farm | null>(null)

  const [fieldModalOpen, setFieldModalOpen] = React.useState(false)
  const [editingField, setEditingField] = React.useState<Field | null>(null)

  const [deleteTarget, setDeleteTarget] = React.useState<{
    type: "farm" | "field"
    farm?: Farm
    field?: Field
  } | null>(null)

  // Fetch all owned farms and farmers
  const fetchFarmsAndFarmers = React.useCallback(async () => {
    if (!user) return
    setLoadingFarms(true)
    setError(null)
    try {
      const [farmsData, farmersData] = await Promise.all([
        supabaseFarmRepository.getFarms(),
        supabaseFarmerRepository.getFarmers().catch(() => []),
      ])

      setFarms(farmsData)
      setFarmers(farmersData)

      // If a farm was selected, update reference
      if (selectedFarm) {
        const updated = farmsData.find((f) => f.id === selectedFarm.id)
        if (updated) setSelectedFarm(updated)
        else setSelectedFarm(null)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    } finally {
      setLoadingFarms(false)
    }
  }, [user, selectedFarm])

  // Fetch fields when farm is selected
  const fetchFields = React.useCallback(async (farmId: string) => {
    setLoadingFields(true)
    try {
      const data = await supabaseFarmRepository.getFieldsByFarmId(farmId)
      setFields(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error("Failed to fetch fields:", msg)
    } finally {
      setLoadingFields(false)
    }
  }, [])

  React.useEffect(() => {
    if (!authLoading && user) {
      fetchFarmsAndFarmers()
    } else if (!authLoading && !user) {
      setLoadingFarms(false)
    }
  }, [authLoading, user, fetchFarmsAndFarmers])

  React.useEffect(() => {
    if (selectedFarm) {
      fetchFields(selectedFarm.id)
    } else {
      setFields([])
    }
  }, [selectedFarm, fetchFields])

  // FARM HANDLERS
  const handleCreateFarm = () => {
    setEditingFarm(null)
    setFarmModalOpen(true)
  }

  const handleEditFarm = (farm: Farm) => {
    setEditingFarm(farm)
    setFarmModalOpen(true)
  }

  const handleSaveFarm = async (name: string, description?: string, farmerId?: string | null) => {
    if (editingFarm) {
      const updated = await supabaseFarmRepository.updateFarm(editingFarm.id, name, description, farmerId)
      setFarms((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
      if (selectedFarm?.id === updated.id) {
        setSelectedFarm(updated)
      }
    } else {
      const created = await supabaseFarmRepository.createFarm(name, description, farmerId)
      setFarms((prev) => [created, ...prev])
    }
  }

  const handleDeleteFarmTrigger = (farm: Farm) => {
    setDeleteTarget({ type: "farm", farm })
  }

  // FIELD HANDLERS
  const handleAddField = () => {
    setEditingField(null)
    setFieldModalOpen(true)
  }

  const handleEditField = (field: Field) => {
    setEditingField(field)
    setFieldModalOpen(true)
  }

  const handleSaveField = async (
    name: string,
    area?: number | null,
    areaUnit: string = "hectares",
    description?: string
  ) => {
    if (!selectedFarm) return

    if (editingField) {
      const updated = await supabaseFarmRepository.updateField(
        editingField.id,
        name,
        area,
        areaUnit,
        description
      )
      setFields((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))
    } else {
      const created = await supabaseFarmRepository.createField(
        selectedFarm.id,
        name,
        area,
        areaUnit,
        description
      )
      setFields((prev) => [created, ...prev])
    }
  }

  const handleDeleteFieldTrigger = (field: Field) => {
    setDeleteTarget({ type: "field", field })
  }

  // CONFIRM DELETE HANDLER
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    if (deleteTarget.type === "farm" && deleteTarget.farm) {
      await supabaseFarmRepository.deleteFarm(deleteTarget.farm.id)
      setFarms((prev) => prev.filter((f) => f.id !== deleteTarget.farm!.id))
      if (selectedFarm?.id === deleteTarget.farm.id) {
        setSelectedFarm(null)
      }
    } else if (deleteTarget.type === "field" && deleteTarget.field) {
      await supabaseFarmRepository.deleteField(deleteTarget.field.id)
      setFields((prev) => prev.filter((f) => f.id !== deleteTarget.field!.id))
    }
  }

  if (authLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-xs text-neutral-400 font-medium">
        <RefreshCw className="size-5 animate-spin text-emerald-600 mr-2" />
        <span>Loading farm registry...</span>
      </div>
    )
  }

  return (
    <div className="w-full min-h-full">
      {selectedFarm ? (
        <FarmDetails
          farm={selectedFarm}
          fields={fields}
          loadingFields={loadingFields}
          onBack={() => setSelectedFarm(null)}
          onEditFarm={handleEditFarm}
          onDeleteFarm={handleDeleteFarmTrigger}
          onAddField={handleAddField}
          onEditField={handleEditField}
          onDeleteField={handleDeleteFieldTrigger}
        />
      ) : (
        <FarmList
          farms={farms}
          loading={loadingFarms}
          error={error}
          onCreateFarm={handleCreateFarm}
          onSelectFarm={setSelectedFarm}
        />
      )}

      {/* Farm Create/Edit Modal */}
      <FarmModal
        isOpen={farmModalOpen}
        onClose={() => setFarmModalOpen(false)}
        onSave={handleSaveFarm}
        initialData={editingFarm}
        farmers={farmers}
      />

      {/* Field Create/Edit Modal */}
      <FieldModal
        isOpen={fieldModalOpen}
        onClose={() => setFieldModalOpen(false)}
        onSave={handleSaveField}
        initialData={editingField}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.type === "farm" ? "Delete Farm" : "Delete Field"}
        itemName={deleteTarget?.farm?.name || deleteTarget?.field?.name || ""}
        itemType={deleteTarget?.type || "farm"}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
