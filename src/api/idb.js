const DB_NAME = 'tour_game_db'
const DB_VERSION = 1
let DB

export default class IndexedDB {
  constructor (stores) {
    this.stores = stores
  }

  getDb () {
    return new Promise((resolve, reject) => {
      if (DB) return resolve(DB)

      const request = window.indexedDB.open(DB_NAME, DB_VERSION)
      
      request.onerror = e => {
        console.error('Error opening db', e)
        reject('Error')
      }

      request.onsuccess = e => {
        DB = e.target.result
        resolve(DB)
      }
        
      request.onupgradeneeded = e => {
        const db = e.target.result
        for (let store of this.stores) {
          db.createObjectStore(store, { autoIncrement: true, keyPath: 'id' })
        }
      }
    })
  }
  
  async getStore (storeName) {
    const db = await this.getDb()

    return new Promise(resolve => {
      const trans = db.transaction([storeName], 'readonly')
      trans.oncomplete = () => {
        resolve(data)
      }
      
      const store = trans.objectStore(storeName)
      const data = []
            
      store.openCursor().onsuccess = e => {
        const cursor = e.target.result
        if (cursor) {
          data.push(cursor.value)
          cursor.continue()
        }
      }
    })
  }
  
  async saveData (storeName, data) {
    const db = await this.getDb()

    return new Promise((resolve, reject) => {
      const trans = db.transaction([storeName], 'readwrite')

      const store = trans.objectStore(storeName)
      const request = store.add(data)

      request.onerror = e => {
        console.error('Error saving data', e)
        reject('Error')
      }

      request.onsuccess = e => {
        resolve(e.target.result)
      }
    })
  }

  async updateData (storeName, data) {
    const db = await this.getDb()

    return new Promise((resolve, reject) => {
      const trans = db.transaction([storeName], 'readwrite')

      const store = trans.objectStore(storeName)
      const request = store.put(data)

      request.onerror = e => {
        console.error('Error updating data', e)
        reject('Error')
      }

      request.onsuccess = e => {
        resolve(e.target.result)
      }
    })
  }
}
