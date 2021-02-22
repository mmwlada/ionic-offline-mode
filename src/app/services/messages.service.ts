import { Injectable } from '@angular/core';
import {DataService, Message} from './data.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  constructor(private dataService: DataService) { }

  public getMessages(): Observable<Message[]> {
    return this.dataService.getAll('messages');
  }
}
