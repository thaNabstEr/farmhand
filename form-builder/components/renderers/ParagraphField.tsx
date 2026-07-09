import * as React from "react"
import { FieldRendererProps } from "../../types"

export function ParagraphField({ field }: FieldRendererProps) {
  return (
    <textarea
      placeholder={field.placeholder || "Enter detailed paragraph answer..."}
      disabled
      rows={3}
      className="w-full p-3 rounded-input border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/10 text-sm text-neutral-400 placeholder-neutral-300 dark:placeholder-neutral-600 cursor-not-allowed select-none outline-none resize-none font-sans"
    />
  );
}
export default ParagraphField;
