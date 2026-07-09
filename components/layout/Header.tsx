"use client"

import * as React from "react"
import { Menu, Bell, HelpCircle, Sun, Moon, Search } from "lucide-react"
import { SearchBar } from "@/components/shared/SearchBar"

export interface HeaderProps {
  activePath: string;
  setMobileOpen: (open: boolean) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function Header({
  activePath,
  setMobileOpen,
  searchValue,
  onSearchChange
}: HeaderProps) {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

  // Sync theme to document element
  React.useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      setTheme("light");
    }
  };

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-background/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 transition-colors duration-200">
      {/* Left Area: Mobile Menu Trigger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-500 transition-colors"
        >
          <Menu className="size-4" />
        </button>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-neutral-400 dark:text-neutral-500 font-medium">FarmHand</span>
          <span className="text-neutral-300 dark:text-neutral-600">/</span>
          <span className="text-neutral-800 dark:text-neutral-200 font-semibold tracking-tight">
            {activePath}
          </span>
        </div>
      </div>

      {/* Middle Area: Global Search Input */}
      <div className="hidden md:flex flex-1 justify-center max-w-md mx-8">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Search projects, forms, farmers..."
        />
      </div>

      {/* Right Area: Utility Icons */}
      <div className="flex items-center gap-1.5">
        {/* Mobile Search Button (shows when screen is small) */}
        <button className="md:hidden p-2 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
          <Search className="size-4" />
        </button>

        {/* Support/Help */}
        <button className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
          <HelpCircle className="size-4" />
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
          <Bell className="size-4" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-background animate-pulse" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? (
            <Moon className="size-4 transition-transform hover:rotate-12" />
          ) : (
            <Sun className="size-4 transition-transform hover:scale-110" />
          )}
        </button>
      </div>
    </header>
  )
}
