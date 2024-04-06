import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormsModule,
  NgForm,
  ValidatorFn,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { VerifyComponent } from '../verify/verify.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { getDownloadURL, getStorage, ref, uploadBytes, uploadString } from 'firebase/storage';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss',
})
export class EditProfileComponent {
  @ViewChild('editProfileForm') editProfileForm!: NgForm;
  isLoading: boolean = false;
  inputName: string = '';
  inputEmail: string = '';
  emailInputPlaceholder: string = '';
  hideEditEmail: boolean = false;
  isEmailValid = false;
  previewImage: string | undefined;
  constructor(
    public firebase: FirebaseService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<EditProfileComponent>,
    private elementRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.firebase.selectLastOpenedChannel();
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
    const emailInputElement: HTMLInputElement | null =
      this.elementRef.nativeElement.querySelector('.edit-email input');

    if (emailInputElement) {
      this.emailInputPlaceholder = emailInputElement.placeholder;

      if (
        this.emailInputPlaceholder.includes('gmail') ||
        this.emailInputPlaceholder.includes('googlemail')
      ) {
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

    if (
      this.inputName.trim() !== '' &&
      (this.isEmailValid || this.inputEmail === '')
    ) {
      this.isLoading = true;
      this.firebase.changeName(this.inputName);
      this.firebase.ngOnInit();
      this.dialogRef.close();
    }

    if (this.inputEmail.trim() !== '' && this.isEmailValid) {
      if (localStorage.getItem('inputEmail')) {
        localStorage.removeItem('inputEmail');
      }
      this.isLoading = true;
      localStorage.setItem('inputEmail', this.inputEmail);
      this.dialogRef.close();
      this.verify(this.inputEmail);
    }
    this.isLoading = false;
  }

  async verify(inputEmail: string) {
    const dialogRef = this.dialog.open(VerifyComponent, {
      panelClass: 'border',
      data: {
        oldEmail: inputEmail,
      },
    });
    await dialogRef.afterClosed().toPromise();
  }

  googleMailNotChangeable(): boolean {
    const invalidEmails = ['gmail', 'googlemail'];
    return invalidEmails.some((email) => this.firebase.email.includes(email));
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  resetEmailErrorMsg() {
    this.isEmailValid = this.validateEmail(this.inputEmail);
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      this.previewImage = e.target?.result as string;
    };
    this.isLoading = true;
    reader.readAsDataURL(file);
  
    const storage = getStorage();
    const storageRef = ref(storage, `profilePicture/${file.name}`);
    this.isLoading = false;
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
  
      await this.firebase.updateProfileImage(downloadURL);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }

  areFieldsEmpty(): boolean {
    return this.inputName.trim() === '' || this.inputEmail.trim() === '';
  }
}