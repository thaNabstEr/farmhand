"use client"

import * as React from "react"

export interface PreviewViewportProps {
  viewport: "desktop" | "mobile";
  children: React.ReactNode;
}

export function PreviewViewport({ viewport, children }: PreviewViewportProps) {
  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#F8FAF8] dark:bg-[#090B09] p-4 sm:p-8 transition-colors duration-200 scrollbar-thin">
      {viewport === "desktop" ? (
        <div className="w-full max-w-3xl mx-auto animate-fade-in">
          {children}
        </div>
      ) : (
        <div className="py-4 animate-fade-in">
          {/* Styled Mobile Phone Device Frame */}
          <div className="w-full max-w-[380px] mx-auto rounded-[40px] border-[10px] border-neutral-850 dark:border-neutral-750 bg-card shadow-2xl relative p-3 sm:p-4 min-h-[720px] transition-all duration-300">
            {/* Phone Speaker Notch */}
            <div className="w-24 h-4 bg-neutral-850 dark:bg-neutral-750 rounded-b-xl mx-auto -mt-3 sm:-mt-4 mb-4 flex items-center justify-center">
              <div className="size-2 rounded-full bg-neutral-700 dark:bg-neutral-600" />
            </div>

            {/* Mobile Viewport Screen Scroll Container */}
            <div className="max-h-[640px] overflow-y-auto scrollbar-none pr-0.5">
              {children}
            </div>

            {/* Home Indicator bar */}
            <div className="w-28 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto mt-4" />
          </div>
        </div>
      )}
    </div>
  )
}

export default PreviewViewport;
