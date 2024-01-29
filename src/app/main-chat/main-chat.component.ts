import { Component } from '@angular/core';
import { ViewProfileComponent } from '../popup/view-profile/view-profile.component';

@Component({
  selector: 'app-main-chat',
  standalone: true,
  imports: [
    ViewProfileComponent
  ],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.scss'
})
export class MainChatComponent {

}
