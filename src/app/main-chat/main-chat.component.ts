import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { MessageBoxComponent } from './message-box/message-box.component';
import { FormsModule } from '@angular/forms';
import { ThreadComponent } from './thread/thread.component';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
// import { ViewProfileComponent } from '../popup/view-profile/view-profile.component';
import { CommonModule } from '@angular/common';
import { MessageLayoutComponent } from './message-layout/message-layout.component';
import { ActivatedRoute } from '@angular/router';
import { Firestore, addDoc, collection, getDocs, query, where } from '@angular/fire/firestore';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { UserListService } from '../firebase-services/user-list.service';
import { user } from '@angular/fire/auth';
import { AuthyService } from '../firebase-services/authy.service';
import { AddChannelComponent } from '../popup/add-channel/add-channel.component';
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
    MessageLayoutComponent,
    AngularFirestoreModule,
    AddChannelComponent
  ],
  templateUrl: './main-chat.component.html',
  styleUrl: './main-chat.component.scss',
})
export class MainChatComponent implements OnInit {

  userName: string = '';
  userImage: string = '';
  userId: string = '';

  constructor(private firestore: Firestore, private route: ActivatedRoute, private userDataService: UserListService, private auth: AuthyService) { }



  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.userId = params['userId'];
      console.log(this.userId);
      if (this.userId) {
        this.getUserData(this.userId);
      } else {
        console.error('userId parameter is undefined');
      }
    });

    // important for email change
    console.log('1');
    const emailForSignIn = window.localStorage.getItem('emailForSignIn');
    if (emailForSignIn) {
      console.log('2');

      this.auth.completeEmailChange();
    }
  }

  async getUserData(userId: string): Promise<void> {
    await this.userDataService.fetchUserData(userId);
    this.userDataService.userName$.subscribe(userName => {
      this.userName = userName;
      console.log(this.userName)
    });
    this.userDataService.userImage$.subscribe(userImage => {
      this.userImage = userImage;
    });
  }


  isThreadViewOpen = false;

  closeThreadView(): void {
    this.isThreadViewOpen = false;
  }


}
