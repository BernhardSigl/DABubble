import { EventEmitter, Injectable } from '@angular/core';
import { ThreadComponent } from '../main-chat/thread/thread.component';
import { MessageLayoutThreadComponent } from '../main-chat/message-layout-thread/message-layout-thread.component';

@Injectable({
  providedIn: 'root',
})
export class MessageServiceService {
  scrollEventChannel: EventEmitter<void> = new EventEmitter<void>();
  scrollEventPrivateChat: EventEmitter<void> = new EventEmitter<void>();

  private threadComponent: MessageLayoutThreadComponent | null = null;

  async scrollDown(channelOrPrivateChat: string) {
    if (channelOrPrivateChat === 'channel') {
      setTimeout(() => {
        this.scrollEventChannel.emit();
      }, 10);
    } else if (channelOrPrivateChat === 'privateChat') {
      setTimeout(() => {
        this.scrollEventPrivateChat.emit();
      }, 10);
    }
  }

  registerThreadComponent(component: MessageLayoutThreadComponent): void {
    this.threadComponent = component;
  }

  scrollThreadToBottom() {
    try {
        const messageLayoutElement = this.threadComponent?.getNativeThreadElement();
        if (messageLayoutElement) {
          messageLayoutElement.scrollTop = messageLayoutElement.scrollHeight;
        } else {
          console.warn('messageLayoutElement is undefined. Unable to scroll to bottom.');
        }      
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

}
