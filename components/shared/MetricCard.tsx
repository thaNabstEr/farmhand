import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "./Card"
import * as Icons from "lucide-react"

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string;
  change: string;
  changeType?: "increase" | "decrease" | "neutral";
  iconName: keyof typeof Icons;
  status?: "success" | "warning" | "error" | "info";
  description?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  iconName,
  status = "info",
  description,
  className,
  ...props
}: MetricCardProps) {
  // Dynamically resolve the Lucide Icon component
  const IconComponent = Icons[iconName] as React.ComponentType<{ className?: string }> || Icons.HelpCircle;

  // Semantic styles for status badges/icons
  const statusConfig = {
    success: {
      text: "text-success",
      bg: "bg-success/10",
      border: "border-success/20",
    },
    warning: {
      text: "text-warning",
      bg: "bg-warning/10",
      border: "border-warning/20",
    },
    error: {
      text: "text-error",
      bg: "bg-error/10",
      border: "border-error/20",
    },
    info: {
      text: "text-info",
      bg: "bg-info/10",
      border: "border-info/20",
    },
  };

  const changeColors = {
    increase: "text-success dark:text-green-400",
    decrease: "text-error dark:text-red-400",
    neutral: "text-neutral-500 dark:text-neutral-400",
  };

  return (
    <Card className={cn("p-6", className)} {...props}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {title}
        </span>
        <div
          className={cn(
            "p-2 rounded-[10px] border flex items-center justify-center transition-colors",
            statusConfig[status].bg,
            statusConfig[status].text,
            statusConfig[status].border
          )}
        >
          <IconComponent className="size-4" />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          {value}
        </h3>
        
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span className={cn("font-medium", changeColors[changeType])}>
            {change}
          </span>
          {description && (
            <span className="text-neutral-400 dark:text-neutral-500">
              — {description}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}
