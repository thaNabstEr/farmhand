"use client"

import * as React from "react"
import * as Icons from "lucide-react"
import { Panel } from "./Panel"
import { useFormBuilder } from "@/form-builder/state/FormBuilderContext"
import { fieldRegistry } from "@/form-builder/registry"
import { cn } from "@/lib/utils"
import { 
  PropertyInput, 
  PropertyTextarea, 
  PropertyToggle, 
  PropertySelect, 
  PropertyDivider 
} from "@/form-builder/components/inspector/PropertyControls"
import { Field } from "@/form-builder/types"

// Collapsible Section Wrapper
interface InspectorSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function InspectorSection({ title, isOpen, onToggle, children }: InspectorSectionProps) {
  return (
    <div className="border-b border-neutral-100 dark:border-neutral-800/80 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 px-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10 transition-colors text-left"
      >
        <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider select-none">
          {title}
        </span>
        <Icons.ChevronDown
          className={cn(
            "size-3.5 text-neutral-400 transition-transform duration-200 shrink-0",
            isOpen ? "transform rotate-0" : "transform -rotate-90"
          )}
        />
      </button>
      
      {isOpen && (
        <div className="px-4 pb-4.5 space-y-3.5 animate-in fade-in slide-in-from-top-1 duration-150">
          {children}
        </div>
      )}
    </div>
  )
}

