import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { MessageBoxPcComponent } from './message-box-pc/message-box-pc.component';
import { MessageLayoutPcComponent } from './message-layout-pc/message-layout-pc.component';
import { PrivateMessageService } from '../firebase-services/private-message.service';
import { ActivatedRoute } from '@angular/router';

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
  userId:string='';
  constructor(private privateMessageService: PrivateMessageService,    private route: ActivatedRoute,) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userId = params['userId'];
    });
    this.privateMessageService.userSelected.subscribe(({ user }) => {
      this.selectedUserName = user.name;
      this.selectedUserImage = user.profileImg;
    });
  }
}
