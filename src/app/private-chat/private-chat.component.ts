import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { MessageBoxPcComponent } from './message-box-pc/message-box-pc.component';
import { MessageLayoutPcComponent } from './message-layout-pc/message-layout-pc.component';
import { PrivateMessageService } from '../firebase-services/private-message.service';

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
export class PrivateChatComponent implements OnInit {
  selectedUserName: string = '';
  selectedUserImage: string = '';
  constructor(private privateMessageService: PrivateMessageService) {}

  ngOnInit(): void {
    this.privateMessageService.userSelected.subscribe(({ user }) => {
      console.log(user)
      this.selectedUserName = user.name;
      this.selectedUserImage = user.profileImg;
    });
  }
}
