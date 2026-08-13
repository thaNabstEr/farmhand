"use client"

import * as React from "react"
import { Field } from "@/lib/repositories/SupabaseFarmRepository"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, Map, Layers } from "lucide-react"

interface FieldListProps {
  fields: Field[]
  loading: boolean
  onAddField: () => void
  onEditField: (field: Field) => void
  onDeleteField: (field: Field) => void
}

export function FieldList({
  fields,
  loading,
  onAddField,
  onEditField,
  onDeleteField,
}: FieldListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 animate-pulse space-y-3"
          >
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-2/3" />
            <div className="h-3 bg-neutral-100 dark:bg-neutral-850 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (fields.length === 0) {
    return (
      <EmptyState
        title="No fields yet"
        description="Add a field to this farm to start organising your agricultural data."
        iconName="Map"
        actionLabel="Add Field"
        onAction={onAddField}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            Fields ({fields.length})
          </h3>
        </div>
        <Button
          onClick={onAddField}
          size="sm"
          className="h-8 text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Plus className="size-3.5" />
          <span>Add Field</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map((field) => (
          <div
            key={field.id}
            className="p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-200 shadow-sm flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Map className="size-3.5" />
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {field.name}
                  </h4>
                </div>

                {field.area !== null && field.area !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/50 dark:border-neutral-800 shrink-0 font-mono">
                    {field.area} {field.area_unit || "hectares"}
                  </span>
                )}
              </div>

              {field.description ? (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed line-clamp-2">
                  {field.description}
                </p>
              ) : (
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 italic">
                  No description provided.
                </p>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
              <span className="text-[10px] text-neutral-400 font-medium">
                {new Date(field.created_at).toLocaleDateString()}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEditField(field)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Edit Field"
                >
                  <Edit2 className="size-3.5" />
                </button>
                <button
                  onClick={() => onDeleteField(field)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Delete Field"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
