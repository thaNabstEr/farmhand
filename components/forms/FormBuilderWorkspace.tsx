"use client"

import * as React from "react"
import { FormToolbar } from "./FormToolbar"
import { FieldLibrary } from "./FieldLibrary"
import { FormCanvas } from "./FormCanvas"
import { Inspector } from "./Inspector"
import { FieldDefinition } from "@/data/mock/fields"
import { FormBuilderProvider, useFormBuilder } from "@/form-builder/state/FormBuilderContext"
import { ToastProvider, useToast } from "@/components/shared/ToastProvider"
import { DndProvider } from "@/form-builder/components/dnd/DndProvider"
import { KeyboardShortcutProvider } from "./KeyboardShortcutProvider"
import { PreviewToolbar } from "@/components/preview/PreviewToolbar"
import { PreviewViewport } from "@/components/preview/PreviewViewport"
import { FormRunner } from "@/components/runner/FormRunner"

export interface FormBuilderWorkspaceProps {
  formId?: string;
  onBack: () => void;
  onStartSubmission?: (formId: string) => void;
  onViewSubmissions?: (formId: string) => void;
}

function FormBuilderWorkspaceContent({
  onBack,
  onStartSubmission,
  onViewSubmissions,
}: FormBuilderWorkspaceProps) {
  const { state } = useFormBuilder()
  const { showToast } = useToast()
  
  const [isPreviewMode, setIsPreviewMode] = React.useState(false)
  const [viewport, setViewport] = React.useState<"desktop" | "mobile">("desktop")
  const resetRunnerRef = React.useRef<(() => void) | null>(null)

  const handleSelectUnsupportedField = (field: FieldDefinition) => {
    showToast(`Field type "${field.label}" support coming soon.`, "info")
  }

  if (isPreviewMode) {
    return (
      <KeyboardShortcutProvider onPreview={() => setIsPreviewMode(false)}>
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-background transition-colors duration-200">
          <PreviewToolbar
            formName={state.schema.name}
            viewport={viewport}
            onViewportChange={setViewport}
            onBackToBuilder={() => setIsPreviewMode(false)}
            onResetResponses={() => resetRunnerRef.current?.()}
          />

          <PreviewViewport viewport={viewport}>
            <FormRunner
              schema={state.schema}
              mode="preview"
              onReturnToBuilder={() => setIsPreviewMode(false)}
              onRegisterReset={(resetFn) => {
                resetRunnerRef.current = resetFn
              }}
            />
          </PreviewViewport>
        </div>
      </KeyboardShortcutProvider>
    )
  }

  return (
    <KeyboardShortcutProvider onPreview={() => setIsPreviewMode(true)}>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-background select-none transition-colors duration-200">
        {/* Top Toolbar */}
        <FormToolbar
          onBack={onBack}
          onPreview={() => setIsPreviewMode(true)}
          onStartSubmission={onStartSubmission ? () => onStartSubmission(state.schema.id) : undefined}
          onViewSubmissions={onViewSubmissions ? () => onViewSubmissions(state.schema.id) : undefined}
        />

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
    </KeyboardShortcutProvider>
  )
}

export function FormBuilderWorkspace({ formId, onBack, onStartSubmission, onViewSubmissions }: FormBuilderWorkspaceProps) {
  return (
    <ToastProvider>
      <FormBuilderProvider initialFormId={formId}>
        <DndProvider>
          <FormBuilderWorkspaceContent
            onBack={onBack}
            onStartSubmission={onStartSubmission}
            onViewSubmissions={onViewSubmissions}
          />
        </DndProvider>
      </FormBuilderProvider>
    </ToastProvider>
  )
}

export default FormBuilderWorkspace;
