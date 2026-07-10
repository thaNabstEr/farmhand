"use client"

import * as React from "react"
import { Plus, Search } from "lucide-react"
import * as Icons from "lucide-react"
import { useFormBuilder } from "@/form-builder/state/FormBuilderContext"
import { useToast } from "@/components/shared/ToastProvider"
import { mockFieldLibrary, FieldDefinition } from "@/data/mock/fields"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip } from "@/components/shared/Tooltip"
import { FieldType } from "@/form-builder/types"

const categoriesOrder = ["Basic", "Choices", "Media", "Location", "Advanced"] as const

export function AddFieldDropdown() {
  const { state, createField, setIsAddFieldOpen } = useFormBuilder()
  const { showToast } = useToast()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeIndex, setActiveIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Filter fields based on search query
  const filteredFields = React.useMemo(() => {
    return mockFieldLibrary.filter(
      (field) =>
        field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        field.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        field.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  // Flat list of filtered fields ordered by category for keyboard navigation
  const flatOrderedFiltered = React.useMemo(() => {
    const result: FieldDefinition[] = []
    categoriesOrder.forEach((cat) => {
      const catFields = filteredFields.filter((f) => f.category === cat)
      result.push(...catFields)
    })
    return result
  }, [filteredFields])

  // Reset active index when query changes
  React.useEffect(() => {
    setActiveIndex(0)
  }, [searchQuery])

  // Focus input when dropdown opens
  React.useEffect(() => {
    if (state.isAddFieldOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [state.isAddFieldOpen])

  const handleSelectField = (fieldId: string) => {
    const created = createField(fieldId as FieldType)
    setIsAddFieldOpen(false)
    setSearchQuery("")
    showToast(`Added Field: ${created.label}`, "success")
  }


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((prev) => Math.min(prev + 1, flatOrderedFiltered.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const activeField = flatOrderedFiltered[activeIndex]
      if (activeField) {
        handleSelectField(activeField.id)
      }
    } else if (e.key === "Escape") {
      e.preventDefault()
      setIsAddFieldOpen(false)
      setSearchQuery("")
    }
  }

  return (
    <div className="relative">
      {/* Toggle button */}
      <Tooltip content="Add a new field" shortcut="A">
        <Button
          onClick={() => setIsAddFieldOpen(!state.isAddFieldOpen)}
          className="shadow-sm font-semibold h-8 gap-1.5 px-3"
        >
          <Plus className="size-4" />
          <span>Add Field</span>
        </Button>
      </Tooltip>

      {state.isAddFieldOpen && (
        <>
          {/* Transparent click-outside overlay */}
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => {
              setIsAddFieldOpen(false)
              setSearchQuery("")
            }}
          />

          {/* Dropdown Container */}
          <div
            onKeyDown={handleKeyDown}
            className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 max-h-[360px] flex flex-col rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-card shadow-lg z-50 text-neutral-800 dark:text-neutral-200 text-xs font-semibold overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
          >
            {/* Search Input Box */}
            <div className="flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 px-2.5 py-2">
              <Search className="size-3.5 text-neutral-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search field types..."
                className="w-full bg-transparent outline-none border-none text-xs font-medium text-neutral-800 dark:text-neutral-100 placeholder-neutral-400"
              />
            </div>

            {/* Fields List */}
            <div className="flex-1 overflow-y-auto py-1.5 max-h-[300px] scrollbar-thin">
              {flatOrderedFiltered.length === 0 ? (
                <div className="text-center py-6 text-[11px] text-neutral-400 font-medium">
                  No matching field types
                </div>
              ) : (
                categoriesOrder.map((category) => {
                  const categoryFields = flatOrderedFiltered.filter((f) => f.category === category)
                  if (categoryFields.length === 0) return null

                  return (
                    <div key={category} className="space-y-0.5">
                      {/* Category Title Header */}
                      <div className="text-[10px] uppercase font-bold text-neutral-400 dark:text-neutral-500 tracking-wider px-3 py-1.5 pt-2">
                        {category}
                      </div>

                      {/* Category Items */}
                      {categoryFields.map((field) => {
                        const IconComponent =
                          (Icons[field.iconName] as React.ComponentType<{ className?: string }>) ||
                          Icons.HelpCircle

                        const flatIndex = flatOrderedFiltered.findIndex((f) => f.id === field.id)
                        const isHighlighted = flatIndex === activeIndex

                        return (
                          <button
                            key={field.id}
                            onClick={() => handleSelectField(field.id)}
                            onMouseEnter={() => setActiveIndex(flatIndex)}
                            className={cn(
                              "w-full flex items-center gap-2.5 px-3 py-1.5 transition-all text-left group",
                              isHighlighted
                                ? "bg-primary/10 dark:bg-primary/15 text-primary border-l-2 border-primary pl-2.5 font-bold"
                                : "hover:bg-neutral-50 dark:hover:bg-neutral-900/60 font-medium"
                            )}
                          >
                            <div
                              className={cn(
                                "p-1 rounded bg-neutral-50 dark:bg-neutral-900 border transition-colors shrink-0",
                                isHighlighted
                                  ? "bg-primary-soft dark:bg-primary-soft/10 text-primary border-primary/20"
                                  : "border-neutral-200/40 dark:border-neutral-800/40 text-neutral-400 group-hover:bg-primary-soft group-hover:text-primary group-hover:border-primary/20"
                              )}
                            >
                              <IconComponent className="size-3.5" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="truncate leading-tight text-neutral-850 dark:text-neutral-150">
                                {field.label}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AddFieldDropdown;
