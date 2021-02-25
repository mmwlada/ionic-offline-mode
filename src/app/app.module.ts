import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy, Platform } from '@ionic/angular';

import { Network } from '@ionic-native/network/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import {IonicStorageModule} from '@ionic/storage';
import { OfflineService } from './services/offline.service';
import { OfflineSQLiteService } from './services/offline-s-q-lite.service';
import { OfflineIndexedDBService } from './services/offline-indexed-d-b.service';
import { SQLite } from '@ionic-native/sqlite';
import { NetworkService } from './services/network.service';


@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot({
      name: '__mydb',
      driverOrder: ['indexeddb', 'sqlite', 'websql']
    }),
    AppRoutingModule,
    HttpClientModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Network,
    { provide: OfflineService, useFactory: (platform: Platform,  sqlite: SQLite, networkService: NetworkService) => {
      const platforms: string[] = platform.platforms();
      if (platforms.find((p: string) => {
        return p === 'capacitor';
      })){
        return new OfflineSQLiteService(sqlite, networkService);
      } else {
        return  new OfflineIndexedDBService();
      }
    }, deps: [Platform, SQLite, NetworkService]}],
  bootstrap: [AppComponent],
})
export class AppModule {}
