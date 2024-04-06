import { Component, ElementRef, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { Channel } from '../../classes/channel.class';
import { CommonModule } from '@angular/common';
import { SelectMemberComponent } from '../select-member/select-member.component';
import { FormsModule } from '@angular/forms';
import { MemberServiceService } from '../member-service/member-service.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-add-member',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './add-member.component.html',
  styleUrl: './add-member.component.scss',
})
export class AddMemberComponent {
  channel!: Channel;
  checkboxAddAll: boolean = false;
  checkboxAddSpecific: boolean = false;
  selectMemberDialogRef!: MatDialogRef<SelectMemberComponent>;
  selectMemberDialogOpen: boolean = false;
  membersField: HTMLElement | null = null;
  inputValue: string = '';
  addYourselfToInput = false;
  addGuestToInput = false;
  isLoading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<AddMemberComponent>,
    public dialog: MatDialog,
    public firebase: FirebaseService,
    public memberService: MemberServiceService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private elementRef: ElementRef // for background click
  ) {}

  async ngOnInit(): Promise<void> {
    this.addResizeListener();
    this.addBackgroundClickListener();
    this.memberService.selectedUsers = [];
    this.memberService.selectedUserName = '';
  }

  addYourself() {
    if (!this.addYourselfToInput) {
      const selectedUsers = this.firebase.usersArray.find((user) => {
        return user.userId === this.firebase.loggedInUserId;
      });
      this.memberService.selectedUsers.push(selectedUsers);
    }
    this.addYourselfToInput = true;
  }

  addGuest() {
    if (!this.addGuestToInput) {
      if (this.firebase.loggedInUserId !== 'BbEWPuFwTxg2MsNq9LafzWxNh2u1') {
        const selectedUsers = this.firebase.usersArray.find((user) => {
          return user.userId === 'BbEWPuFwTxg2MsNq9LafzWxNh2u1';
        });
        this.memberService.selectedUsers.push(selectedUsers);
      }
    }
    this.addGuestToInput = true;
  }

  toggleCheckbox(selection: string) {
    if (selection === 'all') {
      this.checkboxAddAll = !this.checkboxAddAll;
      this.checkboxAddSpecific = false;
    } else if (selection === 'specific') {
      this.checkboxAddSpecific = !this.checkboxAddSpecific;
      this.checkboxAddAll = false;
      this.addYourself();
      this.addGuest();
    }
  }

  async addNewChannel() {
    this.isLoading = true;
    const newChannel = new Channel({
      channelName: this.data.channelName,
      channelDescription: this.data.channelDescription,
      members: [],
      messages: [],
      createdBy: this.firebase.loggedInUserId,
      channelId: 'empty',
    });
    this.pushMembersInChannel(newChannel);

    await this.firebase.addChannel(newChannel);
    await this.firebase.checkChannelRights();
    this.firebase.showOnlyChannelsWithRights();
    this.dialogRef.close();
    this.isLoading = false;
  }

  pushMembersInChannel(newChannel: any) {
    if (this.checkboxAddAll) {
      for (const userAll of this.firebase.usersArray) {
        newChannel.members.push(userAll);
      }
    } else if (this.checkboxAddSpecific) {
      for (const userSpecific of this.memberService.selectedUsers) {
        newChannel.members.push(userSpecific);
      }
    }
  }

  selectMemberBehaviour(event: MouseEvent) {
    event.stopPropagation();
    if (!this.selectMemberDialogOpen) {
      this.selectMember();
      this.selectMemberDialogOpen = true;
    }
  }

  filterSelectedUsers() {
    this.memberService.filteredUsers = this.inputValue.toLowerCase();
  }

  selectMember() {
    const inputField = document.getElementById(
      'inputField'
    ) as HTMLInputElement;
    if (inputField) {
      const rect = inputField.getBoundingClientRect();
      this.selectMemberDialogRef = this.dialog.open(SelectMemberComponent, {
        panelClass: 'border',
        data: {
          checkboxAddAll: this.checkboxAddAll,
          checkboxAddSpecific: this.checkboxAddSpecific,
          top: `${rect.bottom}px`,
          left: `${rect.left}px`,
          updateDialogPosition: () => this.updateDialogPosition(),
        },
        backdropClass: 'transparent-backdrop',
        position: {
          top: `${rect.bottom}px`,
          left: `${rect.left}px`,
        },
      });
    }
  }

  updateDialogPosition() {
    const inputField = document.getElementById('inputField');
    if (inputField && this.selectMemberDialogRef) {
      const rect = inputField.getBoundingClientRect();
      this.selectMemberDialogRef.updatePosition({
        top: `${rect.bottom}px`,
        left: `${rect.left}px`,
      });
    }
  }

  closeSelectMemberDialog() {
    if (this.selectMemberDialogOpen) {
      this.selectMemberDialogRef.close();
      this.selectMemberDialogOpen = false;
    }
  }

  addResizeListener() {
    window.addEventListener('resize', () => {
      this.closeSelectMemberDialog();
    });
  }

  addBackgroundClickListener() {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!this.elementRef.nativeElement.contains(target)) {
        this.closeSelectMemberDialog();
      }
    });
  }

  removeUser(userToRemove: any) {
    const index = this.memberService.selectedUsers.indexOf(userToRemove);
    if (index !== -1) {
      this.memberService.selectedUsers.splice(index, 1);
    }
  }
}
