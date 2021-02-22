import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export abstract class OfflineService<T> {

  abstract getItem(ids: string[]): Observable<T[]>;

  abstract invalidateAll(): Observable<void>;

  abstract invalidate(id): Observable<void>;

}
