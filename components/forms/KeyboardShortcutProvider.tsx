"use client"

import * as React from "react"
import { useFormBuilder } from "@/form-builder/state/FormBuilderContext"
import { useToast } from "@/components/shared/ToastProvider"

export interface KeyboardShortcutProviderProps {
  children: React.ReactNode;
}

export function KeyboardShortcutProvider({ children }: KeyboardShortcutProviderProps) {
  const { 
    state, 
    deleteField, 
    clearSelection, 
    selectField,
    setIsAddFieldOpen,
    setIsClearFormDialogOpen
  } = useFormBuilder()
  const { showToast } = useToast()

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      
      // Check if user is typing in inputs or textareas
      const isTyping = 
        target.tagName === "INPUT" || 
        target.tagName === "TEXTAREA" || 
        target.isContentEditable

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
      const cmdCtrl = isMac ? e.metaKey : e.ctrlKey

      // 1. Command keyboard shortcuts (these take priority, some even when typing)
      
      // Ctrl/Cmd + Shift + Backspace -> Open Clear Form dialog
      if (cmdCtrl && e.shiftKey && (e.key === "Backspace" || e.key === "Delete")) {
        e.preventDefault()
        setIsClearFormDialogOpen(true)
        return
      }

      // Ctrl/Cmd + Enter -> Publish Form (Disabled)
      if (cmdCtrl && e.key === "Enter") {
        e.preventDefault()
        showToast("Publishing will be available in a future milestone.", "info")
        return
      }

      // If user is typing in forms/inputs, do not trigger simple character shortcuts
      if (isTyping) {
        return
      }

      // 2. Local builder focus key navigation and alphanumeric shortcuts
      
      // "A" or "a" -> Open Add Field dropdown
      if (e.key === "a" || e.key === "A") {
        e.preventDefault()
        setIsAddFieldOpen(true)
        return
      }

      // "P" or "p" -> Preview Form (Disabled)
      if (e.key === "p" || e.key === "P") {
        e.preventDefault()
        showToast("Preview Coming Soon", "info")
        return
      }

      // Escape -> Clear selection, or close active modals
      if (e.key === "Escape") {
        e.preventDefault()
        if (state.isAddFieldOpen) {
          setIsAddFieldOpen(false)
        } else if (state.isClearFormDialogOpen) {
          setIsClearFormDialogOpen(false)
        } else if (state.activeFieldId) {
          clearSelection()
        }
        return
      }

      // Delete / Backspace -> Delete active field
      if ((e.key === "Delete" || e.key === "Backspace") && state.activeFieldId) {
        e.preventDefault()
        const deletedField = state.schema.fields.find((f) => f.id === state.activeFieldId)
        deleteField(state.activeFieldId)
        if (deletedField) {
          showToast(`Deleted Field: ${deletedField.label}`, "warning")
        }
        return
      }

      // ArrowUp / ArrowDown -> Navigate active field
      if (e.key === "ArrowUp") {
        const fields = state.schema.fields
        if (fields.length === 0) return
        e.preventDefault()
        const currentIndex = fields.findIndex((f) => f.id === state.activeFieldId)
        if (currentIndex > 0) {
          selectField(fields[currentIndex - 1].id)
        } else {
          selectField(fields[fields.length - 1].id) // Wrap around
        }
        return
      }

      if (e.key === "ArrowDown") {
        const fields = state.schema.fields
        if (fields.length === 0) return
        e.preventDefault()
        const currentIndex = fields.findIndex((f) => f.id === state.activeFieldId)
        if (currentIndex < fields.length - 1) {
          selectField(fields[currentIndex + 1].id)
        } else {
          selectField(fields[0].id) // Wrap around
        }
        return
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [
    state.activeFieldId,
    state.schema.fields,
    state.isAddFieldOpen,
    state.isClearFormDialogOpen,
    selectField,
    clearSelection,
    deleteField,
    setIsAddFieldOpen,
    setIsClearFormDialogOpen,
    showToast
  ])

  return <>{children}</>
}

export default KeyboardShortcutProvider;
