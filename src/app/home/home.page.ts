import {Component, OnInit} from '@angular/core';
import {MessagesService} from '../services/messages.service';
import {ConnectionStatus, NetworkService} from '../services/network.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  messages = [];

  public appStatus: string;

  constructor(private messagesService: MessagesService, private networkService: NetworkService) {}

  ngOnInit() {
    setTimeout(() => {
      this.getMessages();
    }, 3000);

    this.networkService.onNetworkChange()
      .subscribe(status => {
        this.appStatus = (status === ConnectionStatus.Online ? 'online' : 'offline');
      });
  }


  refresh(ev) {
    setTimeout(() => {
      this.getMessages();
      ev.detail.complete();
    }, 3000);
  }

  getMessages(): void {
    this.messagesService.getMessages().subscribe(result => this.messages = result);
  }
}
