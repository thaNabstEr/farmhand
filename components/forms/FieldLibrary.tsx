"use client"

import * as React from "react"
import { Panel } from "./Panel"
import { SearchBar } from "@/components/shared/SearchBar"
import { FieldCategory } from "./FieldCategory"
import { mockFieldLibrary, FieldDefinition } from "@/data/mock/fields"
import { useFormBuilder } from "@/form-builder/state/FormBuilderContext"
import { FieldType } from "@/form-builder/types"

export interface FieldLibraryProps {
  onSelectField?: (field: FieldDefinition) => void;
}

type CategoryType = FieldDefinition["category"];

export function FieldLibrary({ onSelectField }: FieldLibraryProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const { addField } = useFormBuilder();

  // Filter fields based on search query
  const filteredFields = mockFieldLibrary.filter(
    (field) =>
      field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group fields by category
  const categories: CategoryType[] = ["Basic", "Choices", "Media", "Location", "Advanced"];

  const getFieldsByCategory = (cat: CategoryType) => {
    return filteredFields.filter((f) => f.category === cat);
  };

  const handleFieldClick = (field: FieldDefinition) => {
    const supportedTypes: string[] = ["text", "number", "paragraph", "email", "phone", "date"];
    if (supportedTypes.includes(field.id)) {
      addField(field.id as FieldType);
    } else {
      onSelectField?.(field);
    }
  };

  return (
    <Panel
      title="Field Library"
      widthClass="w-80"
      className="border-r"
    >
      {/* Search Input wrapper */}
      <div className="pb-2">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search fields..."
          showShortcut={false}
          className="max-w-none"
        />
      </div>

      {/* Categorized Fields Lists */}
      <div className="space-y-6 pt-2">
        {categories.map((category) => {
          const fields = getFieldsByCategory(category);
          return (
            <FieldCategory
              key={category}
              title={category}
              fields={fields}
              onSelectField={handleFieldClick}
            />
          );
        })}
        {filteredFields.length === 0 && (
          <div className="text-center py-8 text-xs text-neutral-400 dark:text-neutral-500">
            No fields match your search.
          </div>
        )}
      </div>
    </Panel>
  )
}
export default FieldLibrary;
