import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Channel } from '../../classes/channel.class';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { CommonModule } from '@angular/common';
import { AddMemberComponent } from '../add-member/add-member.component';

@Component({
  selector: 'app-add-channel',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-channel.component.html',
  styleUrl: './add-channel.component.scss'
})
export class AddChannelComponent {
  channelName!: string;
  channelDescription!: string;

  addChannelForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddChannelComponent>,
    private fb: FormBuilder,
    public dialog: MatDialog
  ) {
    this.addChannelForm = this.fb.group({
      channelName: ['', Validators.required],
      channelDescription: ['']
    });
  }

  addMember() {
    if (this.addChannelForm.value.channelName.trim() !== '') {
      this.dialog.open(AddMemberComponent, {
        panelClass: 'border',
        data: {
          channelName: this.addChannelForm.value.channelName,
          channelDescription: this.addChannelForm.value.channelDescription,
        }
      });
      this.dialogRef.close();
    }
  }
}
