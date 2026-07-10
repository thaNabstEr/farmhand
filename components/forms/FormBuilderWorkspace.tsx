"use client"

import * as React from "react"
import { FormToolbar } from "./FormToolbar"
import { FieldLibrary } from "./FieldLibrary"
import { FormCanvas } from "./FormCanvas"
import { Inspector } from "./Inspector"
import { FieldDefinition } from "@/data/mock/fields"
import { FormBuilderProvider } from "@/form-builder/state/FormBuilderContext"
import { ToastProvider, useToast } from "@/components/shared/ToastProvider"
import { DndProvider } from "@/form-builder/components/dnd/DndProvider"
import { KeyboardShortcutProvider } from "./KeyboardShortcutProvider"

export interface FormBuilderWorkspaceProps {
  onBack: () => void;
}

function FormBuilderWorkspaceContent({ onBack }: FormBuilderWorkspaceProps) {
  const { showToast } = useToast();

  const handleSelectUnsupportedField = (field: FieldDefinition) => {
    showToast(`Field type "${field.label}" support coming soon.`, "info");
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
        <Inspector />
      </div>
    </div>
  )
}

export function FormBuilderWorkspace({ onBack }: FormBuilderWorkspaceProps) {
  return (
    <ToastProvider>
      <FormBuilderProvider>
        <DndProvider>
          <KeyboardShortcutProvider>
            <FormBuilderWorkspaceContent onBack={onBack} />
          </KeyboardShortcutProvider>
        </DndProvider>
      </FormBuilderProvider>
    </ToastProvider>
  )
}

export default FormBuilderWorkspace;
