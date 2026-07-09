import * as React from "react"
import * as Icons from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  iconName?: keyof typeof Icons;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  iconName = "Inbox",
  actionLabel,
  onAction,
  className,
  ...props
}: EmptyStateProps) {
  const IconComponent = Icons[iconName] as React.ComponentType<{ className?: string }> || Icons.Inbox;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-card border-2 border-dashed border-neutral-200 dark:border-neutral-800 bg-card/30 backdrop-blur-sm transition-all duration-200",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center size-12 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/50 text-neutral-400 dark:text-neutral-500 mb-4 shadow-sm">
        <IconComponent className="size-6 animate-pulse" />
      </div>

      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
        {title}
      </h3>
      
      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <div className="mt-6">
          <Button onClick={onAction} variant="outline" size="sm" className="shadow-sm">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  )
}
