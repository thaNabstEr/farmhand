"use client"

import * as React from "react"
import { Eye, ArrowRight, FileText } from "lucide-react"
import { TemplateDefinition } from "@/lib/templates"
import { Button } from "@/components/ui/button"

export interface TemplateCardProps {
  template: TemplateDefinition
  onPreview: (template: TemplateDefinition) => void
  onUseTemplate: (templateId: string) => void
}

export function TemplateCard({ template, onPreview, onUseTemplate }: TemplateCardProps) {
  return (
    <div className="bg-card rounded-card border border-neutral-200/80 dark:border-neutral-850 p-6 shadow-card hover:shadow-hover hover:border-neutral-300 dark:hover:border-neutral-750 transition-all duration-200 flex flex-col justify-between space-y-5 select-none group">
      <div className="space-y-3">
        {/* Header: Category Badge + Field Count */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 uppercase tracking-wider">
            {template.category}
          </span>

          <div className="flex items-center gap-1 text-[11px] font-medium text-neutral-400">
            <FileText className="size-3.5" />
            <span>{template.fieldCount} fields</span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-50 group-hover:text-primary transition-colors tracking-tight">
            {template.name}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed line-clamp-3">
            {template.description}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-neutral-100 dark:border-neutral-850 flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPreview(template)}
          className="h-8 text-xs font-semibold gap-1.5 px-3 border-neutral-200/80 dark:border-neutral-800"
        >
          <Eye className="size-3.5" />
          <span>Preview</span>
        </Button>

        <Button
          size="sm"
          onClick={() => onUseTemplate(template.id)}
          className="h-8 text-xs font-bold gap-1.5 px-3.5"
        >
          <span>Use Template</span>
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

export default TemplateCard;
