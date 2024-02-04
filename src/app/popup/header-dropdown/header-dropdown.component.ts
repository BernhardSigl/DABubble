import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ViewProfileComponent } from '../view-profile/view-profile.component';
import { FirebaseService } from '../../firebase-services/firebase.service';

@Component({
  selector: 'app-header-dropdown',
  standalone: true,
  imports: [],
  templateUrl: './header-dropdown.component.html',
  styleUrl: './header-dropdown.component.scss'
})
export class HeaderDropdownComponent {
  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<HeaderDropdownComponent>,
    public firebase: FirebaseService,
  ) { }

  showProfile() {
    this.dialogRef.close();
    this.dialog.open(ViewProfileComponent, {
      position: { top: '6.875rem', right: '1.25rem' },
      panelClass: 'no-border-tr'
    });
  }

  logOut() {
    this.dialogRef.close();
    this.firebase.offline();
  }

}
