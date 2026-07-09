import { Plus, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface CanvasEmptyStateProps {
  onAddField?: () => void;
}

export function CanvasEmptyState({ onAddField }: CanvasEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 border-2 border-dashed border-neutral-200 dark:border-neutral-800/80 rounded-card bg-card/40 backdrop-blur-sm transition-all duration-200">
      {/* Icon Area */}
      <div className="size-14 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/40 text-neutral-400 dark:text-neutral-500 flex items-center justify-center mb-5 shadow-sm">
        <FileSpreadsheet className="size-7 animate-pulse" />
      </div>

      {/* Main Empty State Text */}
      <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
        Start Building Your Form
      </h3>
      
      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium max-w-xs leading-relaxed">
        Choose a field from the left library panel or click the button below to add your first form input block.
      </p>

      {/* Call to Action button */}
      <div className="mt-6">
        <Button onClick={onAddField} className="shadow-sm">
          <Plus className="size-4 mr-1.5" />
          Add Field
        </Button>
      </div>
    </div>
  )
}
export default CanvasEmptyState
