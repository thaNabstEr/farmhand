import * as React from "react"
import { Mail } from "lucide-react"
import { FieldRendererProps } from "../../types"

export function EmailField({ field }: FieldRendererProps) {
  return (
    <div className="relative flex items-center w-full h-9">
      <Mail className="absolute left-3 size-4 text-neutral-400 dark:text-neutral-500 shrink-0 pointer-events-none" />
      <input
        type="email"
        placeholder={field.placeholder || "you@example.com"}
        disabled
        className="w-full h-full pl-9 pr-3 rounded-input border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/10 text-sm text-neutral-400 placeholder-neutral-300 dark:placeholder-neutral-600 cursor-not-allowed select-none outline-none font-sans"
      />
    </div>
  );
}
export default EmailField;
