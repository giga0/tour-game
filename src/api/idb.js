export default class IndexedDB {
  constructor (stores) {
    this.stores = stores
    this._db = null
  }

  getDb () {
    return new Promise((resolve, reject) => {
      if (this._db) {
        return resolve(this._db)
      }

      const request = window.indexedDB.open(process.env.VUE_APP_DB_NAME, process.env.VUE_APP_DB_VERSION)
      
      request.onerror = e => {
        console.error('Error opening db', e)
        reject('Error')
      }

      request.onsuccess = e => {
        this._db = e.target.result
        resolve(this._db)
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
