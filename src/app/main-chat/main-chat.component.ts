import { Component } from '@angular/core';
import { ViewProfileComponent } from '../popup/view-profile/view-profile.component';
import { FirebaseService } from '../firebase-services/firebase.service';

@Component({
  selector: 'app-main-chat',
  standalone: true,
  imports: [
    ViewProfileComponent,
  ],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.scss'
})
export class MainChatComponent {

  constructor(
    private firebase: FirebaseService,
  ) { }

  ngOnInit(): void {
    this.firebase.ngOnInit();
  }
}
