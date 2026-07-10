import * as React from "react"
import { SectionTitle } from "./SectionTitle"
import { FieldCard } from "./FieldCard"
import { FieldDefinition } from "@/data/mock/fields"
import { DraggableField } from "@/form-builder/components/dnd/DraggableField"

export interface FieldCategoryProps {
  title: string;
  fields: FieldDefinition[];
  onSelectField?: (field: FieldDefinition) => void;
}

export function FieldCategory({ title, fields, onSelectField }: FieldCategoryProps) {
  if (fields.length === 0) return null;

  return (
    <div className="space-y-2">
      <SectionTitle>{title}</SectionTitle>
      <div className="grid grid-cols-1 gap-2">
        {fields.map((field) => (
          <DraggableField
            key={field.id}
            id={field.id}
            fieldType={field.id}
          >
            <FieldCard
              label={field.label}
              description={field.description}
              iconName={field.iconName}
              onClick={() => onSelectField?.(field)}
            />
          </DraggableField>
        ))}
      </div>
    </div>
  )
}
export default FieldCategory
