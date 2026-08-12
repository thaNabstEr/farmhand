"use client"

import * as React from "react"
import { ArrowLeft, Search, Sparkles, SlidersHorizontal } from "lucide-react"
import { templateRepository, TemplateDefinition } from "@/lib/templates"
import { TemplateCard } from "./TemplateCard"
import { TemplatePreviewDialog } from "./TemplatePreviewDialog"
import { Button } from "@/components/ui/button"

export interface TemplateLibraryPageProps {
  onBackToForms: () => void
  onOpenBuilder: (id: string) => void
}

export function TemplateLibraryPage({ onBackToForms, onOpenBuilder }: TemplateLibraryPageProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState<string>("All")
  const [previewTemplate, setPreviewTemplate] = React.useState<TemplateDefinition | null>(null)

  const templates = React.useMemo(() => {
    return templateRepository.getTemplates()
  }, [])

  const categories = React.useMemo(() => {
    const set = new Set<string>()
    templates.forEach((t) => set.add(t.category))
    return ["All", ...Array.from(set)]
  }, [templates])

  const filteredTemplates = React.useMemo(() => {
    return templates.filter((t) => {
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query ||
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)

      const matchesCat = categoryFilter === "All" || t.category === categoryFilter

      return matchesSearch && matchesCat
    })
  }, [templates, searchQuery, categoryFilter])

  const handleUseTemplate = async (templateId: string) => {
    setPreviewTemplate(null)
    const newForm = await templateRepository.createFromTemplate(templateId)
    onOpenBuilder(newForm.id)
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToForms}
              className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 px-2 h-7 font-semibold text-xs -ml-2"
            >
              <ArrowLeft className="size-4 mr-1" />
              <span>Back to Forms</span>
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight flex items-center gap-2">
            <span>Template Gallery</span>
            <Sparkles className="size-5 text-purple-500" />
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
            Pre-built agricultural form templates optimized for field data collection.
          </p>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-2 border-b border-neutral-200/60 dark:border-neutral-850">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search templates by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-input border border-neutral-250 dark:border-neutral-800 bg-card text-xs font-medium text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-primary/25 transition-all duration-150"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                categoryFilter === cat
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-neutral-100 dark:bg-neutral-850 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-card rounded-card border border-neutral-200/80 dark:border-neutral-850 p-12 text-center space-y-3 my-8">
          <SlidersHorizontal className="size-8 text-neutral-400 mx-auto" />
          <h3 className="text-base font-bold text-neutral-850 dark:text-neutral-150">
            No matching templates found
          </h3>
          <p className="text-xs text-neutral-400 font-medium">
            Try adjusting your search term or category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onPreview={(t) => setPreviewTemplate(t)}
              onUseTemplate={handleUseTemplate}
            />
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <TemplatePreviewDialog
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUseTemplate={handleUseTemplate}
      />
    </div>
  )
}

export default TemplateLibraryPage;
