import {Injectable} from '@angular/core';
import {SQLite, SQLiteObject} from '@ionic-native/sqlite/ngx';

import { Cacheable, OfflineService } from './offline.service';
import {from, Observable} from 'rxjs';
import {ConnectionStatus, NetworkService} from './network.service';

/**
 * Abstract Caching Service
 * Provides a local cache for objects returned from a backend
 *
 * Concrete services need to implement:
 *  getTtl - number of milliseconds cached elements should be retained
 *  getApi - call the backend API to retrieve the requested elements
 *  getTypePrefix - used to classify the elements in storage
 *  getId - extract the ID from the element
 */
@Injectable({
  providedIn: 'root'
})
export class OfflineSQLiteService<T extends Cacheable> extends OfflineService<T>{

  public ttl = 180;
  public typePrefix = '';

  // SQL Statements
  private sqlDeleteAll = `DELETE FROM ${this.typePrefix}`;
  private sqlDeleteId = `DELETE FROM ${this.typePrefix} where id = ?`;
  private sqlDeleteExpired = `delete from ${this.typePrefix} WHERE ttl <> -1 and ttl < ?`;
  private sqlGetElements = `select element from ${this.typePrefix} where id = (?)`;
  private sqlGetAllElements = `select element from ${this.typePrefix}`;
  private sqlAddElement = `insert into ${this.typePrefix} (id, ttl, element) values (?, ?, ?)`;

  // Suppress DB invalidations to every x milliseconds
  private invalidationInterval = 5000;
  private lastInvalidation = 0;

  private isOnline = false;
  private database: SQLiteObject;

  constructor(private sqlite: SQLite,
              private service: NetworkService) {
    super();
    // Add network monitoring
    service.onNetworkChange().subscribe(status => {
      this.isOnline = status === ConnectionStatus.Online;
    });

    // Connect to the database
    this.sqlite.create({
      name: 'stoffline.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      this.database = db;

      db.executeSql(
        `create table if not exists ${this.typePrefix}(
                id char(64) PRIMARY KEY,
                ttl integer,
                element blob
             )`, [])
        .catch((e) => {
            console.log('Exception created table', e);
          }
        );
    });
  }

  /**
   * Invalidate the cache
   */
  public invalidateAll(): Observable<void> {
    return from(this.database.executeSql(this.sqlDeleteAll, []));
  }

  public invalidate(id: string): Observable<void> {
    return from(this.database.executeSql(this.sqlDeleteId, [ id ]));
  }

  /**
   * Get the elements corresponding to the requested IDs
   * @param id
   */
  getItem(id: string): Observable<T> {
    return new Observable<T>(obs => {

      // Remove expired entries
      this.removeExpired().subscribe(() => {
        // Now get all of the matching elements from the db
        this.database.executeSql(this.sqlGetElements, [id]).then(res => {

          if (res.rows.length === 1) {
            const element = res.rows.item(0).element;
            obs.next();
          } else if (res.rows.length > 1) {
            // Multiple results for id
          } else {
            // Nothing in cache
          }

          // Calc the time to live for the new records
          // const now = new Date().getTime();
          // const ttl = T.ttl === -1 ? -1 : this.getTtl() + now;
          obs.complete();
        }).catch(e => {
          console.log('Exception getting elements', e);
          obs.error(e);
        });
      });
    });
  }

  getItems(): Observable<T[]> {
    return new Observable<T[]>(obs => {
      this.removeExpired().subscribe(() => {
        this.database.executeSql(this.sqlGetAllElements).then(res => {
          if (res.rows.length > 0) {
            for (let i = 0, len = res.rows.length; i < length; i++) {
              obs.next(res.rows.item(i).element);
            }
          }

          obs.complete();
        }).catch(err => {
          console.log('Failed to get all elements', err);
          obs.error(err);
        });
      });
    });
  }

  /**
   * Remove expired elements from storage
   * @private
   */
  private removeExpired(): Observable<void> {
    const now = new Date().getTime();
    if (this.lastInvalidation + this.invalidationInterval < now) {
      this.lastInvalidation = now;

      return from(
        this.database.executeSql(this.sqlDeleteExpired, [now]).catch(e => {
          console.log('Exception removing expired entities', e);
          return e;
        })
      );
    } else {
      return new Observable<void>((obs) => obs.complete());
    }
  }
}
