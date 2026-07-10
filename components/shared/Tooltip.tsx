"use client"

import * as React from "react"

export interface TooltipProps {
  content: string;
  shortcut?: string;
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
}

export function Tooltip({ content, shortcut, children }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  // Clone child to append focus/blur event handlers for keyboard accessibility
  const trigger = React.cloneElement(children, {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      setIsVisible(true);
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      setIsVisible(false);
      children.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      setIsVisible(true);
      children.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      setIsVisible(false);
      children.props.onBlur?.(e);
    },
  } as React.HTMLAttributes<HTMLElement>);

  return (
    <div className="relative inline-flex items-center justify-center">
      {trigger}
      {isVisible && (
        <div
          role="tooltip"
          className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2.5 py-1.5 bg-neutral-900/95 dark:bg-neutral-800 text-white rounded-md shadow-md text-[10px] font-semibold tracking-wide whitespace-nowrap z-50 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150 select-none pointer-events-none border border-neutral-800 dark:border-neutral-700"
        >
          <span>{content}</span>
          {shortcut && (
            <kbd className="bg-neutral-800 dark:bg-neutral-750 text-neutral-350 dark:text-neutral-450 px-1 py-0.5 rounded font-mono text-[9px] uppercase tracking-normal">
              {shortcut}
            </kbd>
          )}
        </div>
      )}
    </div>
  );
}

export default Tooltip;
