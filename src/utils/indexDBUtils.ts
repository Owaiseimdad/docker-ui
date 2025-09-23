interface DockerPreferences {
  providerName: string;
  lastUpdated: number;
}

class IndexedDBUtils {
  private dbName = 'docker-ui-preferences';
  private version = 1;
  private storeName = 'preferences';

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  async setDockerProvider(providerName: string): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const preferences: DockerPreferences = {
        providerName,
        lastUpdated: Date.now()
      };

      await new Promise<void>((resolve, reject) => {
        const request = store.put({ id: 'docker-provider', ...preferences });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      db.close();
    } catch (error) {
      console.error('Failed to save Docker provider:', error);
      throw error;
    }
  }

  async getDockerProvider(): Promise<string | null> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      const result = await new Promise<any>((resolve, reject) => {
        const request = store.get('docker-provider');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      db.close();
      return result?.providerName || null;
    } catch (error) {
      console.error('Failed to get Docker provider:', error);
      return null;
    }
  }

  async clearProvider(): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      await new Promise<void>((resolve, reject) => {
        const request = store.delete('docker-provider');
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      db.close();
    } catch (error) {
      console.error('Failed to clear provider:', error);
      throw error;
    }
  }
}

export const indexedDBUtils = new IndexedDBUtils();
export type { DockerPreferences };