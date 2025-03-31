import { Inject, Injectable, InjectionToken } from '@angular/core';
import { DbSet } from './db-set';

export const StorageOptionsToken = new InjectionToken<StorageOptions>('storage.options');

export interface TableIndexConfiguration {
  name: string;
  keyPath: string;
  isUnique?: boolean;
}

export interface TableConfiguration {
  name: string;
  keyPath?: string;
  autoIncrement?: boolean;

  indexes?: TableIndexConfiguration[];
}

export interface TableMigration {
  tables: TableConfiguration[];
}

export interface StorageOptions {
  dbName: string;
  migrations: TableMigration[];
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private db?: IDBDatabase;

  constructor(
    @Inject(StorageOptionsToken) private readonly options: StorageOptions,
  ) { }

  public get<T>(key: string, options: { useSession: boolean } = { useSession: false }): T | undefined {
    const storage = options.useSession ? sessionStorage : localStorage;
    const val = storage.getItem(this.getStorageKey(key));
    return val ? JSON.parse(val) : undefined;
  }

  public set<T>(key: string, data: T, options: { useSession: boolean } = { useSession: false }): void {
    const storage = options.useSession ? sessionStorage : localStorage;
    storage.setItem(this.getStorageKey(key), JSON.stringify(data));
  }

  public remove(key: string, options: { useSession: boolean } = { useSession: false }): void {
    const storage = options.useSession ? sessionStorage : localStorage;
    storage.removeItem(this.getStorageKey(key));
  }

  public async openReadStore<T>(storeName: string): Promise<DbSet<T>> {
    await this.open();
    const store = this.openReadTransaction(storeName);
    return new DbSet<T>(store);
  }

  public async openWriteStore<T>(storeName: string): Promise<DbSet<T>> {
    await this.open();
    const store = this.openWriteTransaction(storeName);
    return new DbSet<T>(store);
  }

  private open(): Promise<IDBDatabase> {
    if (!this.options) {
      console.error('No configuration supplied for storage. Use options to setup the store names');
      return Promise.reject('No indexed db available');
    }
    if (!this.options.migrations.length) {
      console.error('No migrations provided for indexed db. Use options to setup the store names');
      return Promise.reject('No indexed db available');
    }
    if (!('indexedDB' in window)) {
      return Promise.reject('No indexed db available');
    }
    return new Promise<IDBDatabase>((res, rej) => {
      const request = indexedDB.open(this.options.dbName, this.options.migrations.length);
      request.onupgradeneeded = (event) => {
        const db: IDBDatabase = request.result;

        const defaultOptions = {
          keyPath: 'id',
          autoIncrement: false,
        };
        const previousVersion = event.oldVersion;
        console.log(`updating database from version ${previousVersion}`, this.options);
        const migrations = this.options.migrations.slice(previousVersion);
        for (const migration of migrations) {
          console.log('applying migration', migration);
          try {
            for (const config of migration.tables) {
              const objectStore = db.createObjectStore(
                config.name,
                {
                  ...defaultOptions,
                  keyPath: config.keyPath,
                  autoIncrement: config.autoIncrement,
                },
              );
              if (config.indexes) {
                for (const index of config.indexes) {
                  objectStore.createIndex(index.name, index.keyPath, { unique: !!index.isUnique });
                }
              }
            }
          } catch (err) {
            console.error('caught error when applying migration', err);
          }
        }
      };
      request.onerror = () => {
        rej(request.error);
      };
      request.onsuccess = () => {
        this.db = request.result;
        res(this.db);
      };
    });
  }

  private openReadTransaction(storeName: string): IDBObjectStore {
    if (!this.db) {
      throw new Error('db is not initialized with open()');
    }
    return this.db.transaction(storeName).objectStore(storeName);
  }

  private openWriteTransaction(storeName: string): IDBObjectStore {
    if (!this.db) {
      throw new Error('db is not initialized with open()');
    }
    return this.db.transaction(storeName, 'readwrite').objectStore(storeName);
  }

  private getStorageKey(key: string): string {
    return `__${this.options.dbName}__${key}`;
  }
}
