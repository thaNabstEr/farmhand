import * as React from "react"
import * as Icons from "lucide-react"
import { cn } from "@/lib/utils"

export interface FieldCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  description: string;
  iconName: keyof typeof Icons;
}

export function FieldCard({
  label,
  description,
  iconName,
  className,
  ...props
}: FieldCardProps) {
  // Dynamically resolve icon component
  const IconComponent = Icons[iconName] as React.ComponentType<{ className?: string }> || Icons.HelpCircle;

  return (
    <div
      className={cn(
        "group flex gap-3 p-3 rounded-card bg-card border border-neutral-200/50 dark:border-neutral-800/30 hover:border-primary/40 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/35 cursor-pointer shadow-card transition-all duration-200 hover:shadow-hover hover:-translate-y-0.5 select-none",
        className
      )}
      {...props}
    >
      {/* Icon Wrapper */}
      <div className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/40 dark:border-neutral-800/40 text-neutral-500 dark:text-neutral-400 group-hover:bg-primary-soft group-hover:text-primary transition-colors flex items-center justify-center shrink-0 size-9">
        <IconComponent className="size-4.5 transition-transform group-hover:scale-105" />
      </div>

      {/* Label and Subtitle */}
      <div className="flex flex-col min-w-0 justify-center">
        <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-primary transition-colors truncate leading-tight">
          {label}
        </span>
        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium mt-0.5 line-clamp-1">
          {description}
        </span>
      </div>
    </div>
  )
}
export default FieldCard
