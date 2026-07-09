import * as React from "react"
import { fieldRegistry } from "../registry"
import { Field } from "../types"

export interface FieldRendererProps {
  field: Field;
}

export function FieldRenderer({ field }: FieldRendererProps) {
  const Renderer = fieldRegistry[field.type];

  if (!Renderer) {
    return (
      <div className="p-3 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-button bg-neutral-50/20 dark:bg-neutral-900/5 text-xs text-neutral-400 dark:text-neutral-500 font-medium select-none">
        Visual preview coming soon for field type: <span className="font-mono text-primary font-bold">{field.type}</span>
      </div>
    );
  }

  return <Renderer field={field} />;
}
export default FieldRenderer;
