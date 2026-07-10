export type FieldType =
  | "text"
  | "number"
  | "paragraph"
  | "email"
  | "phone"
  | "date"
  | "time"
  | "dropdown"
  | "radio"
  | "checkboxes"
  | "photo"
  | "signature"
  | "barcode"
  | "qrcode"
  | "gps"
  | "map"
  | "section"
  | "repeat_group"
  | "divider";

export interface Validation {
  required: boolean;
  min?: number;
  max?: number;
  pattern?: string;
  errorMessage?: string;
}

export interface FieldSettings {
  placeholder?: string;
  options?: { label: string; value: string }[];
  helperText?: string;
  defaultValue?: string;
}

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  description: string;
  placeholder?: string;
  required: boolean;
  validation?: Validation;
  settings?: FieldSettings;
}

export interface FormSchema {
  id: string;
  name: string;
  description: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  fields: Field[];
}

export interface FormBuilderState {
  schema: FormSchema;
  activeFieldId: string | null;
  isAddFieldOpen: boolean;
  isClearFormDialogOpen: boolean;
}

export interface FormBuilderContextType {
  state: FormBuilderState;
  createForm: (name?: string, description?: string) => void;
  renameForm: (name: string) => void;
  updateDescription: (description: string) => void;
  addField: (type: FieldType) => void;
  createField: (type: FieldType, index?: number) => Field;
  removeField: (fieldId: string) => void;
  deleteField: (fieldId: string) => void;
  updateField: (fieldId: string, updates: Partial<Field>) => void;
  duplicateField: (fieldId: string) => void;
  moveField: (fromIndex: number, toIndex: number) => void;
  resetForm: () => void;
  setActiveFieldId: (fieldId: string | null) => void;
  selectField: (fieldId: string | null) => void;
  clearSelection: () => void;
  clearFields: () => void;
  setIsAddFieldOpen: (open: boolean) => void;
  setIsClearFormDialogOpen: (open: boolean) => void;
}

export interface FieldRendererProps {
  field: Field;
  onChange?: (value: unknown) => void;
}
