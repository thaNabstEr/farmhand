import * as React from "react"
import { TextField } from "../components/renderers/TextField"
import { NumberField } from "../components/renderers/NumberField"
import { ParagraphField } from "../components/renderers/ParagraphField"
import { EmailField } from "../components/renderers/EmailField"
import { PhoneField } from "../components/renderers/PhoneField"
import { DateField } from "../components/renderers/DateField"
import { FieldRendererProps, Field } from "../types"

// Inspectors
import { TextInspector } from "../components/inspector/TextInspector"
import { NumberInspector } from "../components/inspector/NumberInspector"
import { DateInspector } from "../components/inspector/DateInspector"
import { EmailInspector } from "../components/inspector/EmailInspector"
import { PhoneInspector } from "../components/inspector/PhoneInspector"

export interface RegistryEntry {
  renderer: React.ComponentType<FieldRendererProps>;
  inspector?: React.ComponentType<{
    field: Field;
    onChange: (updates: Partial<Field>) => void;
    match: (label: string) => boolean;
  }>;
}

export const fieldRegistry: Record<string, RegistryEntry> = {
  text: { renderer: TextField, inspector: TextInspector },
  paragraph: { renderer: ParagraphField, inspector: TextInspector },
  number: { renderer: NumberField, inspector: NumberInspector },
  email: { renderer: EmailField, inspector: EmailInspector },
  phone: { renderer: PhoneField, inspector: PhoneInspector },
  date: { renderer: DateField, inspector: DateInspector },
};

export default fieldRegistry;

