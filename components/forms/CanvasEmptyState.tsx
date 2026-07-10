import { FileSpreadsheet } from "lucide-react"

export function CanvasEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed border-neutral-200 dark:border-neutral-850 rounded-card bg-card/40 backdrop-blur-xs transition-all duration-200">
      {/* Icon Area */}
      <div className="size-14 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/40 text-neutral-450 dark:text-neutral-500 flex items-center justify-center mb-5 shadow-sm">
        <FileSpreadsheet className="size-7 animate-pulse text-primary" />
      </div>

      {/* Main Empty State Text */}
      <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
        Start Building Your Form
      </h3>
      
      <p className="mt-2.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium max-w-xs leading-relaxed">
        Drag a field from the Field Library <br />
        <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider my-1 block">or</span>
        Click the <strong className="text-primary font-bold">Add Field</strong> button above.
      </p>
    </div>
  )
}
export default CanvasEmptyState