export function Inspector() {
  const { state, updateField, selectField } = useFormBuilder()
  const { activeFieldId, schema } = state

  const [fieldSearchQuery, setFieldSearchQuery] = React.useState("")
  const [propertiesSearchQuery, setPropertiesSearchQuery] = React.useState("")
  const [isFieldSelectorOpen, setIsFieldSelectorOpen] = React.useState(false)

  // Collapsed states of sections, preserved across field selections
  const [openSections, setOpenSections] = React.useState({
    general: true,
    validation: true,
    appearance: false,
    offline: false,
    advanced: false,
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Get active field
  const selectedField = React.useMemo(() => {
    return schema.fields.find((f) => f.id === activeFieldId)
  }, [schema.fields, activeFieldId])

  // Scroll into view helper
  const scrollFieldIntoView = (fieldId: string) => {
    setTimeout(() => {
      const card = document.getElementById(`field-card-${fieldId}`)
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }, 100)
  }

  // Match helper for settings filtering
  const matchSetting = (label: string) => {
    if (!propertiesSearchQuery) return true
    return label.toLowerCase().includes(propertiesSearchQuery.toLowerCase())
  }

  if (!selectedField) {
    return (
      <Panel
        title="Inspector"
        widthClass="w-80"
        className="border-l"
        scrollable={false}
      >
        <div className="h-full flex flex-col items-center justify-center text-center p-6 select-none animate-fade-in">
          {/* Pulsing Sliders Icon Placeholder */}
          <div className="size-12 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800/40 text-neutral-450 dark:text-neutral-500 flex items-center justify-center mb-4 shadow-sm">
            <Icons.Sliders className="size-5.5 animate-pulse text-primary" />
          </div>
          
          <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
            Inspector
          </h4>
          
          <p className="mt-2 text-xs text-neutral-450 dark:text-neutral-500 font-medium max-w-[200px] leading-relaxed">
            Select a field to begin editing. Choose a field from the canvas to configure its behaviour.
          </p>
        </div>
      </Panel>
    )
  }

  // Filter fields in current schema
  const matchingFields = schema.fields.filter(
    (f) =>
      f.label.toLowerCase().includes(fieldSearchQuery.toLowerCase()) ||
      f.type.toLowerCase().includes(fieldSearchQuery.toLowerCase())
  )

  const handleFieldUpdate = (updates: Partial<Field>) => {
    updateField(selectedField.id, updates)
  }

  // Determine section visibilities based on settings query filter
  const showLabel = matchSetting("Label") || matchSetting("Field Label")
  const showDesc = matchSetting("Description") || matchSetting("Field Description")
  const showPlaceholder = matchSetting("Placeholder")
  const showHelp = matchSetting("Help Text") || matchSetting("Helper Text")
  const showRequired = matchSetting("Required") || matchSetting("Required Toggle")
  const isGeneralVisible = showLabel || showDesc || showPlaceholder || showHelp || showRequired

  // Validation
  const registryEntry = fieldRegistry[selectedField.type]
  const TypeSpecificInspector = registryEntry?.inspector
  const validationMatches =
    matchSetting("Required") ||
    matchSetting("Min") ||
    matchSetting("Max") ||
    matchSetting("Length") ||
    matchSetting("Value") ||
    matchSetting("Date") ||
    matchSetting("Format")
  const isValidationVisible = !!TypeSpecificInspector && validationMatches

  // Appearance
  const showWidth = matchSetting("Width") || matchSetting("Layout") || matchSetting("Half Width") || matchSetting("Full Width")
  const showHiddenLabel = matchSetting("Hidden Label") || matchSetting("Hide Label")
  const showReadOnly = matchSetting("Read Only")
  const isAppearanceVisible = showWidth || showHiddenLabel || showReadOnly

  // Offline
  const showOfflineRequired = matchSetting("Offline Required") || matchSetting("Offline")
  const showSync = matchSetting("Sync Behaviour") || matchSetting("Sync")
  const showConflict = matchSetting("Conflict Strategy") || matchSetting("Conflict")
  const isOfflineVisible = showOfflineRequired || showSync || showConflict

  // Advanced
  const showFieldId = matchSetting("Field ID") || matchSetting("ID")
  const showFieldType = matchSetting("Field Type") || matchSetting("Type")
  const showCreated = matchSetting("Created Date") || matchSetting("Created")
  const showUpdated = matchSetting("Updated Date") || matchSetting("Updated")
  const showVersion = matchSetting("Field Version") || matchSetting("Version")
  const isAdvancedVisible = showFieldId || showFieldType || showCreated || showUpdated || showVersion

  return (
    <Panel
      title="Inspector"
      widthClass="w-80"
      className="border-l animate-fade-in"
      scrollable={false}
    >
      {/* 1. Navigate Fields Search Selector */}
      <div className="px-4 pt-2 pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
        <label className="block mb-1 text-[9px] font-bold text-neutral-450 uppercase tracking-wider">
          Navigate Fields
        </label>
        
        <div className="relative">
          <button
            onClick={() => setIsFieldSelectorOpen(!isFieldSelectorOpen)}
            className="w-full flex items-center justify-between h-8 px-2.5 rounded-input border border-neutral-200 dark:border-neutral-850 bg-neutral-50/15 dark:bg-neutral-900/10 text-xs font-semibold hover:border-primary/45 transition-colors text-neutral-800 dark:text-neutral-200"
          >
            <span className="truncate">{selectedField.label}</span>
            <Icons.ChevronDown className="size-3.5 text-neutral-450 shrink-0" />
          </button>

          {isFieldSelectorOpen && (
            <>
              <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsFieldSelectorOpen(false)} />
              <div className="absolute left-0 w-full mt-1.5 bg-card border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg p-1.5 z-50 flex flex-col max-h-48 overflow-y-auto text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-neutral-100 dark:border-neutral-800 mb-1 shrink-0">
                  <Icons.Search className="size-3 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search fields..."
                    value={fieldSearchQuery}
                    onChange={(e) => setFieldSearchQuery(e.target.value)}
                    className="w-full bg-transparent outline-none border-none text-[11px] font-medium text-neutral-800 dark:text-neutral-100"
                  />
                </div>
                {matchingFields.length === 0 ? (
                  <div className="py-4 text-center text-[10px] text-neutral-400 font-semibold">
                    No fields found
                  </div>
                ) : (
                  matchingFields.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        selectField(f.id)
                        setIsFieldSelectorOpen(false)
                        setFieldSearchQuery("")
                        scrollFieldIntoView(f.id)
                      }}
                      className={cn(
                        "w-full px-2.5 py-2 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition-colors text-left font-medium truncate flex items-center justify-between text-[11px]",
                        f.id === activeFieldId ? "text-primary font-bold bg-primary/5" : "text-neutral-700 dark:text-neutral-300"
                      )}
                    >
                      <span>{f.label}</span>
                      <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-mono font-normal">{f.type}</span>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. Filter Properties Search Input */}
      <div className="px-4 py-2.5 border-b border-neutral-100 dark:border-neutral-800/80 shrink-0">
        <div className="flex items-center gap-2 px-2.5 h-8 rounded-input border border-neutral-200 dark:border-neutral-850 bg-neutral-50/20 dark:bg-neutral-900/10">
          <Icons.Search className="size-3.5 text-neutral-400 shrink-0" />
          <input
            type="text"
            placeholder="Search properties..."
            value={propertiesSearchQuery}
            onChange={(e) => setPropertiesSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-none border-none text-xs font-medium text-neutral-800 dark:text-neutral-100 placeholder-neutral-400"
          />
          {propertiesSearchQuery && (
            <button 
              onClick={() => setPropertiesSearchQuery("")} 
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5 text-xs font-bold"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* 3. Collapsible Sections Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* General Section */}
        {isGeneralVisible && (
          <InspectorSection
            title="General"
            isOpen={openSections.general}
            onToggle={() => toggleSection("general")}
          >
            {showLabel && (
              <PropertyInput
                label="Field Label"
                value={selectedField.label}
                onChange={(val) => handleFieldUpdate({ label: val })}
              />
            )}
            {showDesc && (
              <PropertyTextarea
                label="Description"
                value={selectedField.description}
                onChange={(val) => handleFieldUpdate({ description: val })}
              />
            )}
            {showPlaceholder && (
              <PropertyInput
                label="Placeholder"
                value={selectedField.placeholder}
                onChange={(val) => handleFieldUpdate({ placeholder: val })}
              />
            )}
            {showHelp && (
              <PropertyInput
                label="Help Text"
                value={selectedField.settings?.helperText}
                onChange={(val) => handleFieldUpdate({ settings: { helperText: val } })}
              />
            )}
            {showRequired && (
              <PropertyToggle
                label="Required Field"
                checked={selectedField.required}
                onChange={(val) => handleFieldUpdate({ required: val })}
                description="Make this input mandatory for inspection submission."
              />
            )}
          </InspectorSection>
        )}

        {/* Validation Section */}
        {isValidationVisible && TypeSpecificInspector && (
          <InspectorSection
            title="Validation"
            isOpen={openSections.validation}
            onToggle={() => toggleSection("validation")}
          >
            <TypeSpecificInspector
              field={selectedField}
              onChange={handleFieldUpdate}
              match={matchSetting}
            />
          </InspectorSection>
        )}

        {/* Appearance Section */}
        {isAppearanceVisible && (
          <InspectorSection
            title="Appearance"
            isOpen={openSections.appearance}
            onToggle={() => toggleSection("appearance")}
          >
            {showWidth && (
              <PropertySelect
                label="Field Layout Width"
                value={selectedField.settings?.width || "full"}
                onChange={(val) => handleFieldUpdate({ settings: { width: val as "full" | "half" } })}
                options={[
                  { label: "Full Width (100%)", value: "full" },
                  { label: "Half Width (50%)", value: "half" },
                ]}
              />
            )}
            {showHiddenLabel && (
              <PropertyToggle
                label="Hide Input Label"
                checked={!!selectedField.settings?.hiddenLabel}
                onChange={(val) => handleFieldUpdate({ settings: { hiddenLabel: val } })}
                description="Hides the text label during inspect preview layouts."
              />
            )}
            {showReadOnly && (
              <PropertyToggle
                label="Read Only Field"
                checked={!!selectedField.settings?.readOnly}
                onChange={(val) => handleFieldUpdate({ settings: { readOnly: val } })}
                description="Disable operator input edits for this question block."
              />
            )}
          </InspectorSection>
        )}

        {/* Offline Settings Section */}
        {isOfflineVisible && (
          <InspectorSection
            title="Offline Settings"
            isOpen={openSections.offline}
            onToggle={() => toggleSection("offline")}
          >
            {showOfflineRequired && (
              <PropertyToggle
                label="Offline Required"
                checked={!!selectedField.settings?.offlineRequired}
                onChange={() => {}}
                description="Offline syncing overrides default data constraints."
              />
            )}
            {showSync && (
              <PropertySelect
                label="Sync Behaviour"
                value={selectedField.settings?.syncBehaviour || "immediate"}
                onChange={() => {}}
                options={[
                  { label: "Sync Immediately", value: "immediate" },
                  { label: "Queue until Wi-Fi Connect", value: "wifi_only" },
                  { label: "Manual Operators Dispatch", value: "manual" },
                ]}
              />
            )}
            {showConflict && (
              <PropertySelect
                label="Conflict Strategy"
                value={selectedField.settings?.conflictStrategy || "client_wins"}
                onChange={() => {}}
                options={[
                  { label: "Client Wins (Offline Last)", value: "client_wins" },
                  { label: "Server Version Wins", value: "server_wins" },
                  { label: "Create Duplicate Copy", value: "duplicate" },
                ]}
              />
            )}
          </InspectorSection>
        )}

        {/* Advanced metadata section */}
        {isAdvancedVisible && (
          <InspectorSection
            title="Advanced metadata"
            isOpen={openSections.advanced}
            onToggle={() => toggleSection("advanced")}
          >
            {showFieldId && (
              <div className="flex flex-col select-all">
                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-0.5">Field ID</span>
                <span className="font-mono text-[10px] break-all bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/40 dark:border-neutral-800/40 p-1.5 rounded-md text-neutral-700 dark:text-neutral-300 font-semibold select-all cursor-text">
                  {selectedField.id}
                </span>
              </div>
            )}

            {showFieldType && (
              <div className="flex items-center justify-between text-xs py-1">
                <span className="font-semibold text-neutral-500 dark:text-neutral-400">Field Type</span>
                <span className="font-mono bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/40 dark:border-neutral-800/40 text-neutral-700 dark:text-neutral-350 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                  {selectedField.type}
                </span>
              </div>
            )}

            {showVersion && (
              <div className="flex items-center justify-between text-xs py-1">
                <span className="font-semibold text-neutral-500 dark:text-neutral-400">Field Version</span>
                <span className="font-mono bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/40 dark:border-neutral-800/40 text-neutral-700 dark:text-neutral-350 px-2 py-0.5 rounded text-[10px] font-bold">
                  v{selectedField.version || 1}
                </span>
              </div>
            )}

            <PropertyDivider />

            {showCreated && (
              <div className="flex flex-col text-xs space-y-0.5">
                <span className="font-semibold text-neutral-500 dark:text-neutral-400">Created Date</span>
                <span className="text-[10px] text-neutral-450 dark:text-neutral-500 font-medium">
                  {selectedField.createdAt ? new Date(selectedField.createdAt).toLocaleString() : "Initial Creation"}
                </span>
              </div>
            )}

            {showUpdated && (
              <div className="flex flex-col text-xs space-y-0.5 mt-2">
                <span className="font-semibold text-neutral-500 dark:text-neutral-400">Updated Date</span>
                <span className="text-[10px] text-neutral-450 dark:text-neutral-500 font-medium">
                  {selectedField.updatedAt ? new Date(selectedField.updatedAt).toLocaleString() : "No updates recorded"}
                </span>
              </div>
            )}
          </InspectorSection>
        )}
        
        {/* If searching hides everything */}
        {!isGeneralVisible && !isValidationVisible && !isAppearanceVisible && !isOfflineVisible && !isAdvancedVisible && (
          <div className="py-8 text-center text-[10px] text-neutral-400 font-medium px-4">
            No settings match your property filter query.
          </div>
        )}
      </div>
    </Panel>
  )
}

export default Inspector;
