"use client"

import * as React from "react"
import { CanvasEmptyState } from "./CanvasEmptyState"

export interface FormCanvasProps {
  onAddField?: () => void;
  formTitle?: string;
  onFormTitleChange?: (title: string) => void;
}

export function FormCanvas({
  onAddField,
  formTitle: initialTitle = "Untitled Form",
  onFormTitleChange
}: FormCanvasProps) {
  const [title, setTitle] = React.useState(initialTitle);
  const [description, setDescription] = React.useState("");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    onFormTitleChange?.(val);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#F8FAF8] dark:bg-[#0D0F0D] p-6 sm:p-10 transition-colors duration-200 scrollbar-thin">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Form Details Area (Paper Sheet Header) */}
        <div className="bg-card rounded-card border border-neutral-200/50 dark:border-neutral-800/35 p-8 shadow-card space-y-4">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Form Title"
            className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 bg-transparent border-none outline-none focus:ring-1 focus:ring-primary/45 rounded-md w-full py-1"
          />
          
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add description or instructions for field operators..."
            className="text-sm text-neutral-500 dark:text-neutral-400 bg-transparent border-none outline-none focus:ring-1 focus:ring-primary/45 rounded-md w-full resize-none h-16 py-1 font-medium leading-relaxed"
          />
        </div>

        {/* Empty Form Canvas Area */}
        <CanvasEmptyState onAddField={onAddField} />
      </div>
    </div>
  )
}
export default FormCanvas
