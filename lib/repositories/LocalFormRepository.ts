import { FormSchema, Field } from "@/form-builder/types"
import { FormRepository, FormMetadata, FormStatus } from "./types"

const STORAGE_KEY = "farmhand_forms_v1"

interface StoredFormEntry {
  schema: FormSchema
  status: FormStatus
}

// Generate unique ID helper
export function generateUniqueId(prefix: string = "id"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// Deep clone schema with new IDs for duplication / template instantiation
export function cloneSchemaWithNewIds(original: FormSchema, newName?: string): FormSchema {
  const fieldIdMap: Record<string, string> = {}

  const newFields: Field[] = original.fields.map((field) => {
    const newFieldId = generateUniqueId(field.type)
    fieldIdMap[field.id] = newFieldId

    return {
      ...field,
      id: newFieldId,
      // If repeat group has child fields, re-id children
      settings: field.settings?.childFields
        ? {
            ...field.settings,
            childFields: field.settings.childFields.map((child) => ({
              ...child,
              id: generateUniqueId(child.type),
            })),
          }
        : field.settings,
    }
  })

  // Update target field IDs inside conditional logic
  const remappedFields = newFields.map((field) => {
    if (!field.logic?.conditions) return field

    const remappedConditions = field.logic.conditions.map((cond) => ({
      ...cond,
      id: generateUniqueId("cond"),
      fieldId: fieldIdMap[cond.fieldId] || cond.fieldId,
    }))

    return {
      ...field,
      logic: {
        ...field.logic,
        conditions: remappedConditions,
      },
    }
  })

  const now = new Date().toISOString()
  return {
    ...original,
    id: generateUniqueId("form"),
    name: newName || `${original.name} Copy`,
    version: 1,
    createdAt: now,
    updatedAt: now,
    fields: remappedFields,
  }
}

export class LocalFormRepository implements FormRepository {
  private getStorage(): Record<string, StoredFormEntry> {
    if (typeof window === "undefined") return {}
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return {}
      return JSON.parse(raw)
    } catch {
      return {}
    }
  }

  private setStorage(data: Record<string, StoredFormEntry>): void {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error("LocalFormRepository failed to save to localStorage", e)
    }
  }

  async getAll(): Promise<FormMetadata[]> {
    const data = this.getStorage()
    const list: FormMetadata[] = Object.values(data).map(({ schema, status }) => ({
      id: schema.id,
      name: schema.name,
      description: schema.description,
      status,
      fieldCount: schema.fields.length,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      schemaVersion: schema.version || 1,
    }))

    // Sort by updatedAt descending by default
    return list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  async getById(id: string): Promise<FormSchema | null> {
    const data = this.getStorage()
    return data[id]?.schema || null
  }

  async create(form: FormSchema, status: FormStatus = "draft"): Promise<FormSchema> {
    const data = this.getStorage()
    const now = new Date().toISOString()

    const preparedForm: FormSchema = {
      ...form,
      id: form.id || generateUniqueId("form"),
      createdAt: form.createdAt || now,
      updatedAt: now,
      version: form.version || 1,
    }

    data[preparedForm.id] = {
      schema: preparedForm,
      status,
    }

    this.setStorage(data)
    return preparedForm
  }

  async update(form: FormSchema, status?: FormStatus): Promise<void> {
    const data = this.getStorage()
    const existing = data[form.id]
    const now = new Date().toISOString()

    const updatedForm: FormSchema = {
      ...form,
      updatedAt: now,
    }

    data[form.id] = {
      schema: updatedForm,
      status: status || existing?.status || "draft",
    }

    this.setStorage(data)
  }

  async delete(id: string): Promise<void> {
    const data = this.getStorage()
    delete data[id]
    this.setStorage(data)
  }

  async duplicate(id: string): Promise<FormSchema> {
    const original = await this.getById(id)
    if (!original) throw new Error(`Form with id ${id} not found`)

    const cloned = cloneSchemaWithNewIds(original)
    return this.create(cloned, "draft")
  }

  async archive(id: string): Promise<void> {
    const data = this.getStorage()
    if (data[id]) {
      data[id].status = "archived"
      data[id].schema.updatedAt = new Date().toISOString()
      this.setStorage(data)
    }
  }
}

export const localFormRepository = new LocalFormRepository()
