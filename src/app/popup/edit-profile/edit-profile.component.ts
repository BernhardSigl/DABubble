import { Component } from '@angular/core';
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

  constructor(
    public firebase: FirebaseService,
    public dialogRef: MatDialogRef<EditProfileComponent>,
  ) { }

  async ngOnInit(): Promise<void> {
    await this.firebase.ngOnInit();
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
