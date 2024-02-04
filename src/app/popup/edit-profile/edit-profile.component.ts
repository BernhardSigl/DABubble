import { ChangeDetectorRef, Component, ElementRef } from '@angular/core';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss'
})
export class EditProfileComponent {
  inputName: string = '';
  inputEmail: string = '';
  emailInputPlaceholder: string = '';
  hideEditEmail: boolean = false;

  constructor(
    public firebase: FirebaseService,
    public dialogRef: MatDialogRef<EditProfileComponent>,
    private elementRef: ElementRef,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  async ngOnInit(): Promise<void> {
    await this.firebase.ngOnInit();
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
    if (this.inputName.trim() !== '') {
      this.firebase.changeName(this.inputName);
    }

    if (this.inputEmail.trim() !== '') {
      this.firebase.changeEmail(this.inputEmail);
    }
    this.dialogRef.close();
  }
}
