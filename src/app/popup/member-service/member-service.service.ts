import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MemberServiceService {
  selectedUserName: string = '';
  selectedUsers: any[] = [];

  constructor() { }

  updateMember() { 
        if (this.selectedUsers) {
       this.selectedUserName = this.selectedUsers.map((user: any) => user.name).join(', ');
    }
  }
}
