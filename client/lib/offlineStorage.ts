interface OfflinePost {
  id: string
  title: string
  content: string
  author: string
  createdAt: string
  savedAt: number
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('portfolio-offline', 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore('posts', { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function savePostOffline(post: Omit<OfflinePost, 'savedAt'>): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('posts', 'readwrite')
    tx.objectStore('posts').put({ ...post, savedAt: Date.now() })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getOfflinePost(id: string): Promise<OfflinePost | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction('posts', 'readonly').objectStore('posts').get(id)
    req.onsuccess = () => resolve(req.result ?? null)
    req.onerror = () => reject(req.error)
  })
}

export async function getAllOfflinePosts(): Promise<OfflinePost[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction('posts', 'readonly').objectStore('posts').getAll()
    req.onsuccess = () => resolve(req.result ?? [])
    req.onerror = () => reject(req.error)
  })
}

export async function removeOfflinePost(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('posts', 'readwrite')
    tx.objectStore('posts').delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function isPostSavedOffline(id: string): Promise<boolean> {
  const post = await getOfflinePost(id)
  return post !== null
}
