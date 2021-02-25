import { Injectable } from '@angular/core';
import { OfflineService } from './offline.service';
import { Observable, of } from 'rxjs';

interface CacheableData {
  id: string;
  ttl: number;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class OfflineIndexedDBService<T> extends OfflineService<T> {
  private DB_NAME = 'st-agent-app-cache';
  private DB_VERSION = 1; // Use a long long for this value (don't use a float)
  private dbStoreName = '';

  private db;

  constructor() {
    super();
  }

  public init(storeName: string, idPath: string): void {
    this.openDb(storeName, idPath);
  }

  private openDb(storeName: string, idPath: string) {
    this.dbStoreName = storeName;
    console.log('openDb ...');
    const req = indexedDB.open(this.DB_NAME, this.DB_VERSION);
    req.onsuccess = (evt: any) => {
      // Equal to: db = req.result;
      this.db = evt.target.result;
      console.log('openDb DONE');
    };
    req.onerror = (evt: any) => {
      console.error('openDb:', evt.target.errorCode);
    };

    req.onupgradeneeded = (evt: any) => {
      console.log('openDb.onupgradeneeded');
      const store = evt.currentTarget.result.createObjectStore(
        this.dbStoreName, {keyPath: idPath, autoIncrement: true});
    };
  }

  private getObjectStore(storeName: string, mode: 'readonly' | 'readwrite') {
    const tx = this.db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  getItem(id: string): Observable<T> {
    let result: T;
    const store = this.getObjectStore(this.dbStoreName, 'readonly');
    const req = store.get(id);
    req.onsuccess = (evt: any) => {
      const data = req.result.data;
      if (data.ttl !== -1 && data.ttl < Date.now()) {
        this.invalidate(id).subscribe();
      }
      else {
        result = data;
      }
    };
    req.onerror = (evt: any) => {
      console.error('Store doesn\'t have id: ' + id, evt.target.errorCode);
    };

    return of(result);
  }

  invalidate(id): Observable<void> {
    const store = this.getObjectStore(this.dbStoreName, 'readwrite');
    const req = store.delete(id);

    req.onsuccess = (evt: any) => {
      // tslint:disable-next-line:no-console
      console.info('store cleared');
    };
    req.onerror = (evt: any) => {
      console.error('clearObjectStore:', evt.target.errorCode);
    };

    return of<void>();
  }

  invalidateAll(): Observable<void> {
    const store = this.getObjectStore(this.dbStoreName, 'readwrite');
    const req = store.clear();
    req.onsuccess = (evt: any) => {
      // tslint:disable-next-line:no-console
      console.info('store cleared');
    };
    req.onerror = (evt: any) => {
      console.error('clearObjectStore:', evt.target.errorCode);
    };

    return of<void>();
  }

  getItems(): Observable<T[]> {
    return undefined;
  }
}
