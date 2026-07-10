"use client"

import * as React from "react"
import { FormSchema, Field, FieldType, FormBuilderState, FormBuilderContextType } from "../types"

const FormBuilderContext = React.createContext<FormBuilderContextType | undefined>(undefined);

const initialFormSchema = (): FormSchema => ({
  id: `form-${Date.now()}`,
  name: "Untitled Form",
  description: "",
  version: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  fields: []
});

export function FormBuilderProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<FormBuilderState>({
    schema: initialFormSchema(),
    activeFieldId: null,
    isAddFieldOpen: false,
    isClearFormDialogOpen: false
  });

  const updateSchema = React.useCallback((updater: (schema: FormSchema) => FormSchema) => {
    setState((prev) => ({
      ...prev,
      schema: {
        ...updater(prev.schema),
        updatedAt: new Date().toISOString()
      }
    }));
  }, []);

  const createForm = React.useCallback((name = "Untitled Form", description = "") => {
    setState({
      schema: {
        id: `form-${Date.now()}`,
        name,
        description,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fields: []
      },
      activeFieldId: null,
      isAddFieldOpen: false,
      isClearFormDialogOpen: false
    });
  }, []);

  const renameForm = React.useCallback((name: string) => {
    updateSchema((schema) => ({
      ...schema,
      name
    }));
  }, [updateSchema]);

  const updateDescription = React.useCallback((description: string) => {
    updateSchema((schema) => ({
      ...schema,
      description
    }));
  }, [updateSchema]);

  const createField = React.useCallback((type: FieldType, index?: number) => {
    const defaultLabels: Record<FieldType, string> = {
      text: "Text Field",
      number: "Number Field",
      paragraph: "Paragraph Field",
      email: "Email Field",
      phone: "Phone Field",
      date: "Date Field",
      time: "Time Field",
      dropdown: "Dropdown Selection",
      radio: "Radio Choice Selection",
      checkboxes: "Checkbox Selection",
      photo: "Photo Capture",
      signature: "Signature Panel",
      barcode: "Barcode Scanner",
      qrcode: "QR Scanner",
      gps: "GPS Coordinate Location",
      map: "Map boundary",
      section: "Form Section Divider",
      repeat_group: "Repeat Group Block",
      divider: "Horizontal Divider Rule"
    };

    const uniqueId = `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newField: Field = {
      id: uniqueId,
      type,
      label: defaultLabels[type] || `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      description: `Provide information for ${type} input`,
      placeholder: `Enter ${type} value...`,
      required: false,
      validation: { required: false },
      settings: {
        width: "full",
        hiddenLabel: false,
        readOnly: false,
        offlineRequired: false,
        syncBehaviour: "immediate",
        conflictStrategy: "client_wins"
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };

    updateSchema((schema) => {
      const newFields = [...schema.fields];
      if (typeof index === "number" && index >= 0 && index <= newFields.length) {
        newFields.splice(index, 0, newField);
      } else {
        newFields.push(newField);
      }
      return {
        ...schema,
        fields: newFields
      };
    });

    setState((prev) => ({
      ...prev,
      activeFieldId: newField.id
    }));

    return newField;
  }, [updateSchema]);

  const addField = React.useCallback((type: FieldType) => {
    createField(type);
  }, [createField]);

  const removeField = React.useCallback((fieldId: string) => {
    updateSchema((schema) => ({
      ...schema,
      fields: schema.fields.filter((f) => f.id !== fieldId)
    }));

    setState((prev) => ({
      ...prev,
      activeFieldId: prev.activeFieldId === fieldId ? null : prev.activeFieldId
    }));
  }, [updateSchema]);

  const deleteField = React.useCallback((fieldId: string) => {
    removeField(fieldId);
  }, [removeField]);

  const updateField = React.useCallback((fieldId: string, updates: Partial<Field>) => {
    updateSchema((schema) => ({
      ...schema,
      fields: schema.fields.map((f) => {
        if (f.id !== fieldId) return f;
        
        // Merge updates
        const updated = {
          ...f,
          ...updates,
          updatedAt: new Date().toISOString(),
          version: (f.version || 1) + 1
        };

        // Deep merge settings
        if (updates.settings) {
          updated.settings = {
            ...f.settings,
            ...updates.settings
          };
        }

        // Deep merge validation
        if (updates.validation) {
          updated.validation = {
            ...f.validation,
            ...updates.validation
          };
        }

        if (updates.required !== undefined) {
          updated.validation = {
            ...(updated.validation || { required: updates.required }),
            required: updates.required
          };
        }
        
        return updated;
      })
    }));
  }, [updateSchema]);

  const duplicateField = React.useCallback((fieldId: string) => {
    const newId = `${fieldId.split("-")[0] || "field"}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    updateSchema((schema) => {
      const fieldIndex = schema.fields.findIndex((f) => f.id === fieldId);
      if (fieldIndex === -1) return schema;

      const fieldToDuplicate = schema.fields[fieldIndex];
      const duplicatedField: Field = {
        ...fieldToDuplicate,
        id: newId,
        label: `${fieldToDuplicate.label} (Copy)`
      };

      const newFields = [...schema.fields];
      newFields.splice(fieldIndex + 1, 0, duplicatedField);

      return {
        ...schema,
        fields: newFields
      };
    });

    setState((prev) => ({
      ...prev,
      activeFieldId: newId
    }));
  }, [updateSchema]);

  const moveField = React.useCallback((fromIndex: number, toIndex: number) => {
    updateSchema((schema) => {
      if (
        fromIndex < 0 ||
        fromIndex >= schema.fields.length ||
        toIndex < 0 ||
        toIndex >= schema.fields.length
      ) {
        return schema;
      }

      const newFields = [...schema.fields];
      const [movedField] = newFields.splice(fromIndex, 1);
      newFields.splice(toIndex, 0, movedField);

      return {
        ...schema,
        fields: newFields
      };
    });
  }, [updateSchema]);

  const resetForm = React.useCallback(() => {
    setState({
      schema: initialFormSchema(),
      activeFieldId: null,
      isAddFieldOpen: false,
      isClearFormDialogOpen: false
    });
  }, []);

  const setActiveFieldId = React.useCallback((fieldId: string | null) => {
    setState((prev) => ({
      ...prev,
      activeFieldId: fieldId
    }));
  }, []);

  const selectField = React.useCallback((fieldId: string | null) => {
    setActiveFieldId(fieldId);
  }, [setActiveFieldId]);

  const clearSelection = React.useCallback(() => {
    setActiveFieldId(null);
  }, [setActiveFieldId]);

  const clearFields = React.useCallback(() => {
    updateSchema((schema) => ({
      ...schema,
      fields: []
    }));
    setActiveFieldId(null);
  }, [updateSchema, setActiveFieldId]);

  const setIsAddFieldOpen = React.useCallback((open: boolean) => {
    setState((prev) => ({
      ...prev,
      isAddFieldOpen: open
    }));
  }, []);

  const setIsClearFormDialogOpen = React.useCallback((open: boolean) => {
    setState((prev) => ({
      ...prev,
      isClearFormDialogOpen: open
    }));
  }, []);

  const value: FormBuilderContextType = React.useMemo(() => ({
    state,
    createForm,
    renameForm,
    updateDescription,
    addField,
    createField,
    removeField,
    deleteField,
    updateField,
    duplicateField,
    moveField,
    resetForm,
    setActiveFieldId,
    selectField,
    clearSelection,
    clearFields,
    setIsAddFieldOpen,
    setIsClearFormDialogOpen
  }), [
    state,
    createForm,
    renameForm,
    updateDescription,
    addField,
    createField,
    removeField,
    deleteField,
    updateField,
    duplicateField,
    moveField,
    resetForm,
    setActiveFieldId,
    selectField,
    clearSelection,
    clearFields,
    setIsAddFieldOpen,
    setIsClearFormDialogOpen
  ]);

  return (
    <FormBuilderContext.Provider value={value}>
      {children}
    </FormBuilderContext.Provider>
  );
}

export function useFormBuilder() {
  const context = React.useContext(FormBuilderContext);
  if (!context) {
    throw new Error("useFormBuilder must be used within a FormBuilderProvider");
  }
  return context;
}
