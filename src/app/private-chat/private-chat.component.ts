import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { MessageBoxPcComponent } from './message-box-pc/message-box-pc.component';
import { MessageLayoutPcComponent } from './message-layout-pc/message-layout-pc.component';
import { FirebaseService } from '../firebase-services/firebase.service';

@Component({
  selector: 'app-private-chat',
  standalone: true,
  imports: [
    HeaderComponent,
    SideNavComponent,
    MessageBoxPcComponent,
    MessageLayoutPcComponent,
  ],
  templateUrl: './private-chat.component.html',
  styleUrl: './private-chat.component.scss',
})
export class PrivateChatComponent {
  selectedUserName: string = '';
  selectedUserImage: string = '';
  constructor(private firebaseService: FirebaseService) {}

  onUserSelected(user: any): void {
    this.selectedUserName = user.name;
    this.selectedUserImage = user.profileImg;
  }
}
