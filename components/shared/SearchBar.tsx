"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  showShortcut?: boolean;
}

export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  showShortcut = true,
  className,
  ...props
}: SearchBarProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Handle shortcut registration (optional visual effect, focus on key press)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleClear = () => {
    onChange("");
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        "relative flex items-center w-full max-w-md h-9 rounded-input border border-neutral-200 dark:border-neutral-800/80 bg-card px-3 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/70",
        className
      )}
    >
      <Search className="size-4 text-neutral-400 dark:text-neutral-500 mr-2 shrink-0" />
      
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-full bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 outline-none border-none py-2"
        {...props}
      />

      {value ? (
        <button
          type="button"
          onClick={handleClear}
          className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <X className="size-3.5" />
        </button>
      ) : (
        showShortcut && (
          <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 px-1.5 font-mono text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
            <span className="text-[10px]">⌘</span>K
          </kbd>
        )
      )}
    </div>
  )
}
