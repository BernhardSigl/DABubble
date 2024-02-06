import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { Channel } from '../../classes/channel.class';
import { CommonModule } from '@angular/common';
import { SelectMemberComponent } from './select-member/select-member.component';

@Component({
  selector: 'app-add-member',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './add-member.component.html',
  styleUrl: './add-member.component.scss'
})
export class AddMemberComponent {
  channel!: Channel;
  checkboxAddAll: boolean = false;
  checkboxAddSpecific: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<AddMemberComponent>,
    public dialog: MatDialog,
    public firebase: FirebaseService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  async ngOnInit(): Promise<void> {
    await this.firebase.ngOnInit();
  }

  toggleCheckbox(selection: string) {
    if (selection === 'all') {
      this.checkboxAddAll = !this.checkboxAddAll;
      this.checkboxAddSpecific = false;
      this.selectMember();
    } else if (selection === 'specific') {
      this.checkboxAddSpecific = !this.checkboxAddSpecific;
      this.checkboxAddAll = false;
    }
  }

  async addNewChannel() {
    const newChannel = new Channel({
      channelName: this.data.channelName,
      channelDescription: this.data.channelDescription,
      members: [],
      messages: [],
      createdBy: this.firebase.name,
    });

    if (this.checkboxAddAll) {
      for (const user of this.firebase.usersArray) {
        newChannel.members.push(user.name);
      }
    }

    await this.firebase.addChannel(newChannel);
    this.dialogRef.close();
  }

  selectMember() {
    this.dialog.open(SelectMemberComponent, {
      panelClass: 'border',
      data: {
        checkboxAddAll: this.checkboxAddAll,
        checkboxAddSpecific: this.checkboxAddSpecific
      },
      backdropClass: 'transparent-backdrop',
    });
  }
}
