import { Component, Inject } from '@angular/core';
import { EmailSentComponent } from '../email-sent/email-sent.component';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthyService } from '../../firebase-services/authy.service';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [],
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.scss',
})
export class VerifyComponent {
  oldEmail!: string;
  userId!: string;

  constructor(
    private auth: AuthyService,
    public firebase: FirebaseService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<VerifyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,) {
      this.userId = this.firebase.loggedInUserId;
      this.oldEmail = this.data.oldEmail;
    }

    verifyNewEmail() {
    this.dialogRef.close();
    this.sentMailPopup(); // note popup -> checkout spam folder
  }

  sentMailPopup() {
    this.dialog.open(EmailSentComponent, {
      panelClass: 'border',
    });
  }
}
