import { Component , EventEmitter, Output} from '@angular/core';
import { MessageBoxComponent } from '../main-chat/message-box/message-box.component';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [MessageBoxComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

  @Output() closeThreadViewEvent = new EventEmitter<void>();

  closeThreadView(): void {
    console.log('closing')
    this.closeThreadViewEvent.emit();
  }
}
