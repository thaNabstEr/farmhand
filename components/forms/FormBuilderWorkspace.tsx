"use client"

import * as React from "react"
import { FormToolbar } from "./FormToolbar"
import { FieldLibrary } from "./FieldLibrary"
import { FormCanvas } from "./FormCanvas"
import { PropertiesPanel } from "./PropertiesPanel"
import { FieldDefinition } from "@/data/mock/fields"
import { FormBuilderProvider } from "@/form-builder/state/FormBuilderContext"

export interface FormBuilderWorkspaceProps {
  onBack: () => void;
}

function FormBuilderWorkspaceContent({ onBack }: FormBuilderWorkspaceProps) {
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Auto-clear message toasts
  React.useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleSelectUnsupportedField = (field: FieldDefinition) => {
    setToastMessage(`Field type "${field.label}" selection is registered! Rendering support coming soon.`);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background select-none transition-colors duration-200">
      {/* Top Toolbar */}
      <FormToolbar onBack={onBack} />

      {/* Main Panels Workspace */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Panel: Fields Palette */}
        <FieldLibrary onSelectField={handleSelectUnsupportedField} />

        {/* Center Panel: Interactive Form Canvas */}
        <FormCanvas />

        {/* Right Panel: Properties Inspector */}
        <PropertiesPanel />
      </div>

      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs px-4 py-3 rounded-button shadow-lg border border-neutral-800 dark:border-neutral-200 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="size-1.5 rounded-full bg-primary animate-ping" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  )
}

export function FormBuilderWorkspace({ onBack }: FormBuilderWorkspaceProps) {
  return (
    <FormBuilderProvider>
      <FormBuilderWorkspaceContent onBack={onBack} />
    </FormBuilderProvider>
  )
}

export default FormBuilderWorkspace;
