import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

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
  // userId!: string;


constructor(
  @Inject(MAT_DIALOG_DATA) public data: any,
  public dialogRef: MatDialogRef<ViewSpecificProfileComponent>,
  private router:Router
) {

// this.name = this.data.name;
// this.status = this.data.status
}

routeToPrivateChat(){
  console.log(this.data.user.userId);
  const userId = this.data.user.userId;

  if (userId) {
    // Navigate to the private chat route with the userId
    this.router.navigate(['/private-chat', userId]);
  } else {
    console.error('User ID not found.');
  }
}
}


