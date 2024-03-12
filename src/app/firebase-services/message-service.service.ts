import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageServiceService {
  scrollEventChannel: EventEmitter<void> = new EventEmitter<void>();
  scrollEventPrivateChat: EventEmitter<void> = new EventEmitter<void>();

  scrollDown(channelOrPrivateChat: string) {
    if (channelOrPrivateChat === 'channel') {
      this.scrollEventChannel.emit();
    } else if (channelOrPrivateChat === 'privateChat') {
      this.scrollEventPrivateChat.emit();
    }
  }
}
