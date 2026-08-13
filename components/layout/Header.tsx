"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Menu, Bell, HelpCircle, Sun, Moon, Search, LogOut, Loader2 } from "lucide-react"
import { SearchBar } from "@/components/shared/SearchBar"
import { useAuth } from "@/lib/auth/AuthContext"

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
  const router = useRouter();
  const { signOut } = useAuth();
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [signingOut, setSigningOut] = React.useState(false);

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

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      router.replace("/login");
    } catch {
      // Safe fallback redirecting to /login
      router.replace("/login");
    } finally {
      setSigningOut(false);
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
      <div className="flex items-center gap-1.5 sm:gap-2">
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

        {/* Vertical Divider */}
        <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 mx-1 hidden sm:block" />

        {/* Visible Sign Out Button */}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          title="Sign Out of FarmHand"
        >
          {signingOut ? (
            <Loader2 className="size-3.5 animate-spin text-neutral-500" />
          ) : (
            <LogOut className="size-3.5 text-neutral-500 hover:text-red-600 dark:hover:text-red-400" />
          )}
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  )
}
