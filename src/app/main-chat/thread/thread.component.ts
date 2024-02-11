import { Component , EventEmitter, Input, Output} from '@angular/core';
import { MessageBoxComponent } from '../message-box/message-box.component';
import { MessageLayoutComponent } from '../message-layout/message-layout.component';
import { MessageLayoutThreadComponent } from '../message-layout-thread/message-layout-thread.component';
import { Message } from '../../classes/message.class';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [MessageBoxComponent,
  MessageLayoutComponent,
MessageLayoutThreadComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {
  @Input() userName!: string;
  @Input() userImage!: string;
  @Input() userId!: string;
  @Output() closeThreadViewEvent = new EventEmitter<void>();
  @Input() selectedMessage: Message | null = null;
  threadMessages: string[] = [];

  closeThreadView(): void {
    console.log('closing')
    this.closeThreadViewEvent.emit();
  }

  sendMessage(message: string): void {
    this.threadMessages.push(message);
    // Emit an event to notify the parent component that a message has been sent
  }

}
