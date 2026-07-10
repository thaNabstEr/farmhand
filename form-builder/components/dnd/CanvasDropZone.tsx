"use client"

import * as React from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"

export interface CanvasDropZoneProps {
  id: string;
  fieldIds: string[];
  children: React.ReactNode;
}

export function CanvasDropZone({ id, fieldIds, children }: CanvasDropZoneProps) {
  const { setNodeRef } = useDroppable({
    id,
    data: {
      type: "canvas-dropzone",
    },
  });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col flex-1 h-full min-h-[400px]"
    >
      <SortableContext items={fieldIds} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </div>
  )
}

export default CanvasDropZone;
