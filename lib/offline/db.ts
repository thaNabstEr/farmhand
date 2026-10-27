import { FormSchema } from "@/form-builder/types"
import { Farm, Field } from "@/lib/repositories/SupabaseFarmRepository"
import { Farmer } from "@/lib/repositories/SupabaseFarmerRepository"
import { ProjectRecord } from "@/lib/repositories/SupabaseProjectRepository"

export interface CachedProjectForm {
  id: string
  projectId: string
  formId: string
}

export interface OfflineDraft {
  id: string
  remoteSubmissionId?: string
  userId: string
  formId: string | null
  farmerId?: string | null
  farmId: string | null
  fieldId: string | null
  projectId?: string | null
  farmerName?: string
  farmName?: string
  fieldName?: string
  formName?: string
  projectName?: string
  projectCode?: string
  responses: Record<string, unknown>
  status: "draft" | "submitted"
  schemaSnapshot: FormSchema
  createdAt: string
  updatedAt: string
  syncStatus: "pending" | "syncing" | "synced" | "failed"
}

export interface SyncQueueItem {
  id: string
  operationType: "create_submission" | "update_draft"
  clientSubmissionId: string
  userId: string
  payload: {
    formId: string | null
    farmerId?: string | null
    farmId: string | null
    fieldId: string | null
    projectId?: string | null
    schemaSnapshot: FormSchema
    responses: Record<string, unknown>
    status: "draft" | "submitted"
  }
  status: "pending" | "syncing" | "synced" | "failed"
  retryCount: number
  lastAttempt?: string
  lastError?: string
  createdAt: string
}

