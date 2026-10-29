const DB_NAME = 'et-operations'
const DB_VERSION = 1

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      resolve(null)
      return
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains('cache')) database.createObjectStore('cache')
      if (!database.objectStoreNames.contains('mutations')) database.createObjectStore('mutations', { keyPath: 'mutationId' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function transact(storeName, mode, operation) {
  const database = await openDatabase()
  if (!database) return undefined
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, mode)
    const store = transaction.objectStore(storeName)
    const request = operation(store)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const opsDb = {
  getCache(key) {
    return transact('cache', 'readonly', (store) => store.get(key))
  },
  setCache(key, value) {
    return transact('cache', 'readwrite', (store) => store.put(value, key))
  },
  getMutations() {
    return transact('mutations', 'readonly', (store) => store.getAll()).then((items) => items || [])
  },
  putMutation(mutation) {
    return transact('mutations', 'readwrite', (store) => store.put(mutation))
  },
  removeMutation(mutationId) {
    return transact('mutations', 'readwrite', (store) => store.delete(mutationId))
  },
}
