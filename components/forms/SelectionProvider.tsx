"use client"

import * as React from "react"
import { useFormBuilder } from "@/form-builder/state/FormBuilderContext"

export interface SelectionProviderProps {
  children: React.ReactNode;
}

export function SelectionProvider({ children }: SelectionProviderProps) {
  const { state, deleteField, clearSelection, selectField } = useFormBuilder();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in inputs or contenteditable elements
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (!state.activeFieldId) return;

      const fields = state.schema.fields;
      const currentIndex = fields.findIndex((f) => f.id === state.activeFieldId);

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          clearSelection();
          break;
        case "Delete":
        case "Backspace":
          e.preventDefault();
          deleteField(state.activeFieldId);
          break;
        case "ArrowUp":
          if (currentIndex > 0) {
            e.preventDefault();
            selectField(fields[currentIndex - 1].id);
          }
          break;
        case "ArrowDown":
          if (currentIndex < fields.length - 1) {
            e.preventDefault();
            selectField(fields[currentIndex + 1].id);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [state.activeFieldId, state.schema.fields, selectField, clearSelection, deleteField]);

  return <>{children}</>;
}

export default SelectionProvider;
