import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';

export interface Cacheable {
  typePrefix: string;

  ttl: number;
}

@Injectable({
  providedIn: 'root'
})
export abstract class OfflineService<T> {

  abstract getItem(id: string): Observable<T>;

  abstract getItems(): Observable<T[]>;

  abstract invalidateAll(): Observable<void>;

  abstract invalidate(id): Observable<void>;

}
