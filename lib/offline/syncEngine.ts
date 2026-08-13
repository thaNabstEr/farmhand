import { offlineDB } from "./db"
import { supabaseSubmissionRepository } from "@/lib/repositories/SupabaseSubmissionRepository"
import { getSupabaseClient } from "@/lib/supabase/client"

export interface SyncEngineStatus {
  isOnline: boolean
  isSyncing: boolean
  pendingCount: number
  lastSyncTime: string | null
  lastError: string | null
}

type SyncListener = (status: SyncEngineStatus) => void

class SyncEngine {
  private isOnlineState: boolean = typeof navigator !== "undefined" ? navigator.onLine : true
  private isSyncingState: boolean = false
  private lastSyncTimeState: string | null = null
  private lastErrorState: string | null = null
  private listeners: Set<SyncListener> = new Set()

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => this.handleOnlineChange(true))
      window.addEventListener("offline", () => this.handleOnlineChange(false))

      // Trigger initial sync attempt on startup after 1s
      setTimeout(() => {
        this.processSyncQueue()
      }, 1000)
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener)
    this.notify()
    return () => this.listeners.delete(listener)
  }

  public getStatus(): SyncEngineStatus {
    return {
      isOnline: this.isOnlineState,
      isSyncing: this.isSyncingState,
      pendingCount: 0, // updated async when notified
      lastSyncTime: this.lastSyncTimeState,
      lastError: this.lastErrorState,
    }
  }

  private handleOnlineChange(online: boolean) {
    this.isOnlineState = online
    this.notify()
    if (online) {
      this.processSyncQueue()
    }
  }

  private async notify() {
    let pendingCount = 0
    try {
      const items = await offlineDB.getPendingQueueItems()
      pendingCount = items.length
    } catch {
      // ignore
    }

    const status: SyncEngineStatus = {
      isOnline: this.isOnlineState,
      isSyncing: this.isSyncingState,
      pendingCount,
      lastSyncTime: this.lastSyncTimeState,
      lastError: this.lastErrorState,
    }

    this.listeners.forEach((l) => l(status))
  }

  public async processSyncQueue(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncingState) return { synced: 0, failed: 0 }
    if (!this.isOnlineState) return { synced: 0, failed: 0 }

    const supabase = getSupabaseClient()
    if (!supabase) return { synced: 0, failed: 0 }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return { synced: 0, failed: 0 }
    }

    this.isSyncingState = true
    this.lastErrorState = null
    this.notify()

    let syncedCount = 0
    let failedCount = 0

    try {
      const queueItems = await offlineDB.getPendingQueueItems(session.user.id)

      for (const item of queueItems) {
        // Mark as syncing
        item.status = "syncing"
        item.lastAttempt = new Date().toISOString()
        await offlineDB.updateQueueItem(item)
        this.notify()

        try {
          // Perform idempotent remote submission
          await supabaseSubmissionRepository.createSubmission({
            formId: item.payload.formId,
            farmId: item.payload.farmId,
            fieldId: item.payload.fieldId,
            clientSubmissionId: item.clientSubmissionId,
            schemaSnapshot: item.payload.schemaSnapshot,
            responses: item.payload.responses,
            status: item.payload.status,
          })

          // Mark item as synced
          item.status = "synced"
          await offlineDB.updateQueueItem(item)

          // Update local draft syncStatus
          const localDraft = await offlineDB.getDraft(item.id)
          if (localDraft) {
            localDraft.syncStatus = "synced"
            await offlineDB.saveDraft(localDraft)
          }

          syncedCount++
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err)
          item.status = "failed"
          item.retryCount = (item.retryCount || 0) + 1
          item.lastError = msg
          await offlineDB.updateQueueItem(item)

          const localDraft = await offlineDB.getDraft(item.id)
          if (localDraft) {
            localDraft.syncStatus = "failed"
            await offlineDB.saveDraft(localDraft)
          }

          this.lastErrorState = `Sync error: ${msg}`
          failedCount++
        }
      }

      this.lastSyncTimeState = new Date().toISOString()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      this.lastErrorState = msg
    } finally {
      this.isSyncingState = false
      this.notify()
    }

    return { synced: syncedCount, failed: failedCount }
  }
}

export const syncEngine = new SyncEngine()
