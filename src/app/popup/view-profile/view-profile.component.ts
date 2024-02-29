import { Component } from '@angular/core';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditProfileComponent } from '../edit-profile/edit-profile.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-profile',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './view-profile.component.html',
  styleUrl: './view-profile.component.scss'
})
export class ViewProfileComponent {
  userId!: string;

  constructor(
    public firebase: FirebaseService,
    public sanitizer: DomSanitizer,
    public dialogRef: MatDialogRef<ViewProfileComponent>,
    public dialog: MatDialog
  ) {
  }

  async ngOnInit(): Promise<void> {
    // await this.firebase.ngOnInit(); // performance: alt
  }

  editProfile() {
    this.dialogRef.close();
    this.dialog.open(EditProfileComponent, {
      position: { top: '6.875rem', right: '1.25rem' },
      panelClass: 'no-border-tr'
    });
  }
}
