import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Platform, ToastController} from '@ionic/angular';
import {Network} from '@ionic-native/network/ngx';

export enum ConnectionStatus {
  Online,
  Offline
}

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private status: BehaviorSubject<ConnectionStatus> = new BehaviorSubject(ConnectionStatus.Offline);

  constructor(private network: Network, private toastController: ToastController, private plt: Platform) {

    this.plt.ready().then(() => {
      this.initializeNetworkEvents();
      const status =  this.network.type !== 'none' ? ConnectionStatus.Online : ConnectionStatus.Offline;
      this.status.next(status);
    });
  }

  public initializeNetworkEvents() {
    if ((!this.plt.is('ios') && !this.plt.is('android')) || !this.plt.is('hybrid')) {
      window.addEventListener('offline', e => {
        this.setOffline();
      });

      window.addEventListener('online', e => {
        this.setOnline();
      });
    } else {
      this.network.onDisconnect().subscribe(() => {
        this.setOffline();
      });

      this.network.onConnect().subscribe(() => {
        this.setOnline();
      });
    }
  }

  private async setOnline() {
    if (this.status.getValue() === ConnectionStatus.Offline) {
      this.updateNetworkStatus(ConnectionStatus.Online);
    }
  }

  private async setOffline() {
    if (this.status.getValue() === ConnectionStatus.Online) {
      this.updateNetworkStatus(ConnectionStatus.Offline);
    }
  }

  private async updateNetworkStatus(status: ConnectionStatus) {
    this.status.next(status);

    const connection = status === ConnectionStatus.Offline ? 'Offline' : 'Online';
    const toast = this.toastController.create({
      message: `You are now ${connection}`,
      duration: 3000,
      position: 'bottom'
    });
    toast.then(resolve => resolve.present());
  }

  public getCurrentNetworkStatus(): ConnectionStatus {
    return this.status.getValue();
  }

  public onNetworkChange(): Observable<ConnectionStatus> {
    return this.status.asObservable();
  }
}
