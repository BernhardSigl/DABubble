import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { CommonModule } from '@angular/common';
import { AddMemberComponent } from '../add-member/add-member.component';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-add-channel',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, MatFormFieldModule],
  templateUrl: './add-channel.component.html',
  styleUrl: './add-channel.component.scss',
})
export class AddChannelComponent {
  channelName!: string;
  channelDescription!: string;
  existingChannelNames: any[] = [];
  addChannelForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddChannelComponent>,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private firebase: FirebaseService
  ) {
    this.addChannelForm = this.fb.group({
      channelName: ['', Validators.required],
      channelDescription: [''],
    });
  }

  async ngOnInit(): Promise<void> {
    await this.firebase.subAllChannels();
    this.firebase.channelsArray.forEach((element) =>
      this.existingChannelNames.push(element.channelName)
    );
  }

  addMember() {
    if (this.channelFieldIsEmpty() && !this.channelAlreadyExists()) {
      this.dialog.open(AddMemberComponent, {
        panelClass: 'add-members-popup',
        data: {
          channelName: this.addChannelForm.value.channelName,
          channelDescription: this.addChannelForm.value.channelDescription,
        },
      });
      this.dialogRef.close();
    }
  }

  channelFieldIsEmpty() {
    return this.addChannelForm.value.channelName.trim() !== '';
  }

  channelAlreadyExists() {
    return this.existingChannelNames.includes(
      this.addChannelForm.value.channelName
    );
  }
}
