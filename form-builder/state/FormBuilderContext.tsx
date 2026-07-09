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
    activeFieldId: null
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
      activeFieldId: null
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

  const addField = React.useCallback((type: FieldType) => {
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

    const newField: Field = {
      id: `${type}-${Date.now()}`,
      type,
      label: defaultLabels[type] || `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      description: `Provide information for ${type} input`,
      placeholder: `Enter ${type} value...`,
      required: false,
      validation: { required: false },
      settings: {}
    };

    updateSchema((schema) => ({
      ...schema,
      fields: [...schema.fields, newField]
    }));

    setState((prev) => ({
      ...prev,
      activeFieldId: newField.id
    }));
  }, [updateSchema]);

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

  const updateField = React.useCallback((fieldId: string, updates: Partial<Field>) => {
    updateSchema((schema) => ({
      ...schema,
      fields: schema.fields.map((f) => {
        if (f.id !== fieldId) return f;
        
        // Merge updates
        const updated = { ...f, ...updates };
        if (updates.required !== undefined) {
          updated.validation = {
            ...f.validation,
            required: updates.required
          };
        }
        return updated;
      })
    }));
  }, [updateSchema]);

  const duplicateField = React.useCallback((fieldId: string) => {
    updateSchema((schema) => {
      const fieldIndex = schema.fields.findIndex((f) => f.id === fieldId);
      if (fieldIndex === -1) return schema;

      const fieldToDuplicate = schema.fields[fieldIndex];
      const duplicatedField: Field = {
        ...fieldToDuplicate,
        id: `${fieldToDuplicate.type}-${Date.now()}`,
        label: `${fieldToDuplicate.label} (Copy)`
      };

      const newFields = [...schema.fields];
      newFields.splice(fieldIndex + 1, 0, duplicatedField);

      return {
        ...schema,
        fields: newFields
      };
    });
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
      activeFieldId: null
    });
  }, []);

  const setActiveFieldId = React.useCallback((fieldId: string | null) => {
    setState((prev) => ({
      ...prev,
      activeFieldId: fieldId
    }));
  }, []);

  const value: FormBuilderContextType = React.useMemo(() => ({
    state,
    createForm,
    renameForm,
    updateDescription,
    addField,
    removeField,
    updateField,
    duplicateField,
    moveField,
    resetForm,
    setActiveFieldId
  }), [
    state,
    createForm,
    renameForm,
    updateDescription,
    addField,
    removeField,
    updateField,
    duplicateField,
    moveField,
    resetForm,
    setActiveFieldId
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
