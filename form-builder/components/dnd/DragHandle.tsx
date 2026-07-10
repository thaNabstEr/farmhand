"use client"

import * as React from "react"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

export const DragHandleContext = React.createContext<{
  listeners?: any;
  attributes?: any;
} | null>(null);

export interface DragHandleProps extends React.HTMLAttributes<HTMLDivElement> {
  listeners?: any;
  attributes?: any;
}

export function DragHandle({ className, listeners, attributes, ...props }: DragHandleProps) {
  const context = React.useContext(DragHandleContext);
  const activeListeners = listeners || context?.listeners;
  const activeAttributes = attributes || context?.attributes;

  return (
    <div
      {...activeAttributes}
      {...activeListeners}
      className={cn(
        "flex items-center text-neutral-300 dark:text-neutral-700 hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors shrink-0 cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800/40",
        className
      )}
      {...props}
    >
      <GripVertical className="size-4" />
    </div>
  )
}

export default DragHandle;
