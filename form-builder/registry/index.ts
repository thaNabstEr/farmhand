import * as React from "react"
import { TextField } from "../components/renderers/TextField"
import { NumberField } from "../components/renderers/NumberField"
import { ParagraphField } from "../components/renderers/ParagraphField"
import { EmailField } from "../components/renderers/EmailField"
import { PhoneField } from "../components/renderers/PhoneField"
import { DateField } from "../components/renderers/DateField"
import { FieldRendererProps, Field, RunnerFieldProps } from "../types"

// Canvas Renderers
import { DropdownField } from "../components/renderers/DropdownField"
import { RadioField } from "../components/renderers/RadioField"
import { CheckboxField } from "../components/renderers/CheckboxField"
import { YesNoField } from "../components/renderers/YesNoField"
import { CalculatedField } from "../components/renderers/CalculatedField"
import { LocationField } from "../components/renderers/LocationField"
import { PhotoField } from "../components/renderers/PhotoField"

// Inspectors
import { TextInspector } from "../components/inspector/TextInspector"
import { NumberInspector } from "../components/inspector/NumberInspector"
import { DateInspector } from "../components/inspector/DateInspector"
import { EmailInspector } from "../components/inspector/EmailInspector"
import { PhoneInspector } from "../components/inspector/PhoneInspector"

// Runners
import { TextRunner } from "../components/runner/renderers/TextRunner"
import { ParagraphRunner } from "../components/runner/renderers/ParagraphRunner"
import { NumberRunner } from "../components/runner/renderers/NumberRunner"
import { EmailRunner } from "../components/runner/renderers/EmailRunner"
import { PhoneRunner } from "../components/runner/renderers/PhoneRunner"
import { DateRunner } from "../components/runner/renderers/DateRunner"
import { TimeRunner } from "../components/runner/renderers/TimeRunner"
import { DropdownRunner, RadioRunner, CheckboxRunner, YesNoRunner } from "../components/runner/renderers/ChoiceRunners"
import { LocationRunner, PhotoRunner } from "../components/runner/renderers/FieldDataRunners"
import { SignatureRunner, BarcodeRunner, QRCodeRunner, MapRunner } from "../components/runner/renderers/MediaRunners"
import { SectionRunner, DividerRunner } from "../components/runner/renderers/AdvancedRunners"
import { CalculatedRunner } from "../components/runner/renderers/CalculatedRunner"
import { RepeatGroupRunner } from "../components/runner/renderers/RepeatGroupRunner"

export interface RegistryEntry {
  renderer: React.ComponentType<FieldRendererProps>;
  inspector?: React.ComponentType<{
    field: Field;
    onChange: (updates: Partial<Field>) => void;
    match: (label: string) => boolean;
  }>;
  runner?: React.ComponentType<RunnerFieldProps>;
  validate?: (field: Field, value: unknown) => string | null;
}

// Built-in Validation Engine Helpers
const validateText = (field: Field, value: unknown): string | null => {
  const str = typeof value === "string" ? value.trim() : ""
  if (field.required && !str) {
    return "This field is required."
  }
  if (str && field.validation?.min !== undefined && str.length < field.validation.min) {
    return `Must be at least ${field.validation.min} characters.`
  }
  if (str && field.validation?.max !== undefined && str.length > field.validation.max) {
    return `Must be at most ${field.validation.max} characters.`
  }
  return null
}

const validateNumber = (field: Field, value: unknown): string | null => {
  if (field.required && (value === undefined || value === null || value === "")) {
    return "This field is required."
  }
  if (value !== undefined && value !== null && value !== "") {
    const num = Number(value)
    if (isNaN(num)) return "Please enter a valid number."
    if (field.validation?.min !== undefined && num < field.validation.min) {
      return `Must be at least ${field.validation.min}.`
    }
    if (field.validation?.max !== undefined && num > field.validation.max) {
      return `Must be at most ${field.validation.max}.`
    }
  }
  return null
}

const validateEmail = (field: Field, value: unknown): string | null => {
  const str = typeof value === "string" ? value.trim() : ""
  if (field.required && !str) {
    return "This field is required."
  }
  if (str) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(str)) {
      return "Please enter a valid email address."
    }
  }
  return null
}

const validatePhone = (field: Field, value: unknown): string | null => {
  const str = typeof value === "string" ? value.trim() : ""
  if (field.required && !str) {
    return "This field is required."
  }
  if (str && str.length < 6) {
    return "Please enter a valid phone number."
  }
  return null
}

