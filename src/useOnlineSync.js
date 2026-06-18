import { useState, useEffect, useCallback } from 'react'
import { getPendientes, markSincronizado } from './db'

export function useOnlineSync(onSync) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState(null)

  const sincronizar = useCallback(async () => {
    if (!navigator.onLine) return
    const pendientes = await getPendientes()
    if (pendientes.length === 0) return

    setSyncing(true)
    for (const reporte of pendientes) {
      try {
        await new Promise(r => setTimeout(r, 800))
        await markSincronizado(reporte.id)
        if (onSync) onSync(reporte)
      } catch (err) {
        console.error('Error sincronizando reporte:', err)
      }
    }
    setSyncing(false)
    setLastSync(new Date())
  }, [onSync])

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      sincronizar()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    if (navigator.onLine) sincronizar()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [sincronizar])

  return { isOnline, syncing, lastSync, sincronizar }
}
