import { Component, ElementRef, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { CommonModule } from '@angular/common';
import { MemberServiceService } from '../member-service/member-service.service';
import { SelectMemberComponent } from '../select-member/select-member.component';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-add-members-retrospectively',
  standalone: true,
  imports: [
    CommonModule,
    SelectMemberComponent,
    FormsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './add-members-retrospectively.component.html',
  styleUrl: './add-members-retrospectively.component.scss',
})
export class AddMembersRetrospectivelyComponent {
  selectMemberDialogRef!: MatDialogRef<SelectMemberComponent>;
  selectMemberDialogOpen: boolean = false;
  inputValue: string = '';
  isLoading: boolean = false;

  constructor(
    public firebase: FirebaseService,
    public memberService: MemberServiceService,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddMembersRetrospectivelyComponent>,
    private elementRef: ElementRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.addResizeListener();
    this.addBackgroundClickListener();
    this.updateChannelMembersAtStart();
  }

  updateChannelMembersAtStart() {
    this.memberService.selectedUsers = this.firebase.channelMembers;
  }

  async updateChannelMembers() {
    this.isLoading = true;
    await this.firebase.updateChannel(this.memberService.selectedUsers);
    await this.firebase.checkChannelRights();
    await this.firebase.ngOnInit();
    this.dialogRef.close();
    this.isLoading = false;
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
          checkboxAddAll: false,
          checkboxAddSpecific: true,
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

  closeSelectMemberDialog() {
    if (this.selectMemberDialogOpen) {
      this.selectMemberDialogRef.close();
      this.selectMemberDialogOpen = false;
    }
  }

  async removeUser(userToRemove: any) {
    const index = this.memberService.selectedUsers.indexOf(userToRemove);
    if (index !== -1) {
      this.memberService.selectedUsers.splice(index, 1);
    }
    await this.firebase.updateChannel(this.memberService.selectedUsers);
    await this.firebase.ngOnInit();
  }
}
