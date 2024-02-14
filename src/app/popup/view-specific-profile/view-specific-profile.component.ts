import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

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
) {

// this.name = this.data.name;
// this.status = this.data.status
}

}
