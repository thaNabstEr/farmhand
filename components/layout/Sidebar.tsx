"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Folder,
  FileSpreadsheet,
  Inbox,
  BookOpen,
  User,
  MapPin,
  Map,
  BarChart3,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  LogOut
} from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  activePath?: string;
  onNavigate?: (path: string) => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: { name: string; path: string; icon: React.ComponentType<{ className?: string }> }[];
}

export function Sidebar({
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
  activePath = "Dashboard",
  onNavigate
}: SidebarProps) {
  const [isRegistryExpanded, setIsRegistryExpanded] = React.useState(true);

  const navigation: NavItem[] = [
    { name: "Dashboard", path: "Dashboard", icon: LayoutDashboard },
    { name: "Projects", path: "Projects", icon: Folder },
    { name: "Forms", path: "Forms", icon: FileSpreadsheet },
    { name: "Submissions", path: "Submissions", icon: Inbox },
    {
      name: "Registry",
      path: "Registry",
      icon: BookOpen,
      subItems: [
        { name: "Farmers", path: "Farmers", icon: User },
        { name: "Farms", path: "Farms", icon: MapPin },
      ]
    },
    { name: "Maps", path: "Maps", icon: Map },
    { name: "Reports", path: "Reports", icon: BarChart3 },
    { name: "Team", path: "Team", icon: Users },
    { name: "Settings", path: "Settings", icon: Settings },
  ];

  const handleNavClick = (item: NavItem, e: React.MouseEvent) => {
    if (item.subItems) {
      e.preventDefault();
      if (isCollapsed) {
        setIsCollapsed(false);
        setIsRegistryExpanded(true);
      } else {
        setIsRegistryExpanded(!isRegistryExpanded);
      }
    } else {
      onNavigate?.(item.path);
      setMobileOpen(false);
    }
  };

  const handleSubNavClick = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate?.(path);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-sidebar border-r border-sidebar-border text-sidebar-foreground transition-all duration-300 ease-in-out lg:static",
          isCollapsed ? "w-[68px]" : "w-[240px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar Header: Brand & Collapse Toggle */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-sidebar-border shrink-0">
          <div className="flex items-center overflow-hidden h-14">
            {isCollapsed ? (
              <>
                <Image src="/favicon.svg" width={64} height={64} className="size-12 dark:hidden shrink-0" alt="FarmHand Logo" />
                <Image src="/favicon_dark.svg" width={64} height={64} className="size-12 hidden dark:block shrink-0" alt="FarmHand Logo" />
              </>
            ) : (
              <>
                <Image src="/fullcolor_logo.svg" width={224} height={56} className="h-14 w-auto dark:hidden shrink-0" alt="FarmHand Logo" />
                <Image src="/dark_logo.svg" width={224} height={56} className="h-14 w-auto hidden dark:block shrink-0" alt="FarmHand Logo" />
              </>
            )}
          </div>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-neutral-400 dark:text-neutral-500 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
          </button>
        </div>

        {/* Workspace Switcher */}
        <div className="p-3 border-b border-sidebar-border shrink-0">
          <div
            className={cn(
              "flex items-center gap-2 p-1.5 rounded-button border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 cursor-pointer transition-all",
              isCollapsed && "justify-center"
            )}
          >
            <div className="size-6 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center text-xs font-semibold shrink-0">
              HQ
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  Highland Orchards
                </span>
                <span className="text-[10px] text-neutral-400 truncate">
                  Master Workspace
                </span>
              </div>
            )}
            {!isCollapsed && <ChevronsUpDown className="size-3 text-neutral-400 shrink-0" />}
          </div>
        </div>

        {/* Navigation Area */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
          {navigation.map((item) => {
            const isSelected = activePath === item.path || 
              (item.subItems && item.subItems.some(sub => activePath === sub.path));
            const hasSubItems = !!item.subItems;

            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={(e) => handleNavClick(item, e)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-button transition-all group relative",
                    isSelected 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                      : "hover:bg-neutral-50 dark:hover:bg-neutral-900/50 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100",
                    isCollapsed && "justify-center"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon
                    className={cn(
                      "size-4 shrink-0 transition-transform group-hover:scale-105",
                      isSelected ? "text-primary" : "text-neutral-400 dark:text-neutral-500"
                    )}
                  />
                  {!isCollapsed && (
                    <span className="flex-1 text-left truncate">{item.name}</span>
                  )}
                  
                  {!isCollapsed && hasSubItems && (
                    <ChevronRight
                      className={cn(
                        "size-3 text-neutral-400 transition-transform duration-200",
                        isRegistryExpanded && "rotate-90"
                      )}
                    />
                  )}

                  {/* Tooltip in collapsed mode */}
                  {isCollapsed && (
                    <div className="absolute left-16 z-50 bg-neutral-950 text-white text-xs py-1 px-2 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md">
                      {item.name}
                    </div>
                  )}
                </button>

                {/* Sub-menu rendering */}
                {!isCollapsed && hasSubItems && isRegistryExpanded && (
                  <div className="pl-6 space-y-1">
                    {item.subItems?.map((sub) => {
                      const isSubSelected = activePath === sub.path;
                      return (
                        <button
                          key={sub.name}
                          onClick={(e) => handleSubNavClick(sub.path, e)}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium rounded-button transition-all",
                            isSubSelected
                              ? "bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white"
                              : "hover:bg-neutral-50 dark:hover:bg-neutral-900/30 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
                          )}
                        >
                          <sub.icon
                            className={cn(
                              "size-3 shrink-0",
                              isSubSelected ? "text-primary" : "text-neutral-400"
                            )}
                          />
                          <span className="truncate">{sub.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Footer Profile Slot */}
        <div className="p-3 border-t border-sidebar-border bg-neutral-50/50 dark:bg-neutral-900/20 shrink-0">
          <div
            className={cn(
              "flex items-center gap-2 p-1.5 rounded-button hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer group",
              isCollapsed && "justify-center"
            )}
          >
            <div className="size-8 rounded-full bg-primary-soft text-primary font-semibold text-xs flex items-center justify-center shrink-0 border border-primary/20">
              JD
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                  John Doe
                </span>
                <span className="text-[10px] text-neutral-400 truncate">
                  Admin Owner
                </span>
              </div>
            )}
            {!isCollapsed && (
              <button className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-md transition-colors">
                <LogOut className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
