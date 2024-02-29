import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormsModule, NgForm, ValidatorFn } from '@angular/forms';
import { AuthyService } from '../../firebase-services/authy.service';
import { EmailSentComponent } from '../email-sent/email-sent.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { VerifyComponent } from '../verify/verify.component';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
  ],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss'
})
export class EditProfileComponent {
  @ViewChild('editProfileForm') editProfileForm!: NgForm;

  inputName: string = '';
  inputEmail: string = '';
  emailInputPlaceholder: string = '';
  hideEditEmail: boolean = false;
  isEmailValid = false;

  constructor(
    public firebase: FirebaseService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<EditProfileComponent>,
    private elementRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef,
    private auth: AuthyService
  ) { }

  async ngOnInit(): Promise<void> {
    // await this.firebase.ngOnInit(); // performance: alt
    await this.firebase.selectLastOpenedChannel(); // performance: neu
    this.editProfileForm.form.setValidators(this.atLeastOneFieldRequired());
  }

  atLeastOneFieldRequired(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const inputName = control.get('inputName')?.value ?? '';
      const inputEmail = control.get(['inputEmail'])?.value ?? '';

      if (!inputName.trim() && !inputEmail.trim()) {
        return { atLeastOneRequired: true };
      }
      return null;
    };
  }

  ngAfterViewInit(): void {
    const emailInputElement: HTMLInputElement | null = this.elementRef.nativeElement.querySelector('.edit-email input');

    if (emailInputElement) {
      this.emailInputPlaceholder = emailInputElement.placeholder;

      if (this.emailInputPlaceholder.includes('gmail') || this.emailInputPlaceholder.includes('googlemail')) {
        this.hideEditEmail = true;
        this.changeDetectorRef.detectChanges();
      }
    }
  }

   save() {
    this.isEmailValid = this.validateEmail(this.inputEmail);

    if (this.inputName.trim() === '' && this.inputEmail.trim() === '') {
      return;
    }

    if (this.inputName.trim() !== '' && (this.isEmailValid || this.inputEmail === '')) {
      this.firebase.changeName(this.inputName);
      this.firebase.ngOnInit();
      this.dialogRef.close();
    }

    if (this.inputEmail.trim() !== '' && this.isEmailValid) {
      // this.firebase.changeEmail(this.inputEmail);
      // this.auth.changeEmailAuth(this.inputEmail);
      // this.sentMailPopup();
      this.dialogRef.close();
      this.verify(this.inputEmail);
    }
  }



  async verify(inputEmail: string) {
    const dialogRef=this.dialog.open(VerifyComponent, {
      panelClass: 'border',
      data: {
        oldEmail: inputEmail,
      },
    });
    await dialogRef.afterClosed().toPromise(); 
  }

  // sentMailPopup() {
  //   this.dialog.open(EmailSentComponent, {
  //     panelClass: 'border'
  //   });
  // }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  resetEmailErrorMsg() {
    this.isEmailValid = this.validateEmail(this.inputEmail);
  }
}
