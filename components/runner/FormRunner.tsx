"use client"

import * as React from "react"
import { Play, RotateCcw, AlertTriangle } from "lucide-react"
import { FormSchema } from "@/form-builder/types"
import { fieldRegistry } from "@/form-builder/registry"
import { RunnerHeader } from "./RunnerHeader"
import { RunnerField } from "./RunnerField"
import { RunnerActions } from "./RunnerActions"
import { SuccessState } from "./SuccessState"
import { Button } from "@/components/ui/button"

import { evaluateFormLogic } from "@/lib/logic/engine"
import { evaluateExpression } from "@/lib/calculations/engine"
import { FormSubmission } from "@/lib/repositories/types"
import { localSubmissionRepository } from "@/lib/repositories/LocalSubmissionRepository"
import { SubmissionDetailDialog } from "@/components/submissions/SubmissionDetailDialog"

export interface FormRunnerProps {
  schema: FormSchema
  mode?: "preview" | "fill"
  submissionId?: string
  onReturnToBuilder?: () => void
  onBackToForms?: () => void
  onViewSubmissions?: () => void
  onRegisterReset?: (resetFn: () => void) => void
}

export function FormRunner({
  schema,
  mode = "preview",
  submissionId,
  onReturnToBuilder,
  onBackToForms,
  onViewSubmissions,
  onRegisterReset,
}: FormRunnerProps) {
  // Current active submission object
  const [currentSubmission, setCurrentSubmission] = React.useState<FormSubmission | null>(null)
  
  // Unfinished draft recovery option
  const [unfinishedDraft, setUnfinishedDraft] = React.useState<FormSubmission | null>(null)
  const [hasPromptedDraft, setHasPromptedDraft] = React.useState(false)

  // Save status badge for fill mode
  const [saveStatus, setSaveStatus] = React.useState<"saved" | "saving" | "unsaved">("saved")

  // Isolated response state mapping fieldId -> answer
  const [responses, setResponses] = React.useState<Record<string, unknown>>({})
  
  // Isolated validation errors state mapping fieldId -> error message
  const [errors, setErrors] = React.useState<Record<string, string | null>>({})
  
  // Local submission completion state
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  // Inspection modal for submitted record
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)

  // Map of field DOM refs for auto-focusing invalid inputs
  const fieldRefs = React.useRef<Record<string, HTMLDivElement | null>>({})

  // Initial load: setup submission or detect draft in fill mode
  React.useEffect(() => {
    if (mode !== "fill") return

    const initializeFillMode = async () => {
      if (submissionId) {
        const existing = await localSubmissionRepository.getById(submissionId)
        if (existing) {
          setCurrentSubmission(existing)
          setResponses(existing.responses || {})
          if (existing.status === "submitted") {
            setIsSubmitted(true)
          }
          setHasPromptedDraft(true)
          return
        }
      }

      // Check for existing unfinished draft
      const draft = await localSubmissionRepository.getDraftByFormId(schema.id)
      if (draft && Object.keys(draft.responses || {}).length > 0 && !hasPromptedDraft) {
        setUnfinishedDraft(draft)
      } else if (!currentSubmission) {
        // Create new draft
        const newSub = await localSubmissionRepository.create({
          formId: schema.id,
          formVersion: schema.version || 1,
          status: "draft",
          responses: {},
        })
        setCurrentSubmission(newSub)
        setResponses({})
        setHasPromptedDraft(true)
      }
    }

    initializeFillMode()
  }, [mode, schema.id, schema.version, submissionId, hasPromptedDraft, currentSubmission])

  // Continue unfinished draft callback
  const handleContinueDraft = () => {
    if (!unfinishedDraft) return
    setCurrentSubmission(unfinishedDraft)
    setResponses(unfinishedDraft.responses || {})
    setUnfinishedDraft(null)
    setHasPromptedDraft(true)
  }

  // Start new submission callback (ignoring existing draft)
  const handleStartNewSubmission = React.useCallback(async () => {
    setUnfinishedDraft(null)
    const newSub = await localSubmissionRepository.create({
      formId: schema.id,
      formVersion: schema.version || 1,
      status: "draft",
      responses: {},
    })
    setCurrentSubmission(newSub)
    setResponses({})
    setErrors({})
    setIsSubmitted(false)
    setHasPromptedDraft(true)
  }, [schema.id, schema.version])

  // 400ms Debounced Autosave for Fill Mode
  React.useEffect(() => {
    if (mode !== "fill" || !currentSubmission || currentSubmission.status === "submitted" || isSubmitted) return

    setSaveStatus("saving")
    const timer = setTimeout(async () => {
      try {
        const updated = await localSubmissionRepository.update({
          ...currentSubmission,
          responses,
          status: "draft",
        })
        setCurrentSubmission(updated)
        setSaveStatus("saved")
      } catch {
        setSaveStatus("unsaved")
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [responses, mode, currentSubmission, isSubmitted])

  // Evaluate form logic (visibility and required flags)
  const computedState = React.useMemo(() => {
    return evaluateFormLogic(schema, responses)
  }, [schema, responses])

  // Cleanup response state when fields become hidden
  React.useEffect(() => {
    setResponses((prev) => {
      let changed = false
      const next = { ...prev }
      schema.fields.forEach((field) => {
        const isVisible = computedState[field.id]?.isVisible !== false
        if (!isVisible && next[field.id] !== undefined) {
          delete next[field.id]
          changed = true
        }
      })
      return changed ? next : prev
    })
  }, [computedState, schema.fields])

  // Real-time Calculation Engine updates
  React.useEffect(() => {
    const calcFields = schema.fields.filter((f) => f.type === "calculated" && f.calculation?.expression)
    if (calcFields.length === 0) return

    setResponses((prev) => {
      let changed = false
      const next = { ...prev }
      calcFields.forEach((field) => {
        const isVisible = computedState[field.id]?.isVisible !== false
        if (isVisible) {
          const computedVal = evaluateExpression(field.calculation!.expression, prev, schema)
          if (next[field.id] !== computedVal) {
            next[field.id] = computedVal
            changed = true
          }
        }
      })
      return changed ? next : prev
    })
  }, [schema, schema.fields, responses, computedState])

  // Reset helper
  const handleReset = React.useCallback(() => {
    setResponses({})
    setErrors({})
    setIsSubmitted(false)
    if (mode === "fill") {
      handleStartNewSubmission()
    }
  }, [mode, handleStartNewSubmission])

  // Register reset callback with parent toolbar
  React.useEffect(() => {
    if (onRegisterReset) {
      onRegisterReset(handleReset)
    }
  }, [onRegisterReset, handleReset])

  // Visible input fields
  const visibleInputFields = React.useMemo(() => {
    return schema.fields.filter((f) => {
      if (f.type === "section" || f.type === "divider") return false
      return computedState[f.id]?.isVisible !== false
    })
  }, [schema.fields, computedState])

  // Calculate visible field answer count
  const completedCount = React.useMemo(() => {
    return visibleInputFields.filter((f) => {
      const val = responses[f.id]
      if (val === undefined || val === null || val === "") return false
      if (Array.isArray(val) && val.length === 0) return false
      return true
    }).length
  }, [visibleInputFields, responses])

  // Calculate if all required visible fields are filled out
  const isReady = React.useMemo(() => {
    const requiredFields = visibleInputFields.filter((f) => computedState[f.id]?.isRequired)
    if (requiredFields.length === 0) return completedCount > 0
    return requiredFields.every((f) => {
      const val = responses[f.id]
      if (val === undefined || val === null || val === "") return false
      if (Array.isArray(val) && val.length === 0) return false
      return true
    })
  }, [visibleInputFields, responses, completedCount, computedState])

  // Handle individual response changes
  const handleFieldChange = (fieldId: string, val: unknown) => {
    setResponses((prev) => ({
      ...prev,
      [fieldId]: val,
    }))

    // Clear error for field on change if present
    if (errors[fieldId]) {
      setErrors((prev) => ({
        ...prev,
        [fieldId]: null,
      }))
    }
  }

  // Handle form submission and validation
  const handleSubmit = async () => {
    const newErrors: Record<string, string | null> = {}
    let firstInvalidId: string | null = null

    schema.fields.forEach((field) => {
      const isVisible = computedState[field.id]?.isVisible !== false
      if (!isVisible) return // Skip hidden fields

      const isRequired = computedState[field.id]?.isRequired
      const effectiveField = { ...field, required: isRequired }
      const validator = fieldRegistry[field.type]?.validate
      const value = responses[field.id]
      
      let errorMsg: string | null = null
      if (validator) {
        errorMsg = validator(effectiveField, value)
      } else if (isRequired) {
        if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
          errorMsg = "This field is required."
        }
      }

      if (errorMsg) {
        newErrors[field.id] = errorMsg
        if (!firstInvalidId) {
          firstInvalidId = field.id
        }
      }
    })

    setErrors(newErrors)

    // If validation fails, auto-focus first invalid field
    if (firstInvalidId) {
      const el = fieldRefs.current[firstInvalidId]
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
        const input = el.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
          "input, textarea, select, button"
        )
        if (input) {
          setTimeout(() => input.focus(), 150)
        }
      }
      return
    }

    // Persist as submitted record if in fill mode
    if (mode === "fill") {
      const subToUpdate = currentSubmission || (await localSubmissionRepository.create({ formId: schema.id }))
      const finalSub = await localSubmissionRepository.update({
        ...subToUpdate,
        status: "submitted",
        responses,
        submittedAt: new Date().toISOString(),
      })
      setCurrentSubmission(finalSub)
    }

    setIsSubmitted(true)
  }

  // Unfinished Draft Recovery Prompt Banner
  if (unfinishedDraft && mode === "fill") {
    const draftDate = new Date(unfinishedDraft.updatedAt).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    })

    return (
      <div className="bg-card rounded-card border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 p-8 text-center space-y-5 max-w-md mx-auto my-12 shadow-card animate-in fade-in duration-200">
        <div className="size-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
          <AlertTriangle className="size-6" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
            Unfinished Draft Found
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium leading-relaxed">
            You have a saved draft for &quot;{schema.name}&quot; from {draftDate}. Would you like to continue editing or start a new submission?
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <Button type="button" onClick={handleContinueDraft} className="w-full sm:w-auto h-9 font-bold text-xs gap-1.5">
            <Play className="size-3.5 fill-current" />
            <span>Continue Unfinished Draft</span>
          </Button>

          <Button type="button" variant="outline" onClick={handleStartNewSubmission} className="w-full sm:w-auto h-9 font-semibold text-xs border-neutral-300 dark:border-neutral-700">
            <RotateCcw className="size-3.5" />
            <span>Start New</span>
          </Button>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <>
        <SuccessState
          formName={schema.name}
          onViewSubmission={() => setIsDetailOpen(true)}
          onViewSubmissions={onViewSubmissions}
          onStartAnother={handleStartNewSubmission}
          onBackToForms={onBackToForms || onReturnToBuilder}
        />

        <SubmissionDetailDialog
          submission={currentSubmission}
          formSchema={schema}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
        />
      </>
    )
  }

  const visibleFields = schema.fields.filter((f) => computedState[f.id]?.isVisible !== false)

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12 animate-fade-in">
      {/* Form Header */}
      <RunnerHeader schema={schema} mode={mode} saveStatus={saveStatus} />

      {/* Fields List */}
      <div className="space-y-4 w-full">
        {visibleFields.length === 0 ? (
          <div className="bg-card rounded-card border border-neutral-200/80 dark:border-neutral-850 p-8 text-center text-xs text-neutral-400 font-medium">
            No visible fields in this form.
          </div>
        ) : (
          visibleFields.map((field) => {
            const effectiveField = {
              ...field,
              required: computedState[field.id]?.isRequired ?? field.required,
            }

            return (
              <RunnerField
                key={field.id}
                field={effectiveField}
                value={responses[field.id]}
                onChange={(val) => handleFieldChange(field.id, val)}
                error={errors[field.id]}
                inputRef={(el) => {
                  fieldRefs.current[field.id] = el
                }}
              />
            )
          })
        )}
      </div>

      {/* Form Bottom Actions */}
      {visibleFields.length > 0 && (
        <RunnerActions
          completedCount={completedCount}
          totalCount={visibleInputFields.length}
          isReady={isReady}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

export default FormRunner;
