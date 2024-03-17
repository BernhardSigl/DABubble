import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { MatDividerModule } from '@angular/material/divider';
import { ViewSpecificProfileComponent } from '../view-specific-profile/view-specific-profile.component';
import { ListMembersComponent } from '../list-members/list-members.component';
import { AddMembersRetrospectivelyComponent } from '../add-members-retrospectively/add-members-retrospectively.component';

@Component({
  selector: 'app-edit-channel',
  standalone: true,
  imports: [
    MatDividerModule,
    CommonModule,
    ListMembersComponent
  ],
  templateUrl: './edit-channel.component.html',
  styleUrl: './edit-channel.component.scss',
})
export class EditChannelComponent {
  channelNameEditMode: boolean = false;
  channelDescriptionEditMode: boolean = false;
  channelCreatedBy: any;

  constructor(
    public dialogRef: MatDialogRef<EditChannelComponent>,
    public firebase: FirebaseService,
    public dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    // await this.firebase.ngOnInit(); // performance: alt
    this.checkChannelCreator();
  }

  checkChannelCreator() {
    const channelCreator = this.firebase.usersArray.find(
      (user) => user.name === this.firebase.channelCreatedBy
    );
    if (channelCreator) {
      this.channelCreatedBy = channelCreator;
    } else {
      console.log('The creator of the channel does not exist anymore.');
    }
  }

  editChannelName() {
    const editModeChannelName = document.getElementById(
      'edit-mode-channel-name'
    );
    const hideChannelName = document.getElementById('hide-channel-name');
    const channelNameEditText = document.getElementById(
      'channel-name-edit-text'
    );
    const channelNameInputBox = document.getElementById(
      'channel-name-input-box'
    );
    if (
      editModeChannelName &&
      hideChannelName &&
      channelNameEditText &&
      channelNameInputBox
    ) {
      editModeChannelName.classList.add('edit-mode');
      hideChannelName.style.display = 'none';
      channelNameEditText.innerHTML = 'Speichern';
      channelNameInputBox.style.display = 'flex';
      this.channelNameEditMode = true;
    }
  }

  async saveChannelName(updatedChannelName: string) {
    const editModeChannelName = document.getElementById(
      'edit-mode-channel-name'
    );
    const hideChannelName = document.getElementById('hide-channel-name');
    const channelNameEditText = document.getElementById(
      'channel-name-edit-text'
    );
    const channelNameInputBox = document.getElementById(
      'channel-name-input-box'
    );
    if (
      updatedChannelName.trim() !== '' &&
      editModeChannelName &&
      hideChannelName &&
      channelNameEditText &&
      channelNameInputBox
    ) {
      editModeChannelName.classList.remove('edit-mode');
      hideChannelName.style.display = 'flex';
      channelNameEditText.innerHTML = 'Bearbeiten';
      channelNameInputBox.style.display = 'none';
      this.channelNameEditMode = false;
      await this.firebase.updatedChannelName(updatedChannelName);
      await this.updateChange();
    }
  }

  editChannelDescription() {
    const channelDescriptionEditText = document.getElementById(
      'channel-description-edit-text'
    );
    const editModeChannelDescription = document.getElementById(
      'edit-mode-channel-description'
    );
    const channelDescriptionInputBox = document.getElementById(
      'channel-description-input-box'
    );
    const hideChannelDescription = document.getElementById(
      'hide-channel-description'
    );
    if (
      channelDescriptionEditText &&
      editModeChannelDescription &&
      hideChannelDescription &&
      channelDescriptionInputBox
    ) {
      hideChannelDescription.style.display = 'none';
      channelDescriptionInputBox.style.display = 'flex';
      editModeChannelDescription.classList.add('edit-mode');
      channelDescriptionEditText.innerHTML = 'Speichern';
      this.channelDescriptionEditMode = true;
    }
  }

  async saveChannelDescription(updatedChannelDescription: string) {
    const channelDescriptionEditText = document.getElementById(
      'channel-description-edit-text'
    );
    const editModeChannelDescription = document.getElementById(
      'edit-mode-channel-description'
    );
    const channelDescriptionInputBox = document.getElementById(
      'channel-description-input-box'
    );
    const hideChannelDescription = document.getElementById(
      'hide-channel-description'
    );
    if (
      channelDescriptionEditText &&
      editModeChannelDescription &&
      hideChannelDescription &&
      channelDescriptionInputBox
    ) {
      hideChannelDescription.style.display = 'flex';
      channelDescriptionInputBox.style.display = 'none';
      editModeChannelDescription.classList.remove('edit-mode');
      channelDescriptionEditText.innerHTML = 'Bearbeiten';
      this.channelDescriptionEditMode = false;
      this.firebase.updatedChannelDescription(updatedChannelDescription);
      await this.updateChange();
    }
  }

  async updateChange() {
    await this.firebase.activeChannelId(
      'channel',
      this.firebase.currentChannelId
    );
    await this.firebase.subAllChannels();
    this.firebase.showOnlyChannelsWithRights();
  }

  async leaveChannel() {
    const updatedMembers = this.firebase.channelMembers.filter(
      (member) => member.userId !== this.firebase.loggedInUserId
    );
    await this.firebase.updateChannel(updatedMembers);
    await this.firebase.selectLastOpenedChannel();
    await this.firebase.checkChannelRights();
    this.firebase.showOnlyChannelsWithRights();
    this.dialogRef.close();
  }

  showProfile(user: any) {
    this.dialog.open(ViewSpecificProfileComponent, {
      data: {
        user: user,
      },
      panelClass: 'border',
    });
  }

  addMemberDropdown() {
    this.dialog.open(AddMembersRetrospectivelyComponent, {
      position: { top: '210px' },
      panelClass: 'no-border-tr',
    });
  }
}
