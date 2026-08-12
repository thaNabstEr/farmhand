"use client"

import * as React from "react"
import { AlertTriangle, Calculator, Plus, Minus, X, Divide, Percent } from "lucide-react"
import { Field, FieldCalculation } from "@/form-builder/types"
import { useFormBuilder } from "@/form-builder/state/FormBuilderContext"
import { PropertyInput, PropertyToggle } from "./PropertyControls"
import { detectCircularReferences } from "@/lib/calculations/engine"
import { cn } from "@/lib/utils"

export interface CalculationSectionProps {
  field: Field;
  onChange: (updates: Partial<Field>) => void;
  match: (label: string) => boolean;
}

export function CalculationSection({ field, onChange, match }: CalculationSectionProps) {
  const { state } = useFormBuilder()
  const { schema } = state

  const calculation = field.calculation || {
    enabled: true,
    expression: "",
    unit: "",
  }

  // Filter numeric and calculated fields available for formula insertion
  const numericFields = React.useMemo(() => {
    return schema.fields.filter(
      (f) => f.id !== field.id && (f.type === "number" || f.type === "calculated")
    )
  }, [schema.fields, field.id])

  // Check for circular reference loop
  const circularCycle = React.useMemo(() => {
    return detectCircularReferences(schema)
  }, [schema])

  const handleUpdate = (updates: Partial<FieldCalculation>) => {
    onChange({
      calculation: {
        ...calculation,
        ...updates,
      },
    })
  }

  const handleInsertToken = (tokenStr: string) => {
    const current = calculation.expression || ""
    const newExpr = current ? `${current} ${tokenStr}` : tokenStr
    handleUpdate({ expression: newExpr })
  }

  const showCalc = match("Calculation") || match("Formula") || match("Calculated Field")
  if (!showCalc) return null

  return (
    <div className="space-y-3.5">
      {/* Circular Reference Warning Banner */}
      {circularCycle && circularCycle.includes(field.id) && (
        <div className="p-3 rounded-card border border-red-500/80 bg-red-500/10 text-red-600 dark:text-red-400 space-y-1 text-xs font-semibold animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="size-4 shrink-0" />
            <span>Circular Calculation Error</span>
          </div>
          <p className="text-[10px] font-normal leading-normal opacity-90">
            Formula loop detected: {circularCycle.join(" → ")}. Please remove circular references.
          </p>
        </div>
      )}

      {/* Unit Input */}
      <PropertyInput
        label="Result Unit Label"
        placeholder="e.g. hectares, kg, $, hours"
        value={calculation.unit}
        onChange={(val) => handleUpdate({ unit: val })}
        hint="Optional suffix"
      />

      {/* Expression Input */}
      <PropertyInput
        label="Formula Expression"
        placeholder="e.g. length * width"
        value={calculation.expression}
        onChange={(val) => handleUpdate({ expression: val })}
      />

      {/* Operator Quick Insert Tokens */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
          Quick Operators
        </span>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: "+", token: "+" },
            { label: "-", token: "-" },
            { label: "×", token: "*" },
            { label: "÷", token: "/" },
            { label: "%", token: "%" },
            { label: "(", token: "(" },
            { label: ")", token: ")" },
          ].map((op) => (
            <button
              key={op.label}
              type="button"
              onClick={() => handleInsertToken(op.token)}
              className="px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-750 text-neutral-800 dark:text-neutral-100 font-mono text-xs font-bold transition-colors"
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      {/* Numeric Field Quick Insert Tokens */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
          Insert Numeric Field
        </span>
        {numericFields.length === 0 ? (
          <div className="p-2.5 rounded bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/50 text-[10px] text-neutral-400 font-medium">
            Add number fields to your form to insert them into formulas.
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto scrollbar-thin">
            {numericFields.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => handleInsertToken(`[${f.id}]`)}
                className="w-full px-2.5 py-1.5 rounded bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-800 text-left text-xs font-medium text-neutral-800 dark:text-neutral-200 transition-colors flex items-center justify-between"
              >
                <span className="truncate">{f.label}</span>
                <span className="font-mono text-[9px] text-neutral-400">[{f.id}]</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CalculationSection;
