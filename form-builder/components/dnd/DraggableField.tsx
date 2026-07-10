"use client"

import * as React from "react"
import { useDraggable } from "@dnd-kit/core"

export interface DraggableFieldProps {
  id: string;
  fieldType: string;
  children: React.ReactNode;
}

export function DraggableField({ id, fieldType, children }: DraggableFieldProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id,
    data: {
      type: "library-field",
      fieldType,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing touch-none select-none"
    >
      {children}
    </div>
  )
}

export default DraggableField;
