"use client"

import * as React from "react"
import { Farm } from "@/lib/repositories/SupabaseFarmRepository"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { SearchBar } from "@/components/shared/SearchBar"
import { SupabaseStatusBadge } from "@/components/shared/SupabaseStatusBadge"
import { Button } from "@/components/ui/button"
import { Plus, MapPin, ArrowRight, Calendar, AlertCircle } from "lucide-react"

interface FarmListProps {
  farms: Farm[]
  loading: boolean
  error: string | null
  onCreateFarm: () => void
  onSelectFarm: (farm: Farm) => void
}

export function FarmList({
  farms,
  loading,
  error,
  onCreateFarm,
  onSelectFarm,
}: FarmListProps) {
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredFarms = React.useMemo(() => {
    if (!searchQuery.trim()) return farms
    const query = searchQuery.toLowerCase()
    return farms.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        (f.description && f.description.toLowerCase().includes(query))
    )
  }, [farms, searchQuery])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Farm Registry"
        description="Manage your agricultural property locations, boundaries, and fields persisted in Supabase."
        actions={
          <div className="flex items-center gap-2">
            <SupabaseStatusBadge />
            <Button
              onClick={onCreateFarm}
              className="shadow-sm font-bold text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="size-4" />
              <span>Create Farm</span>
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

      {/* Search Bar & Controls */}
      {farms.length > 0 && (
        <div className="max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search farms by name or description..."
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
      ) : farms.length === 0 ? (
        /* Empty State */
        <EmptyState
          title="No farms yet"
          description="Create your first farm to get started managing fields and inspections."
          iconName="Map"
          actionLabel="Create Farm"
          onAction={onCreateFarm}
        />
      ) : filteredFarms.length === 0 ? (
        /* Filtered Search Empty State */
        <div className="p-8 text-center text-xs text-neutral-400 font-medium bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          No farms matching &quot;{searchQuery}&quot; found.
        </div>
      ) : (
        /* Farms Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFarms.map((farm) => (
            <div
              key={farm.id}
              onClick={() => onSelectFarm(farm)}
              className="p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-200 cursor-pointer shadow-sm flex flex-col justify-between space-y-4 group select-none"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                      <MapPin className="size-4" />
                    </div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {farm.name}
                    </h3>
                  </div>
                  <ArrowRight className="size-4 text-neutral-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </div>

                {farm.description ? (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-2">
                    {farm.description}
                  </p>
                ) : (
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 italic">
                    No description provided.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-850 text-xs">
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-medium">
                  <Calendar className="size-3" />
                  <span>Created {new Date(farm.created_at).toLocaleDateString()}</span>
                </div>

                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                  View Fields &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
