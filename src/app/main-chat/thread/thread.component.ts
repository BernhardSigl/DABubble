import { Component , EventEmitter, Input, Output} from '@angular/core';
import { MessageBoxComponent } from '../message-box/message-box.component';
import { MessageLayoutComponent } from '../message-layout/message-layout.component';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [MessageBoxComponent,
  MessageLayoutComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {
  @Input() userName!: string;
  @Input() userImage!: string;
  @Output() closeThreadViewEvent = new EventEmitter<void>();

  closeThreadView(): void {
    console.log('closing')
    this.closeThreadViewEvent.emit();
  }
}
