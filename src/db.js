// ── IndexedDB: almacenamiento offline ────────────────────────────────────────
const DB_NAME = 'reportes-imss'
const DB_VERSION = 1
 
export function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      // Reportes guardados localmente
      if (!db.objectStoreNames.contains('reportes')) {
        const store = db.createObjectStore('reportes', { keyPath: 'id', autoIncrement: true })
        store.createIndex('status', 'status', { unique: false })
        store.createIndex('os', 'os', { unique: false })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
 
export async function saveReporte(reporte) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('reportes', 'readwrite')
    const store = tx.objectStore('reportes')
    const data = {
      ...reporte,
      status: 'pendiente', // pendiente | sincronizado
      savedAt: new Date().toISOString(),
    }
    const req = store.add(data)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
 
export async function getPendientes() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('reportes', 'readonly')
    const store = tx.objectStore('reportes')
    const index = store.index('status')
    const req = index.getAll('pendiente')
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
 
export async function markSincronizado(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('reportes', 'readwrite')
    const store = tx.objectStore('reportes')
    const req = store.get(id)
    req.onsuccess = () => {
      const data = req.result
      data.status = 'sincronizado'
      data.syncedAt = new Date().toISOString()
      store.put(data)
      resolve()
    }
    req.onerror = () => reject(req.error)
  })
}
 
export async function getAllReportes() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('reportes', 'readonly')
    const store = tx.objectStore('reportes')
    const req = store.getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
 
