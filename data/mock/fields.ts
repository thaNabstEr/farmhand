import * as Icons from "lucide-react"

export interface FieldDefinition {
  id: string;
  label: string;
  category: "Basic" | "Choices" | "Media" | "Location" | "Advanced";
  iconName: keyof typeof Icons;
  description: string;
}

export const mockFieldLibrary: FieldDefinition[] = [
  // Basic
  {
    id: "text",
    label: "Text",
    category: "Basic",
    iconName: "Type",
    description: "Single line text input for short answers"
  },
  {
    id: "paragraph",
    label: "Paragraph",
    category: "Basic",
    iconName: "AlignLeft",
    description: "Multi-line text input for detailed notes"
  },
  {
    id: "number",
    label: "Number",
    category: "Basic",
    iconName: "Hash",
    description: "Numeric inputs, quantities, or measurements"
  },
  {
    id: "email",
    label: "Email",
    category: "Basic",
    iconName: "Mail",
    description: "Valid email address validation input"
  },
  {
    id: "phone",
    label: "Phone",
    category: "Basic",
    iconName: "Phone",
    description: "Telephone number formatted input"
  },
  {
    id: "date",
    label: "Date",
    category: "Basic",
    iconName: "Calendar",
    description: "Pick calendar day, month, and year"
  },
  {
    id: "time",
    label: "Time",
    category: "Basic",
    iconName: "Clock",
    description: "Select specific hour and minutes"
  },

  // Choices
  {
    id: "dropdown",
    label: "Dropdown",
    category: "Choices",
    iconName: "ChevronDown",
    description: "Choose one option from a dropdown menu"
  },
  {
    id: "radio",
    label: "Radio Buttons",
    category: "Choices",
    iconName: "CircleDot",
    description: "Choose one option from a visible list"
  },
  {
    id: "checkboxes",
    label: "Checkboxes",
    category: "Choices",
    iconName: "CheckSquare",
    description: "Select multiple options from a list"
  },

  // Media
  {
    id: "photo",
    label: "Photo",
    category: "Media",
    iconName: "Camera",
    description: "Capture with device camera or upload image"
  },
  {
    id: "signature",
    label: "Signature",
    category: "Media",
    iconName: "PenTool",
    description: "Handwritten signature authorization pad"
  },
  {
    id: "barcode",
    label: "Barcode",
    category: "Media",
    iconName: "Barcode",
    description: "Scan product barcodes via camera"
  },
  {
    id: "qrcode",
    label: "QR Code",
    category: "Media",
    iconName: "QrCode",
    description: "Scan QR codes for links or registry lookups"
  },

  // Location
  {
    id: "gps",
    label: "GPS Point",
    category: "Location",
    iconName: "MapPin",
    description: "Record precise GPS coordinates"
  },
  {
    id: "map",
    label: "Map",
    category: "Location",
    iconName: "Map",
    description: "Geographic plot boundaries or path mapping"
  },

  // Advanced
  {
    id: "section",
    label: "Section",
    category: "Advanced",
    iconName: "Layout",
    description: "Organize form fields into collapsible sections"
  },
  {
    id: "repeat_group",
    label: "Repeat Group",
    category: "Advanced",
    iconName: "Repeat",
    description: "A block of fields that repeats dynamically"
  },
  {
    id: "divider",
    label: "Divider",
    category: "Advanced",
    iconName: "Minus",
    description: "Visual layout rule separating sections"
  }
];
