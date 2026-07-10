"use client"

import * as React from "react"
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  DragCancelEvent,
} from "@dnd-kit/core"
import { useFormBuilder } from "@/form-builder/state/FormBuilderContext"
import { FieldType } from "@/form-builder/types"
import { useToast } from "@/components/shared/ToastProvider"
import { FieldDragOverlay } from "./FieldDragOverlay"

export interface DndContextValue {
  isDragging: boolean;
  activeId: string | null;
  activeType: "library-field" | "canvas-field" | null;
  overId: string | null;
  dropIndex: number | null;
}

export const DndStateContext = React.createContext<DndContextValue | null>(null);

export function useDndState() {
  const context = React.useContext(DndStateContext);
  if (!context) {
    throw new Error("useDndState must be used within a DndProvider");
  }
  return context;
}

const getMidpointComparison = (active: any, over: any) => {
  const activeRect = active.rect.current.translated;
  const overRect = over.rect;
  if (!activeRect || !overRect) return true;
  const activeCenterY = activeRect.top + activeRect.height / 2;
  const overCenterY = overRect.top + overRect.height / 2;
  return activeCenterY < overCenterY;
};

export function DndProvider({ children }: { children: React.ReactNode }) {
  const { state, createField, moveField } = useFormBuilder();
  const { showToast } = useToast();
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [activeType, setActiveType] = React.useState<"library-field" | "canvas-field" | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);
  const [dropIndex, setDropIndex] = React.useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    const type = event.active.data.current?.type as "library-field" | "canvas-field";
    setActiveId(id);
    setActiveType(type);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      setOverId(null);
      setDropIndex(null);
      return;
    }

    const currentOverId = over.id as string;
    setOverId(currentOverId);

    const fields = state.schema.fields;

    if (activeType === "library-field") {
      if (currentOverId === "canvas-dropzone") {
        setDropIndex(fields.length);
      } else {
        const overIndex = fields.findIndex((f) => f.id === currentOverId);
        if (overIndex !== -1) {
          const isBefore = getMidpointComparison(active, over);
          setDropIndex(isBefore ? overIndex : overIndex + 1);
        }
      }
    } else if (activeType === "canvas-field") {
      const activeIndex = fields.findIndex((f) => f.id === active.id);
      const overIndex = fields.findIndex((f) => f.id === currentOverId);

      if (activeIndex !== -1 && overIndex !== -1) {
        if (activeIndex === overIndex) {
          setDropIndex(null);
        } else {
          const isBefore = getMidpointComparison(active, over);
          const targetIndex = isBefore ? overIndex : overIndex + 1;
          
          if (targetIndex === activeIndex || targetIndex === activeIndex + 1) {
            setDropIndex(null);
          } else {
            setDropIndex(targetIndex);
          }
        }
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over) {
      const fields = state.schema.fields;

      if (activeType === "library-field") {
        const fieldType = active.data.current?.fieldType as FieldType;
        const targetIndex = dropIndex !== null ? dropIndex : fields.length;
        const created = createField(fieldType, targetIndex);
        showToast(`Added Field: ${created.label}`, "success");
      } else if (activeType === "canvas-field") {
        const activeIndex = fields.findIndex((f) => f.id === active.id);
        const overIndex = fields.findIndex((f) => f.id === over.id);

        if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
          const isBefore = getMidpointComparison(active, over);
          // If we drag a field over another, we move it to overIndex, or adjusted index
          let targetIndex = overIndex;
          // If we are moving down and dropping after the over element, targetIndex remains overIndex
          // If we are moving up and dropping before the over element, targetIndex remains overIndex
          if (activeIndex < overIndex && isBefore) {
            targetIndex = overIndex - 1;
          } else if (activeIndex > overIndex && !isBefore) {
            targetIndex = overIndex + 1;
          }
          moveField(activeIndex, targetIndex);
        }
      }
    }

    // Reset drag states
    setActiveId(null);
    setActiveType(null);
    setOverId(null);
    setDropIndex(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setActiveType(null);
    setOverId(null);
    setDropIndex(null);
  };

  const contextValue = React.useMemo(
    () => ({
      isDragging: activeId !== null,
      activeId,
      activeType,
      overId,
      dropIndex,
    }),
    [activeId, activeType, overId, dropIndex]
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <DndStateContext.Provider value={contextValue}>
        {children}
        <FieldDragOverlay activeId={activeId} activeType={activeType} />
      </DndStateContext.Provider>
    </DndContext>
  );
}

export default DndProvider;
