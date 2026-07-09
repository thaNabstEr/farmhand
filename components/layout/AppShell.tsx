"use client"

import * as React from "react"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

export interface AppShellProps {
  children: React.ReactNode;
  activePath: string;
  onNavigate: (path: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export function AppShell({
  children,
  activePath,
  onNavigate,
  searchValue,
  onSearchChange
}: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        activePath={activePath}
        onNavigate={onNavigate}
      />

      {/* Main App Workspace */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Sticky Header */}
        <Header
          activePath={activePath}
          setMobileOpen={setMobileOpen}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
        />

        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background scrollbar-thin">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
