import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  ViewChild,
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

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [
    MessageBoxComponent,
    MessageLayoutComponent,
    MessageLayoutThreadComponent,
    MatSidenavModule,
    MatDrawer,
    MessageBoxThreadComponent
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
  isOpen = true;

  constructor(private drawerService: DrawerService) {}

  ngOnInit(): void {
    this.drawerService.isOpen$.subscribe((isOpen) => {
      this.isOpen = isOpen;
    });
    console.log(this.userId)
  }


  toggleThread(): void {
    this.isOpen = !this.isOpen;
    console.log(this.isOpen);
  }

  sendMessage(message: string): void {
    this.threadMessages.push(message);
    // Emit an event to notify the parent component that a message has been sent
  }
}