const DB_NAME = "farmhand_offline_db"
const DB_VERSION = 3 // Upgraded from v2 for Phase 8

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not supported in this environment."))
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Preserved stores from v1 & v2
      if (!db.objectStoreNames.contains("forms")) {
        db.createObjectStore("forms", { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains("farmers")) {
        db.createObjectStore("farmers", { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains("farms")) {
        db.createObjectStore("farms", { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains("fields")) {
        db.createObjectStore("fields", { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains("drafts")) {
        const store = db.createObjectStore("drafts", { keyPath: "id" })
        store.createIndex("userId", "userId", { unique: false })
      }
      if (!db.objectStoreNames.contains("sync_queue")) {
        const store = db.createObjectStore("sync_queue", { keyPath: "id" })
        store.createIndex("userId", "userId", { unique: false })
        store.createIndex("status", "status", { unique: false })
      }

      // Phase 8 Additions (v3)
      if (!db.objectStoreNames.contains("projects")) {
        db.createObjectStore("projects", { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains("project_forms")) {
        const store = db.createObjectStore("project_forms", { keyPath: "id" })
        store.createIndex("projectId", "projectId", { unique: false })
        store.createIndex("formId", "formId", { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Generic IndexedDB CRUD Helpers
async function getStore(storeName: string, mode: IDBTransactionMode) {
  const db = await openDB()
  const tx = db.transaction(storeName, mode)
  return tx.objectStore(storeName)
}

// In-memory fallback stores for non-browser Node test execution
const memoryStores: Record<string, Map<string, unknown>> = {
  forms: new Map(),
  farmers: new Map(),
  farms: new Map(),
  fields: new Map(),
  drafts: new Map(),
  sync_queue: new Map(),
  projects: new Map(),
  project_forms: new Map(),
}

export const offlineDB = {
  // CACHED FORMS
  async saveForm(form: FormSchema): Promise<void> {
    if (typeof window === "undefined" || !window.indexedDB) {
      memoryStores.forms.set(form.id, form)
      return
    }
    const store = await getStore("forms", "readwrite")
    store.put(form)
  },
  async getForm(id: string): Promise<FormSchema | null> {
    if (typeof window === "undefined" || !window.indexedDB) {
      return (memoryStores.forms.get(id) as FormSchema) || null
    }
    const store = await getStore("forms", "readonly")
    return new Promise((resolve) => {
      const req = store.get(id)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => resolve(null)
    })
  },
  async getAllForms(): Promise<FormSchema[]> {
    if (typeof window === "undefined" || !window.indexedDB) {
      return Array.from(memoryStores.forms.values()) as FormSchema[]
    }
    const store = await getStore("forms", "readonly")
    return new Promise((resolve) => {
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result || [])
      req.onerror = () => resolve([])
    })
  },

  // CACHED FARMERS
  async saveFarmers(farmers: Farmer[]): Promise<void> {
    if (typeof window === "undefined" || !window.indexedDB) {
      farmers.forEach((f) => memoryStores.farmers.set(f.id, f))
      return
    }
    const store = await getStore("farmers", "readwrite")
    farmers.forEach((f) => store.put(f))
  },
  async getAllFarmers(): Promise<Farmer[]> {
    if (typeof window === "undefined" || !window.indexedDB) {
      return Array.from(memoryStores.farmers.values()) as Farmer[]
    }
    const store = await getStore("farmers", "readonly")
    return new Promise((resolve) => {
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result || [])
      req.onerror = () => resolve([])
    })
  },
  async getFarmerById(id: string): Promise<Farmer | null> {
    if (typeof window === "undefined" || !window.indexedDB) {
      return (memoryStores.farmers.get(id) as Farmer) || null
    }
    const store = await getStore("farmers", "readonly")
    return new Promise((resolve) => {
      const req = store.get(id)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => resolve(null)
    })
  },

  // CACHED FARMS & FIELDS
  async saveFarms(farms: Farm[]): Promise<void> {
    if (typeof window === "undefined" || !window.indexedDB) {
      farms.forEach((f) => memoryStores.farms.set(f.id, f))
      return
    }
    const store = await getStore("farms", "readwrite")
    farms.forEach((f) => store.put(f))
  },
  async getAllFarms(): Promise<Farm[]> {
    if (typeof window === "undefined" || !window.indexedDB) {
      return Array.from(memoryStores.farms.values()) as Farm[]
    }
    const store = await getStore("farms", "readonly")
    return new Promise((resolve) => {
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result || [])
      req.onerror = () => resolve([])
    })
  },
  async saveFields(fields: Field[]): Promise<void> {
    if (typeof window === "undefined" || !window.indexedDB) {
      fields.forEach((f) => memoryStores.fields.set(f.id, f))
      return
    }
    const store = await getStore("fields", "readwrite")
    fields.forEach((f) => store.put(f))
  },
  async getFieldsByFarm(farmId: string): Promise<Field[]> {
    if (typeof window === "undefined" || !window.indexedDB) {
      const all = Array.from(memoryStores.fields.values()) as Field[]
      return all.filter((f) => f.farm_id === farmId)
    }
    const store = await getStore("fields", "readonly")
    return new Promise((resolve) => {
      const req = store.getAll()
      req.onsuccess = () => {
        const all: Field[] = req.result || []
        resolve(all.filter((f) => f.farm_id === farmId))
      }
      req.onerror = () => resolve([])
    })
  },

  // CACHED PROJECTS (Phase 8)
  async saveProjects(projects: ProjectRecord[]): Promise<void> {
    if (typeof window === "undefined" || !window.indexedDB) {
      projects.forEach((p) => memoryStores.projects.set(p.id, p))
      return
    }
    const store = await getStore("projects", "readwrite")
    projects.forEach((p) => store.put(p))
  },
  async getAllProjects(): Promise<ProjectRecord[]> {
    if (typeof window === "undefined" || !window.indexedDB) {
      return Array.from(memoryStores.projects.values()) as ProjectRecord[]
    }
    const store = await getStore("projects", "readonly")
    return new Promise((resolve) => {
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result || [])
      req.onerror = () => resolve([])
    })
  },
  async getProjectById(id: string): Promise<ProjectRecord | null> {
    if (typeof window === "undefined" || !window.indexedDB) {
      return (memoryStores.projects.get(id) as ProjectRecord) || null
    }
    const store = await getStore("projects", "readonly")
    return new Promise((resolve) => {
      const req = store.get(id)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => resolve(null)
    })
  },
  async getActiveProjects(): Promise<ProjectRecord[]> {
    const all = await this.getAllProjects()
    return all.filter((p) => p.status === "active")
  },

  // CACHED PROJECT FORMS (Phase 8)
  async saveProjectForms(items: CachedProjectForm[]): Promise<void> {
    if (typeof window === "undefined" || !window.indexedDB) {
      items.forEach((item) => memoryStores.project_forms.set(item.id, item))
      return
    }
    const store = await getStore("project_forms", "readwrite")
    items.forEach((item) => store.put(item))
  },
  async getProjectForms(projectId: string): Promise<CachedProjectForm[]> {
    if (typeof window === "undefined" || !window.indexedDB) {
      const all = Array.from(memoryStores.project_forms.values()) as CachedProjectForm[]
      return all.filter((pf) => pf.projectId === projectId)
    }
    const store = await getStore("project_forms", "readonly")
    return new Promise((resolve) => {
      const req = store.getAll()
      req.onsuccess = () => {
        const all: CachedProjectForm[] = req.result || []
        resolve(all.filter((pf) => pf.projectId === projectId))
      }
      req.onerror = () => resolve([])
    })
  },

  // DRAFTS
  async saveDraft(draft: OfflineDraft): Promise<void> {
    if (typeof window === "undefined" || !window.indexedDB) {
      memoryStores.drafts.set(draft.id, draft)
      return
    }
    const store = await getStore("drafts", "readwrite")
    store.put(draft)
  },
  async getDraft(id: string): Promise<OfflineDraft | null> {
    if (typeof window === "undefined" || !window.indexedDB) {
      return (memoryStores.drafts.get(id) as OfflineDraft) || null
    }
    const store = await getStore("drafts", "readonly")
    return new Promise((resolve) => {
      const req = store.get(id)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => resolve(null)
    })
  },
  async getAllDrafts(userId?: string): Promise<OfflineDraft[]> {
    if (typeof window === "undefined" || !window.indexedDB) {
      const all = Array.from(memoryStores.drafts.values()) as OfflineDraft[]
      if (userId) return all.filter((d) => d.userId === userId)
      return all
    }
    const store = await getStore("drafts", "readonly")
    return new Promise((resolve) => {
      const req = store.getAll()
      req.onsuccess = () => {
        const all: OfflineDraft[] = req.result || []
        if (userId) resolve(all.filter((d) => d.userId === userId))
        else resolve(all)
      }
      req.onerror = () => resolve([])
    })
  },

  // SYNC QUEUE
  async addToSyncQueue(item: SyncQueueItem): Promise<void> {
    if (typeof window === "undefined" || !window.indexedDB) {
      memoryStores.sync_queue.set(item.id, item)
      return
    }
    const store = await getStore("sync_queue", "readwrite")
    store.put(item)
  },
  async getPendingQueueItems(userId?: string): Promise<SyncQueueItem[]> {
    if (typeof window === "undefined" || !window.indexedDB) {
      const all = Array.from(memoryStores.sync_queue.values()) as SyncQueueItem[]
      const filtered = all.filter((i) => i.status === "pending" || i.status === "failed")
      if (userId) return filtered.filter((i) => i.userId === userId)
      return filtered
    }
    const store = await getStore("sync_queue", "readonly")
    return new Promise((resolve) => {
      const req = store.getAll()
      req.onsuccess = () => {
        const all: SyncQueueItem[] = req.result || []
        const filtered = all.filter((i) => i.status === "pending" || i.status === "failed")
        if (userId) resolve(filtered.filter((i) => i.userId === userId))
        else resolve(filtered)
      }
      req.onerror = () => resolve([])
    })
  },
  async updateQueueItem(item: SyncQueueItem): Promise<void> {
    if (typeof window === "undefined" || !window.indexedDB) {
      memoryStores.sync_queue.set(item.id, item)
      return
    }
    const store = await getStore("sync_queue", "readwrite")
    store.put(item)
  },
  async removeQueueItem(id: string): Promise<void> {
    if (typeof window === "undefined" || !window.indexedDB) {
      memoryStores.sync_queue.delete(id)
      return
    }
    const store = await getStore("sync_queue", "readwrite")
    store.delete(id)
  },
}
