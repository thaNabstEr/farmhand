import * as React from "react"
import { Sliders } from "lucide-react"
import { Panel } from "./Panel"

export function PropertiesPanel() {
  return (
    <Panel
      title="Properties"
      widthClass="w-80"
      className="border-l"
      scrollable={false}
    >
      <div className="h-full flex flex-col items-center justify-center text-center p-6 select-none">
        {/* Visual illustration placeholder */}
        <div className="size-12 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/40 text-neutral-400 dark:text-neutral-500 flex items-center justify-center mb-4 shadow-sm">
          <Sliders className="size-5.5 animate-pulse" />
        </div>
        
        <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
          Field Properties
        </h4>
        
        <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500 font-medium max-w-[200px] leading-relaxed">
          Select an input field from the canvas to edit its label, placeholder, logic, and offline validation settings.
        </p>
      </div>
    </Panel>
  )
}
export default PropertiesPanel
