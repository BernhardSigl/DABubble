import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Channel } from '../../classes/channel.class';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../firebase-services/firebase.service';

@Component({
  selector: 'app-add-channel',
  standalone: true,
  imports: [
    FormsModule,
  ],
  templateUrl: './add-channel.component.html',
  styleUrl: './add-channel.component.scss'
})
export class AddChannelComponent {
  channel!: Channel;
  channelName!: string;
  channelDescription!: string;

  constructor(
    public dialogRef: MatDialogRef<AddChannelComponent>,
    private firebase: FirebaseService
  ) { }

  async ngOnInit(): Promise<void> {
    await this.firebase.ngOnInit();
  }

  async addNewChannel() {
    const newChannel = new Channel({
      channelName: this.channelName,
      channelDescription: this.channelDescription,
      members: [],
      messages: [],
      createdBy: this.firebase.name,
    });
    await this.firebase.addChannel(newChannel);
    this.dialogRef.close();
  }

}
