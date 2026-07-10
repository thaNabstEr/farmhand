"use client"

import * as React from "react"
import { DragOverlay } from "@dnd-kit/core"
import { FieldCard } from "@/components/forms/FieldCard"
import { CanvasFieldCard } from "@/form-builder/components/CanvasFieldCard"
import { mockFieldLibrary } from "@/data/mock/fields"
import { useFormBuilder } from "@/form-builder/state/FormBuilderContext"

interface FieldDragOverlayProps {
  activeId: string | null;
  activeType: string | null;
}

export function FieldDragOverlay({ activeId, activeType }: FieldDragOverlayProps) {
  const { state } = useFormBuilder();

  if (!activeId) return null;

  let content = null;

  if (activeType === "library-field") {
    const fieldDef = mockFieldLibrary.find((f) => f.id === activeId);
    if (fieldDef) {
      content = (
        <div className="w-80 shadow-lg border border-primary/30 rounded-card opacity-90 scale-95 bg-card">
          <FieldCard
            label={fieldDef.label}
            description={fieldDef.description}
            iconName={fieldDef.iconName}
          />
        </div>
      );
    }
  } else if (activeType === "canvas-field") {
    const field = state.schema.fields.find((f) => f.id === activeId);
    if (field) {
      content = (
        <div className="w-[600px] max-w-full shadow-lg border border-primary/30 rounded-card opacity-90 scale-95 bg-card select-none">
          <CanvasFieldCard
            field={field}
            index={0}
            isActive={false}
            onSelect={() => {}}
            onRemove={() => {}}
            onDuplicate={() => {}}
          />
        </div>
      );
    }
  }

  return (
    <DragOverlay 
      adjustScale={false} 
      dropAnimation={{ 
        duration: 150, 
        easing: "cubic-bezier(0.25, 1, 0.5, 1)" 
      }}
    >
      {content}
    </DragOverlay>
  );
}

export default FieldDragOverlay;
