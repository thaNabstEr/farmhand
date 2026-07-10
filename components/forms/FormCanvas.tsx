"use client"

import * as React from "react"
import { CanvasEmptyState } from "./CanvasEmptyState"
import { CanvasFieldCard } from "@/form-builder/components/CanvasFieldCard"
import { useFormBuilder } from "@/form-builder/state/FormBuilderContext"
import { CanvasDropZone } from "@/form-builder/components/dnd/CanvasDropZone"
import { SortableField } from "@/form-builder/components/dnd/SortableField"
import { DropIndicator } from "@/form-builder/components/dnd/DropIndicator"
import { useDndState } from "@/form-builder/components/dnd/DndProvider"
import { useToast } from "@/components/shared/ToastProvider"

export function FormCanvas() {
  const {
    state,
    renameForm,
    updateDescription,
    removeField,
    duplicateField,
    setActiveFieldId
  } = useFormBuilder();

  const { isDragging, dropIndex } = useDndState();
  const { showToast } = useToast();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    renameForm(e.target.value);
  };

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateDescription(e.target.value);
  };

  return (
    <div
      onClick={() => setActiveFieldId(null)}
      className="flex-1 h-full overflow-y-auto bg-[#F8FAF8] dark:bg-[#090B09] p-6 sm:p-10 transition-colors duration-200 scrollbar-thin animate-fade-in"
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

        {/* Droppable Canvas Wrapper */}
        <CanvasDropZone id="canvas-dropzone" fieldIds={state.schema.fields.map((f) => f.id)}>
          {state.schema.fields.length === 0 ? (
            <CanvasEmptyState />
          ) : (
            <div className="space-y-4">
              {state.schema.fields.map((field, index) => (
                <React.Fragment key={field.id}>
                  {isDragging && dropIndex === index && <DropIndicator />}
                  <SortableField id={field.id} index={index}>
                    <CanvasFieldCard
                      field={field}
                      index={index}
                      isActive={state.activeFieldId === field.id}
                      onSelect={() => setActiveFieldId(field.id)}
                      onRemove={() => {
                        const label = field.label;
                        removeField(field.id);
                        showToast(`Deleted Field: ${label}`, "warning");
                      }}
                      onDuplicate={() => {
                        const label = field.label;
                        duplicateField(field.id);
                        showToast(`Duplicated Field: ${label}`, "success");
                      }}
                    />
                  </SortableField>
                </React.Fragment>
              ))}
              {isDragging && dropIndex === state.schema.fields.length && state.schema.fields.length > 0 && (
                <DropIndicator />
              )}
            </div>
          )}
        </CanvasDropZone>
      </div>
    </div>
  )
}
export default FormCanvas;