const validateDate = (field: Field, value: unknown): string | null => {
  const str = typeof value === "string" ? value.trim() : ""
  if (field.required && !str) {
    return "This field is required."
  }
  if (str && field.validation?.minDate && str < field.validation.minDate) {
    return `Date cannot be before ${field.validation.minDate}.`
  }
  if (str && field.validation?.maxDate && str > field.validation.maxDate) {
    return `Date cannot be after ${field.validation.maxDate}.`
  }
  return null
}

const validateCheckbox = (field: Field, value: unknown): string | null => {
  const arr = Array.isArray(value) ? value : []
  if (field.required && arr.length === 0) {
    return "This field is required."
  }
  if (field.validation?.minSelections !== undefined && arr.length < field.validation.minSelections) {
    return `Select at least ${field.validation.minSelections} option${field.validation.minSelections !== 1 ? "s" : ""}.`
  }
  if (field.validation?.maxSelections !== undefined && arr.length > field.validation.maxSelections) {
    return `Select no more than ${field.validation.maxSelections} option${field.validation.maxSelections !== 1 ? "s" : ""}.`
  }
  return null
}

const validateYesNo = (field: Field, value: unknown): string | null => {
  if (field.required && value !== true && value !== false && value !== "true" && value !== "false") {
    return "This field is required."
  }
  return null
}

const validateLocation = (field: Field, value: unknown): string | null => {
  if (field.required) {
    if (!value || typeof value !== "object" || !("latitude" in value) || !("longitude" in value)) {
      return "Location capture is required."
    }
  }
  if (value && typeof value === "object" && "latitude" in value && "longitude" in value) {
    const loc = value as { latitude: number; longitude: number; accuracy?: number }
    if (loc.latitude < -90 || loc.latitude > 90) return "Invalid latitude coordinate."
    if (loc.longitude < -180 || loc.longitude > 180) return "Invalid longitude coordinate."
  }
  return null
}

const validatePhoto = (field: Field, value: unknown): string | null => {
  const photoList = Array.isArray(value) ? value : value ? [value] : []
  if (field.required && photoList.length === 0) {
    return "At least one photo is required."
  }
  const max = field.settings?.maxPhotos || field.validation?.maxPhotos || 1
  if (photoList.length > max) {
    return `Cannot exceed maximum of ${max} photo${max !== 1 ? "s" : ""}.`
  }
  return null
}

const validateDefault = (field: Field, value: unknown): string | null => {
  if (field.required) {
    if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
      return "This field is required."
    }
  }
  return null
}

export const fieldRegistry: Record<string, RegistryEntry> = {
  text: { renderer: TextField, inspector: TextInspector, runner: TextRunner, validate: validateText },
  paragraph: { renderer: ParagraphField, inspector: TextInspector, runner: ParagraphRunner, validate: validateText },
  number: { renderer: NumberField, inspector: NumberInspector, runner: NumberRunner, validate: validateNumber },
  email: { renderer: EmailField, inspector: EmailInspector, runner: EmailRunner, validate: validateEmail },
  phone: { renderer: PhoneField, inspector: PhoneInspector, runner: PhoneRunner, validate: validatePhone },
  date: { renderer: DateField, inspector: DateInspector, runner: DateRunner, validate: validateDate },
  time: { renderer: DateField, runner: TimeRunner, validate: validateDefault },
  dropdown: { renderer: DropdownField, runner: DropdownRunner, validate: validateDefault },
  radio: { renderer: RadioField, runner: RadioRunner, validate: validateDefault },
  checkbox: { renderer: CheckboxField, runner: CheckboxRunner, validate: validateCheckbox },
  checkboxes: { renderer: CheckboxField, runner: CheckboxRunner, validate: validateCheckbox },
  yes_no: { renderer: YesNoField, runner: YesNoRunner, validate: validateYesNo },
  location: { renderer: LocationField, runner: LocationRunner, validate: validateLocation },
  gps: { renderer: LocationField, runner: LocationRunner, validate: validateLocation },
  photo: { renderer: PhotoField, runner: PhotoRunner, validate: validatePhoto },
  signature: { renderer: TextField, runner: SignatureRunner, validate: validateDefault },
  barcode: { renderer: TextField, runner: BarcodeRunner, validate: validateDefault },
  qrcode: { renderer: TextField, runner: QRCodeRunner, validate: validateDefault },
  map: { renderer: TextField, runner: MapRunner, validate: validateDefault },
  section: { renderer: TextField, runner: SectionRunner },
  repeat_group: { renderer: TextField, runner: RepeatGroupRunner, validate: validateDefault },
  calculated: { renderer: CalculatedField, runner: CalculatedRunner, validate: validateNumber },
  divider: { renderer: TextField, runner: DividerRunner },
};

export default fieldRegistry;
