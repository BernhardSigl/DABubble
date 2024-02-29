import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FirebaseService } from '../../firebase-services/firebase.service';

@Component({
  selector: 'app-view-specific-profile',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './view-specific-profile.component.html',
  styleUrl: './view-specific-profile.component.scss'
})
export class ViewSpecificProfileComponent {

  profileImg!: string;
  // name!: string;
  // status!: boolean;
  userId: string='';


constructor(
  @Inject(MAT_DIALOG_DATA) public data: any,
  public dialogRef: MatDialogRef<ViewSpecificProfileComponent>,
  private router:Router,
  private firebase:FirebaseService
) {

// this.name = this.data.name;
// this.status = this.data.status
}

async routeToPrivateChat(userId:string){
  console.log(this.data.user.userId);
  const user = this.firebase.usersArray.find(
    (user)=>user.userId === userId
  )

  this.firebase.setSelectedChannelId(userId);
  await this.firebase.activeChannelId(
    'privateChat',
    `${userId}_${this.firebase.loggedInUserId}`
  );
  await this.firebase.channelOrPrivateChat('privateChat');
  await this.firebase.addNewPrivateMessage(user);
}
}



