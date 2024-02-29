import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MemberServiceService } from '../member-service/member-service.service';

@Component({
  selector: 'app-select-member',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './select-member.component.html',
  styleUrl: './select-member.component.scss'
})
export class SelectMemberComponent {
  checkboxAddSpecific: boolean;

  constructor(
    public firebase: FirebaseService,
    public dialogRef: MatDialogRef<SelectMemberComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public memberService: MemberServiceService,
  ) {
    this.checkboxAddSpecific = data.checkboxAddSpecific;
  }

  async ngOnInit(): Promise<void> {
    // await this.firebase.ngOnInit(); // performance: alt
    if (this.memberService.selectedUsers.length > 0) {
      this.checkboxAddSpecific = true;
      for (const selectedUser of this.memberService.selectedUsers) {
        const compareArrays = this.firebase.usersArray.find(user => user.name === selectedUser.name);
        if (compareArrays) {
          compareArrays.selected = true;
      }
      }
    }   
  }

  stopClose(event: MouseEvent) {   
    event.stopPropagation();
  }

  selectUser(user: any) {
    const specificUserId = user.userId;
    let userAlreadySelected = false;
    
    for (const selectedUser of this.memberService.selectedUsers) {
      if (selectedUser.userId === specificUserId) {
        userAlreadySelected = true;
        break;
      }
    }
    
    if (!userAlreadySelected) {
      this.memberService.selectedUsers.push(user);
      user.selected = true;
    } else {
      this.memberService.selectedUsers = this.memberService.selectedUsers.filter(selectedUser => selectedUser.userId !== specificUserId);
      user.selected = false;
    }
    this.memberService.updateMember();
    setTimeout(() => this.data.updateDialogPosition(), 1);
  }

  isMatchingFilter(user: any) {
    const filterValue = this.memberService.filteredUsers.trim().toLowerCase();
    if (filterValue === '') {
        const filterElement = document.getElementById(`filter_${user.userId}`);
        if (filterElement) {
            filterElement.style.display = 'flex';
        }
        return true;
    } else {
        const isMatch = user.name.toLowerCase().includes(filterValue);
        const filterElement = document.getElementById(`filter_${user.userId}`);
        if (filterElement) {
            filterElement.style.display = isMatch ? 'flex' : 'none';
        }
        return isMatch;
    }
}

isUnClickableUser(userId: string): boolean {
  return userId === 'e7zSK07HmreqlBdt7cibNEcjAQW2' || userId === this.firebase.loggedInUserId;
}

}
