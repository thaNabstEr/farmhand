import * as React from "react"
import { TextField } from "../components/renderers/TextField"
import { NumberField } from "../components/renderers/NumberField"
import { ParagraphField } from "../components/renderers/ParagraphField"
import { EmailField } from "../components/renderers/EmailField"
import { PhoneField } from "../components/renderers/PhoneField"
import { DateField } from "../components/renderers/DateField"
import { FieldRendererProps } from "../types"

export const fieldRegistry: Record<string, React.ComponentType<FieldRendererProps>> = {
  text: TextField,
  number: NumberField,
  paragraph: ParagraphField,
  email: EmailField,
  phone: PhoneField,
  date: DateField,
};
export default fieldRegistry;
