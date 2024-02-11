import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MainChatComponent } from '../main-chat.component';
import {
  Firestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { Message } from '../../classes/message.class';
import { CommonModule } from '@angular/common';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { user } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { DrawerService } from '../../firebase-services/drawer.service';

@Component({
  selector: 'app-message-layout-thread',
  standalone: true,
  imports: [
    MatDividerModule,
    MainChatComponent,
    CommonModule,
    PickerModule,
    FormsModule,
    MessageLayoutThreadComponent,
    MatDividerModule
  ],
  templateUrl: './message-layout-thread.component.html',
  styleUrl: './message-layout-thread.component.scss',
})
export class MessageLayoutThreadComponent implements OnInit {
  @Input() userId?: string;
  constructor(private threadService: DrawerService) {}
  selectedMessage: Message | null = null;

  ngOnInit() {
    this.threadService.selectedMessageChanged.subscribe(
      (selectedMessage: Message | null) => {
        if (selectedMessage) {
          this.selectedMessage = selectedMessage;
          console.log(selectedMessage)

        }
      }
    );
  }
}
