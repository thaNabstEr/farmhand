"use client"

import * as React from "react"
import {
  FarmerWithFarms,
  supabaseFarmerRepository,
} from "@/lib/repositories/SupabaseFarmerRepository"
import { useAuth } from "@/lib/auth/AuthContext"
import { FarmerList } from "./FarmerList"
import { FarmerDetails } from "./FarmerDetails"
import { FarmerModal } from "./FarmerModal"
import { DeleteConfirmModal } from "@/components/farms/DeleteConfirmModal"
import { RefreshCw } from "lucide-react"

export function FarmersPage({
  onNavigateToFarm,
}: {
  onNavigateToFarm?: (farmId: string) => void
}) {
  const { user, loading: authLoading } = useAuth()

  const [farmers, setFarmers] = React.useState<FarmerWithFarms[]>([])
  const [selectedFarmer, setSelectedFarmer] = React.useState<FarmerWithFarms | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Modals state
  const [farmerModalOpen, setFarmerModalOpen] = React.useState(false)
  const [editingFarmer, setEditingFarmer] = React.useState<FarmerWithFarms | null>(null)
  const [deletingFarmer, setDeletingFarmer] = React.useState<FarmerWithFarms | null>(null)

  // Fetch all owned farmers
  const fetchFarmers = React.useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const data = await supabaseFarmerRepository.getFarmers()
      setFarmers(data)

      // If a farmer was selected, update reference
      if (selectedFarmer) {
        const updated = data.find((f) => f.id === selectedFarmer.id)
        if (updated) setSelectedFarmer(updated)
        else setSelectedFarmer(null)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [user, selectedFarmer])

  React.useEffect(() => {
    if (!authLoading && user) {
      fetchFarmers()
    } else if (!authLoading && !user) {
      setLoading(false)
    }
  }, [authLoading, user, fetchFarmers])

  // FARMER HANDLERS
  const handleCreateFarmer = () => {
    setEditingFarmer(null)
    setFarmerModalOpen(true)
  }

  const handleEditFarmer = (farmer: FarmerWithFarms) => {
    setEditingFarmer(farmer)
    setFarmerModalOpen(true)
  }

  const handleSaveFarmer = async (payload: {
    first_name: string
    last_name: string
    phone?: string | null
    email?: string | null
    national_id?: string | null
    community?: string | null
    village?: string | null
  }) => {
    if (editingFarmer) {
      const updated = await supabaseFarmerRepository.updateFarmer(editingFarmer.id, payload)
      setFarmers((prev) =>
        prev.map((f) =>
          f.id === updated.id
            ? { ...f, ...updated, farmsCount: f.farmsCount, farms: f.farms }
            : f
        )
      )
      if (selectedFarmer?.id === updated.id) {
        setSelectedFarmer((prev) => (prev ? { ...prev, ...updated } : null))
      }
    } else {
      const created = await supabaseFarmerRepository.createFarmer(payload)
      const createdWithFarms: FarmerWithFarms = {
        ...created,
        farmsCount: 0,
        farms: [],
      }
      setFarmers((prev) => [createdWithFarms, ...prev])
    }
  }

  const handleDeleteFarmerTrigger = (farmer: FarmerWithFarms) => {
    setDeletingFarmer(farmer)
  }

  const handleConfirmDelete = async () => {
    if (!deletingFarmer) return

    await supabaseFarmerRepository.deleteFarmer(deletingFarmer.id)
    setFarmers((prev) => prev.filter((f) => f.id !== deletingFarmer.id))
    if (selectedFarmer?.id === deletingFarmer.id) {
      setSelectedFarmer(null)
    }
    setDeletingFarmer(null)
  }

  if (authLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-xs text-neutral-400 font-medium">
        <RefreshCw className="size-5 animate-spin text-emerald-600 mr-2" />
        <span>Loading farmer registry...</span>
      </div>
    )
  }

  return (
    <div className="w-full min-h-full">
      {selectedFarmer ? (
        <FarmerDetails
          farmer={selectedFarmer}
          onBack={() => setSelectedFarmer(null)}
          onEdit={handleEditFarmer}
          onDelete={handleDeleteFarmerTrigger}
          onSelectFarm={onNavigateToFarm}
        />
      ) : (
        <FarmerList
          farmers={farmers}
          loading={loading}
          error={error}
          onCreateFarmer={handleCreateFarmer}
          onSelectFarmer={setSelectedFarmer}
        />
      )}

      {/* Farmer Create/Edit Modal */}
      <FarmerModal
        isOpen={farmerModalOpen}
        onClose={() => setFarmerModalOpen(false)}
        onSave={handleSaveFarmer}
        initialData={editingFarmer}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingFarmer}
        title="Delete Farmer Profile"
        itemName={deletingFarmer ? `${deletingFarmer.first_name} ${deletingFarmer.last_name}` : ""}
        itemType="farmer"
        onClose={() => setDeletingFarmer(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export default FarmersPage
