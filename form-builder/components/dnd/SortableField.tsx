"use client"

import * as React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DragHandleContext } from "./DragHandle"

export interface SortableFieldProps {
  id: string;
  index: number;
  children: React.ReactNode;
}

export function SortableField({ id, index, children }: SortableFieldProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      type: "canvas-field",
      index,
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    opacity: isDragging ? 0.3 : undefined,
  };

  const contextValue = React.useMemo(() => ({ listeners, attributes }), [listeners, attributes]);

  return (
    <div ref={setNodeRef} style={style} className="relative outline-none">
      <DragHandleContext.Provider value={contextValue}>
        {children}
      </DragHandleContext.Provider>
    </div>
  )
}

export default SortableField;
