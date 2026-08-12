import { FormSchema } from "@/form-builder/types"

export type FormStatus = "draft" | "published" | "archived"

export interface FormMetadata {
  id: string
  name: string
  description: string
  status: FormStatus
  fieldCount: number
  createdAt: string
  updatedAt: string
  schemaVersion: number
  templateId?: string
  category?: string
  isTemplate?: boolean
}

export interface FormRepository {
  getAll(): Promise<FormMetadata[]>
  getById(id: string): Promise<FormSchema | null>
  create(form: FormSchema, status?: FormStatus): Promise<FormSchema>
  update(form: FormSchema, status?: FormStatus): Promise<void>
  delete(id: string): Promise<void>
  duplicate(id: string): Promise<FormSchema>
  archive(id: string): Promise<void>
}

export type SubmissionStatus = "draft" | "submitted"

export interface FormSubmission {
  id: string
  formId: string
  formVersion: number
  status: SubmissionStatus
  responses: Record<string, unknown>
  createdAt: string
  updatedAt: string
  submittedAt?: string
}

export interface SubmissionRepository {
  getAll(): Promise<FormSubmission[]>
  getById(id: string): Promise<FormSubmission | null>
  getByFormId(formId: string): Promise<FormSubmission[]>
  getDraftByFormId(formId: string): Promise<FormSubmission | null>
  create(submission: Partial<FormSubmission>): Promise<FormSubmission>
  update(submission: FormSubmission): Promise<FormSubmission>
  delete(id: string): Promise<boolean>
}
