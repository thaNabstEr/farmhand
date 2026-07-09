import * as React from "react"
import { FieldRendererProps } from "../../types"

export function TextField({ field }: FieldRendererProps) {
  return (
    <input
      type="text"
      placeholder={field.placeholder || "Enter short answer..."}
      disabled
      className="w-full h-9 px-3 rounded-input border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/10 text-sm text-neutral-400 placeholder-neutral-300 dark:placeholder-neutral-600 cursor-not-allowed select-none outline-none font-sans"
    />
  );
}
export default TextField;
