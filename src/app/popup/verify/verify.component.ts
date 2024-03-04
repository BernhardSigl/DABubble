import { Component, Inject } from '@angular/core';
import { EmailSentComponent } from '../email-sent/email-sent.component';
import { FirebaseService } from '../../firebase-services/firebase.service';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { AuthyService } from '../../firebase-services/authy.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.scss',
})
export class VerifyComponent {
  oldEmail!: string;
  newMail!: string;
  userId!: string;
  password!: string;
  constructor(
    private auth: AuthyService,
    public firebase: FirebaseService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<VerifyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userId = this.firebase.loggedInUserId;
    this.oldEmail = this.firebase.email;
    this.newMail = this.data.oldEmail;
  }

  async verifyNewEmail() {
    try {
      // Authenticate user with email and password
      await this.login(this.oldEmail, this.password);
      // If authentication is successful, proceed with email verification
      this.auth.changeEmailAuth(this.newMail);
      this.dialogRef.close();
      this.sentMailPopup(); // note popup -> checkout spam folder
    } catch (error: any) {
      // Handle authentication errors
      console.error('Authentication error:', error);
    }
  }
  async login(email: string, password: string) {
    try {
      // Authenticate user with email and password
      const userCredential = await this.auth.loginWithEmailAndPassword(
        email,
        password
      );
      this.userId = userCredential.user?.uid;

      const userDocId = this.userId;

      if (userDocId) {
        localStorage.removeItem('userId');
        localStorage.setItem('userId', userDocId);
        await this.firebase.online();
      } else {
        console.log('User document does not exist.');
      }
    } catch (error: any) {
      this.handleLoginError(error);
      throw error; // Re-throw the error to propagate it to the calling function
    }
  }

  private handleLoginError(error: any): void {
    let errorMessage =
      'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.';
    if (
      error.code === 'auth/invalid-email' ||
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password'
    ) {
      errorMessage =
        'Falsche E-Mail oder Passwort. Bitte überprüfen Sie Ihre Eingaben.';
    }

    this.snackBar.open(errorMessage, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: error.code === 'auth/invalid-email' ? 'top' : 'bottom',
    });
  }

  clearStorage() {
    sessionStorage.clear();
    localStorage.clear();
  }
  sentMailPopup() {
    this.dialog.open(EmailSentComponent, {
      panelClass: 'border',
    });
  }
}
