import { Component } from '@angular/core';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditProfileComponent } from '../edit-profile/edit-profile.component';

@Component({
  selector: 'app-view-profile',
  standalone: true,
  imports: [
  ],
  templateUrl: './view-profile.component.html',
  styleUrl: './view-profile.component.scss'
})
export class ViewProfileComponent {
  constructor(
    public firebase: FirebaseService,
    public sanitizer: DomSanitizer,
    public dialogRef: MatDialogRef<ViewProfileComponent>,
    public dialog: MatDialog
  ) {
  }

  async ngOnInit(): Promise<void> {
    await this.firebase.ngOnInit();
  }

  getSafeProfileImageStyle(): SafeStyle {
    const backgroundImage = `url('${this.firebase.profileImg}')`;
    return this.sanitizer.bypassSecurityTrustStyle(backgroundImage);
  }

  editProfile() {
    this.dialogRef.close();
    this.dialog.open(EditProfileComponent, {
      position: { top: '6.875rem', right: '1.25rem' },
      panelClass: 'no-border-tr'
    });
  }
}
