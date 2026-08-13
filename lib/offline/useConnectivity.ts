import * as React from "react"
import { syncEngine, SyncEngineStatus } from "./syncEngine"

export function useConnectivity() {
  const [status, setStatus] = React.useState<SyncEngineStatus>(syncEngine.getStatus())

  React.useEffect(() => {
    const unsubscribe = syncEngine.subscribe((newStatus) => {
      setStatus(newStatus)
    })
    return () => unsubscribe()
  }, [])

  const triggerSync = React.useCallback(async () => {
    return await syncEngine.processSyncQueue()
  }, [])

  return {
    ...status,
    triggerSync,
  }
}
