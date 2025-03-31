export class DbSet<T> {
  constructor(private readonly store: IDBObjectStore) { }

  public add(item: T): Promise<void> {
    return new Promise<void>((res, rej) => {
      const request = this.store.add(item);
      request.onerror = () => {
        rej(request.error);
      };
      request.onsuccess = () => {
        res();
      };
    });
  }

  public addAll(items: T[]): Promise<void> {
    if (items.length === 0) {
      return Promise.resolve();
    }
    return new Promise<void>((res, rej) => {
      this.store.transaction.onerror = () => {
        rej(this.store.transaction.error);
      };
      let i = 1;
      const addNext = () => {
        if (i < items.length) {
          this.store.add(items[i]).onsuccess = addNext;
          ++i;
        } else {
          res();
        }
      };
      const request = this.store.add(items[0]);
      request.onsuccess = addNext;
    });
  }

  public update(item: T): Promise<void> {
    return new Promise<void>((res, rej) => {
      const request = this.store.put(item);
      request.onerror = () => {
        rej(request.error);
      };
      request.onsuccess = () => {
        res();
      };
    });
  }

  public delete(id: string): Promise<void> {
    return new Promise<void>((res, rej) => {
      const request = this.store.delete(id);
      request.onerror = () => {
        rej(request.error);
      };
      request.onsuccess = () => {
        res();
      };
    });
  }

  public clear(): Promise<void> {
    return new Promise<void>((res, rej) => {
      const request = this.store.clear();
      request.onerror = () => {
        rej(request.error);
      };
      request.onsuccess = () => {
        res();
      };
    });
  }

  public any(indexName: string, value: string): Promise<boolean> {
    return new Promise<boolean>((res, rej) => {
      const index = this.store.index(indexName);
      const range = IDBKeyRange.only(value);
      const request = index.openCursor(range);
      request.onerror = () => {
        rej(request.error);
      };
      request.onsuccess = () => {
        const cursor: IDBCursorWithValue | null = request.result;
        if (cursor) {
          res(true);
        } else {
          res(false);
        }
      };
    });
  }

  public queryById(id: keyof T): Promise<T> {
    return new Promise<T>((res, rej) => {
      const request = this.store.get(id as IDBValidKey);
      request.onerror = () => {
        rej(request.error);
      };
      request.onsuccess = () => {
        const { result } = request;
        res(result);
      };
    });
  }

  public queryAll(): Promise<T[]> {
    return new Promise<T[]>((res, rej) => {
      const request = this.store.openCursor();
      request.onerror = () => {
        rej(request.error);
      };
      const items: T[] = [];
      request.onsuccess = () => {
        const cursor: IDBCursorWithValue | null = request.result;
        if (!cursor) {
          res(items);
        } else {
          items.push(cursor.value);
          cursor.continue();
        }
      };
    });
  }
}
