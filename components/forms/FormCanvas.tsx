"use client"

import * as React from "react"
import { CanvasEmptyState } from "./CanvasEmptyState"
import { CanvasFieldCard } from "@/form-builder/components/CanvasFieldCard"
import { useFormBuilder } from "@/form-builder/state/FormBuilderContext"

export function FormCanvas() {
  const {
    state,
    renameForm,
    updateDescription,
    addField,
    removeField,
    duplicateField,
    setActiveFieldId
  } = useFormBuilder();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    renameForm(e.target.value);
  };

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateDescription(e.target.value);
  };

  return (
    <div
      onClick={() => setActiveFieldId(null)}
      className="flex-1 h-full overflow-y-auto bg-[#F8FAF8] dark:bg-[#090B09] p-6 sm:p-10 transition-colors duration-200 scrollbar-thin"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Form Details Area (Paper Sheet Header) */}
        <div className="bg-card rounded-card border border-neutral-200/50 dark:border-neutral-850 p-8 shadow-card space-y-4">
          <input
            type="text"
            value={state.schema.name}
            onChange={handleTitleChange}
            placeholder="Form Title"
            className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 bg-transparent border-none outline-none focus:ring-1 focus:ring-primary/45 rounded-md w-full py-1"
          />
          
          <textarea
            value={state.schema.description}
            onChange={handleDescChange}
            placeholder="Add description or instructions for field operators..."
            className="text-sm text-neutral-500 dark:text-neutral-400 bg-transparent border-none outline-none focus:ring-1 focus:ring-primary/45 rounded-md w-full resize-none h-16 py-1 font-medium leading-relaxed"
          />
        </div>

        {/* Dynamic Fields List or Empty State */}
        {state.schema.fields.length === 0 ? (
          <CanvasEmptyState onAddField={() => addField("text")} />
        ) : (
          <div className="space-y-4">
            {state.schema.fields.map((field, index) => (
              <CanvasFieldCard
                key={field.id}
                field={field}
                index={index}
                isActive={state.activeFieldId === field.id}
                onSelect={() => setActiveFieldId(field.id)}
                onRemove={() => removeField(field.id)}
                onDuplicate={() => duplicateField(field.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
export default FormCanvas;
