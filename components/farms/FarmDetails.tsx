"use client"

import * as React from "react"
import { Farm, Field } from "@/lib/repositories/SupabaseFarmRepository"
import { FieldList } from "./FieldList"
import { MetricCard } from "@/components/shared/MetricCard"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit2, Trash2, Calendar, MapPin } from "lucide-react"

interface FarmDetailsProps {
  farm: Farm
  fields: Field[]
  loadingFields: boolean
  onBack: () => void
  onEditFarm: (farm: Farm) => void
  onDeleteFarm: (farm: Farm) => void
  onAddField: () => void
  onEditField: (field: Field) => void
  onDeleteField: (field: Field) => void
}

export function FarmDetails({
  farm,
  fields,
  loadingFields,
  onBack,
  onEditFarm,
  onDeleteFarm,
  onAddField,
  onEditField,
  onDeleteField,
}: FarmDetailsProps) {
  // Calculate total area
  const totalArea = React.useMemo(() => {
    return fields.reduce((sum, f) => sum + (f.area || 0), 0)
  }, [fields])

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to All Farms</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => onEditFarm(farm)}
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold gap-1.5 border-neutral-200 dark:border-neutral-800"
          >
            <Edit2 className="size-3.5" />
            <span>Edit Farm</span>
          </Button>
          <Button
            onClick={() => onDeleteFarm(farm)}
            variant="outline"
            size="sm"
            className="h-8 text-xs font-semibold gap-1.5 border-red-200 dark:border-red-900/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
          >
            <Trash2 className="size-3.5" />
            <span>Delete Farm</span>
          </Button>
        </div>
      </div>

      {/* Farm Main Header */}
      <div className="p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <MapPin className="size-5" />
              </div>
              <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                {farm.name}
              </h1>
            </div>
            {farm.description && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed pt-1">
                {farm.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium shrink-0 pt-1">
            <Calendar className="size-3.5" />
            <span>Created {new Date(farm.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Total Fields"
          value={fields.length.toString()}
          change="Registered"
          changeType="increase"
          iconName="Layers"
          status="info"
          description="Fields registered inside this farm"
        />
        <MetricCard
          title="Total Farm Area"
          value={`${totalArea.toFixed(1)} ha`}
          change="Calculated"
          changeType="increase"
          iconName="Map"
          status="success"
          description="Calculated sum of field areas"
        />
        <MetricCard
          title="Owner Status"
          value="Authenticated"
          change="RLS Protected"
          changeType="increase"
          iconName="User"
          status="success"
          description="Protected by Supabase RLS policies"
        />
      </div>

      {/* Field List Container */}
      <FieldList
        fields={fields}
        loading={loadingFields}
        onAddField={onAddField}
        onEditField={onEditField}
        onDeleteField={onDeleteField}
      />
    </div>
  )
}
