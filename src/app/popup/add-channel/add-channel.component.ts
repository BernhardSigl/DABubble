import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Channel } from '../../classes/channel.class';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { CommonModule } from '@angular/common';

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
  channel!: Channel;
  channelName!: string;
  channelDescription!: string;

  addChannelForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddChannelComponent>,
    private firebase: FirebaseService,
    private fb: FormBuilder
  ) {
    this.addChannelForm = this.fb.group({
      channelName: ['', Validators.required],
      channelDescription: ['']
    });
  }

  async ngOnInit(): Promise<void> {
    await this.firebase.ngOnInit();
  }

  async addNewChannel() {
    const newChannel = new Channel({
      channelName: this.addChannelForm.value.channelName,
      channelDescription: this.addChannelForm.value.channelDescription,
      members: [],
      messages: [],
      createdBy: this.firebase.name,
    });
    await this.firebase.addChannel(newChannel);
    this.dialogRef.close();
  }

}
