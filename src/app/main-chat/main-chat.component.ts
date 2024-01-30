import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { MessageBoxComponent } from './message-box/message-box.component';
import { FormsModule } from '@angular/forms';
import { ThreadComponent } from '../thread/thread.component';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';

// import { ViewProfileComponent } from '../popup/view-profile/view-profile.component';
import { CommonModule } from '@angular/common';
import { MessageLayoutComponent } from './message-layout/message-layout.component';
@Component({
  selector: 'app-main-chat',
  standalone: true,
  imports: [
    MatCardModule,
    HeaderComponent,
    SideNavComponent,
    MessageBoxComponent,
    FormsModule,
    ThreadComponent,
    CommonModule,
    MatDividerModule,
    MessageLayoutComponent
    // ViewProfileComponent,

  ],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.scss'
})
export class MainChatComponent {
  isThreadViewOpen = true;

  closeThreadView(): void {
    this.isThreadViewOpen = false;
  }
}
