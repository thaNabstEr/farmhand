"use client"

import * as React from "react"
import { FarmerWithFarms } from "@/lib/repositories/SupabaseFarmerRepository"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { SearchBar } from "@/components/shared/SearchBar"
import { SupabaseStatusBadge } from "@/components/shared/SupabaseStatusBadge"
import { Button } from "@/components/ui/button"
import { Plus, User, Phone, Mail, MapPin, ArrowRight, AlertCircle, Building2 } from "lucide-react"

interface FarmerListProps {
  farmers: FarmerWithFarms[]
  loading: boolean
  error: string | null
  onCreateFarmer: () => void
  onSelectFarmer: (farmer: FarmerWithFarms) => void
}

export function FarmerList({
  farmers,
  loading,
  error,
  onCreateFarmer,
  onSelectFarmer,
}: FarmerListProps) {
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredFarmers = React.useMemo(() => {
    if (!searchQuery.trim()) return farmers
    const q = searchQuery.toLowerCase().trim()
    return farmers.filter((f) => {
      const fullName = `${f.first_name} ${f.last_name}`.toLowerCase()
      const phone = f.phone?.toLowerCase() || ""
      const email = f.email?.toLowerCase() || ""
      const natId = f.national_id?.toLowerCase() || ""
      const loc = `${f.community || ""} ${f.village || ""}`.toLowerCase()
      return (
        fullName.includes(q) ||
        phone.includes(q) ||
        email.includes(q) ||
        natId.includes(q) ||
        loc.includes(q)
      )
    })
  }, [farmers, searchQuery])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Farmer Registry"
        description="Manage registered agricultural producers, grower profiles, and contact records persisted in Supabase."
        actions={
          <div className="flex items-center gap-2">
            <SupabaseStatusBadge />
            <Button
              onClick={onCreateFarmer}
              className="shadow-sm font-bold text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="size-4" />
              <span>Register Farmer</span>
            </Button>
          </div>
        }
      />

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      {farmers.length > 0 && (
        <div className="max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search farmers by name, phone, email, village..."
          />
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 animate-pulse space-y-4"
            >
              <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
              <div className="h-3 bg-neutral-100 dark:bg-neutral-850 rounded w-3/4" />
              <div className="h-3 bg-neutral-100 dark:bg-neutral-850 rounded w-1/3 pt-4" />
            </div>
          ))}
        </div>
      ) : farmers.length === 0 ? (
        /* Real Empty State */
        <EmptyState
          title="No farmers registered yet."
          description="Create your first farmer to start building your agricultural registry."
          iconName="User"
          actionLabel="Create Farmer"
          onAction={onCreateFarmer}
        />
      ) : filteredFarmers.length === 0 ? (
        /* Filtered Search Empty State */
        <div className="p-8 text-center text-xs text-neutral-400 font-medium bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          No farmers matching &quot;{searchQuery}&quot; found.
        </div>
      ) : (
        /* Farmers Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFarmers.map((farmer) => {
            const fullName = `${farmer.first_name} ${farmer.last_name}`
            const location = [farmer.village, farmer.community].filter(Boolean).join(", ")

            return (
              <div
                key={farmer.id}
                onClick={() => onSelectFarmer(farmer)}
                className="p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-200 cursor-pointer shadow-sm flex flex-col justify-between space-y-4 group select-none"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                        <User className="size-4" />
                      </div>
                      <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                        {fullName}
                      </h3>
                    </div>
                    <ArrowRight className="size-4 text-neutral-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>

                  {/* Metadata rows */}
                  <div className="space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {farmer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="size-3 text-neutral-400 shrink-0" />
                        <span className="truncate">{farmer.phone}</span>
                      </div>
                    )}
                    {farmer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="size-3 text-neutral-400 shrink-0" />
                        <span className="truncate">{farmer.email}</span>
                      </div>
                    )}
                    {location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="size-3 text-neutral-400 shrink-0" />
                        <span className="truncate">{location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer bar */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-850 text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-medium">
                    <Building2 className="size-3 text-emerald-600" />
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                      {farmer.farmsCount || 0} {farmer.farmsCount === 1 ? "Farm" : "Farms"}
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                    View Profile &rarr;
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
