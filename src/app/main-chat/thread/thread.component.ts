import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { MessageBoxComponent } from '../message-box/message-box.component';
import { MessageLayoutComponent } from '../message-layout/message-layout.component';
import { MessageLayoutThreadComponent } from '../message-layout-thread/message-layout-thread.component';
import { Message } from '../../classes/message.class';
import { MatDrawer } from '@angular/material/sidenav';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NgControl } from '@angular/forms';
import { DrawerService } from '../../firebase-services/drawer.service';
import { MessageBoxThreadComponent } from './message-box-thread/message-box-thread.component';
import { MessageServiceService } from '../../firebase-services/message-service.service';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [
    MessageBoxComponent,
    MessageLayoutComponent,
    MessageLayoutThreadComponent,
    MatSidenavModule,
    MatDrawer,
    MessageBoxThreadComponent,
  ],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss',
})
export class ThreadComponent implements OnInit {
  @Input() userName!: string;
  @Input() userImage!: string;
  @Input() userId!: string;
  @Input() selectedMessage: Message | null = null;
  @ViewChild('drawer') drawer!: MatDrawer;
  threadMessages: string[] = [];
  isOpen = false;
  threadId: string = '';
  constructor(
    private drawerService: DrawerService,
    private el: ElementRef,
    private scrollHelper: MessageServiceService
    ) {}

  ngOnInit(): void {
    this.drawerService.isOpen$.subscribe((isOpen) => {
      this.isOpen = isOpen;
      if (isOpen) {
        this.drawer.close(); // Close the sidenav when thread is opened
      }
    });
  }

  toggleThread(): void {
    this.drawerService.closeDrawer();
    if (this.isOpen) {
      this.drawerService.setSideNavBtnStatus(false);
    }
  }

  sendMessage(message: string): void {
    this.threadMessages.push(message);
    // Emit an event to notify the parent component that a message has been sent
  }

  handleThreadId(threadId: string) {
    // Handle the received threadId here
    console.log('Received threadId:', threadId);
    // You can use this threadId as needed in your component logic
    this.threadId = threadId;
  }
}
