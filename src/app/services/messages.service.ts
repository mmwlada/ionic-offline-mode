import { Injectable } from '@angular/core';
import { DataService, Message } from './data.service';
import { Observable } from 'rxjs';
import { ConnectionStatus, NetworkService } from './network.service';
import { OfflineService } from './offline.service';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private apiPath = 'messages';

  constructor(private dataService: DataService, private networkService: NetworkService, private offlineService: OfflineService<Message>) { }

  public getMessages(): Observable<Message[]> {
    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Online) {
      return this.dataService.getAll(this.apiPath);
    } else {
      return this.offlineService.getItems();
    }
  }

  public getMessage(id: string): Observable<Message> {
    if (this.networkService.getCurrentNetworkStatus() === ConnectionStatus.Online) {
      return this.dataService.getById(this.apiPath, id);
    } else {
      return this.offlineService.getItem(id);
    }
  }
}
