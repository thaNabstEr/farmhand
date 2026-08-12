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
  | "checkbox"
  | "checkboxes"
  | "yes_no"
  | "location"
  | "photo"
  | "signature"
  | "barcode"
  | "qrcode"
  | "gps"
  | "map"
  | "section"
  | "repeat_group"
  | "calculated"
  | "divider";

export interface FieldOption {
  id: string;
  label: string;
  value: string;
}

export interface LocationResponse {
  latitude: number;
  longitude: number;
  accuracy: number;
  capturedAt: string;
}

export interface PhotoItem {
  id: string;
  name: string;
  dataUrl: string;
  size: number;
  type: string;
  capturedAt: string;
}

export type ConditionOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "greaterThan"
  | "greaterThanOrEqual"
  | "lessThan"
  | "lessThanOrEqual"
  | "isEmpty"
  | "isNotEmpty";

export type LogicAction = "show" | "hide" | "require" | "optional";
export type LogicGroup = "all" | "any";

export interface ConditionRule {
  id: string;
  fieldId: string;
  operator: ConditionOperator;
  value?: string | number | boolean;
}

export interface FieldLogic {
  enabled: boolean;
  action: LogicAction;
  group: LogicGroup;
  conditions: ConditionRule[];
}

export interface FieldCalculation {
  enabled: boolean;
  expression: string;
  unit?: string;
}

export interface Validation {
  required: boolean;
  min?: number;
  max?: number;
  minSelections?: number;
  maxSelections?: number;
  maxPhotos?: number;
  minDate?: string;
  maxDate?: string;
  email?: boolean;
  phone?: boolean;
  pattern?: string;
  errorMessage?: string;
}

export interface FieldSettings {
  placeholder?: string;
  options?: FieldOption[];
  helperText?: string;
  defaultValue?: string | boolean | string[];
  yesLabel?: string;
  noLabel?: string;
  buttonLabel?: string;
  maxPhotos?: number;
  accuracyRequirement?: number;
  width?: "full" | "half";
  hiddenLabel?: boolean;
  readOnly?: boolean;
  offlineRequired?: boolean;
  syncBehaviour?: string;
  conflictStrategy?: string;
  minItems?: number;
  maxItems?: number;
  addItemLabel?: string;
  allowRemove?: boolean;
  childFields?: Field[];
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
  logic?: FieldLogic;
  calculation?: FieldCalculation;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
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
  saveStatus: "saved" | "saving" | "unsaved" | "error";
  loadForm: (id: string) => Promise<void>;
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

export interface RunnerFieldProps {
  field: Field;
  value: unknown;
  onChange: (val: unknown) => void;
  disabled?: boolean;
  error?: string | null;
}
