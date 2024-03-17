import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { AddMembersRetrospectivelyComponent } from '../add-members-retrospectively/add-members-retrospectively.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ViewProfileComponent } from '../view-profile/view-profile.component';
import { ViewSpecificProfileComponent } from '../view-specific-profile/view-specific-profile.component';

@Component({
  selector: 'app-list-members',
  standalone: true,
  imports: [
    CommonModule,
    AddMembersRetrospectivelyComponent
  ],
  templateUrl: './list-members.component.html',
  styleUrl: './list-members.component.scss'
})
export class ListMembersComponent {

constructor(
  public firebase: FirebaseService,
  public dialog: MatDialog,
  public dialogRef: MatDialogRef<ListMembersComponent>,
){}

async ngOnInit(): Promise<void> {
   await this.updateOnlineStatus();
}

async updateOnlineStatus(): Promise <void> {
  for (let member of this.firebase.currentChannelData[0].members) {   
    const user = this.firebase.usersArray.find(u => u.userId === member.userId);
    if (user) {
      member.statusChangeable = user.statusChangeable;
      member.status = user.status;
    }
  }
}

addMemberDropdown() {
  this.dialogRef.close();
  this.dialog.open(AddMembersRetrospectivelyComponent, {
    position: { top: '210px' },
    panelClass: ['no-border-tr', 'addMembersRetrospectivePopup'],
  });
}

showProfile(user: any) {
  this.dialog.open(ViewSpecificProfileComponent, {
    data: {
      user: user,
    },
    panelClass: 'border',
  });
}

}
