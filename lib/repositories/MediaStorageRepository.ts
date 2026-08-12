/**
 * Local Media Storage Repository using IndexedDB
 * Safely persists photo Data URLs / Blobs across browser refreshes
 * without exceeding localStorage quotas.
 */

const DB_NAME = "farmhand_media_v1"
const STORE_NAME = "photos"
const DB_VERSION = 1

class MediaStorageRepository {
  private dbPromise: Promise<IDBDatabase | null> | null = null

  private getDB(): Promise<IDBDatabase | null> {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      return Promise.resolve(null)
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve) => {
        try {
          const request = indexedDB.open(DB_NAME, DB_VERSION)

          request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              db.createObjectStore(STORE_NAME)
            }
          }

          request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result)
          }

          request.onerror = () => {
            resolve(null)
          }
        } catch {
          resolve(null)
        }
      })
    }

    return this.dbPromise
  }

  async savePhoto(id: string, dataUrl: string): Promise<boolean> {
    const db = await this.getDB()
    if (!db) return false

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite")
        const store = tx.objectStore(STORE_NAME)
        const request = store.put(dataUrl, id)

        request.onsuccess = () => resolve(true)
        request.onerror = () => resolve(false)
      } catch {
        resolve(false)
      }
    })
  }

  async getPhoto(id: string): Promise<string | null> {
    const db = await this.getDB()
    if (!db) return null

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readonly")
        const store = tx.objectStore(STORE_NAME)
        const request = store.get(id)

        request.onsuccess = () => resolve(request.result || null)
        request.onerror = () => resolve(null)
      } catch {
        resolve(null)
      }
    })
  }

  async deletePhoto(id: string): Promise<boolean> {
    const db = await this.getDB()
    if (!db) return false

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite")
        const store = tx.objectStore(STORE_NAME)
        const request = store.delete(id)

        request.onsuccess = () => resolve(true)
        request.onerror = () => resolve(false)
      } catch {
        resolve(false)
      }
    })
  }
}

export const mediaStorageRepository = new MediaStorageRepository()
export default mediaStorageRepository
