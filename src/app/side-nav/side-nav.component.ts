import {
  Component,
  ViewChild,
  OnInit,
  EventEmitter,
  Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDrawer } from '@angular/material/sidenav';

import { AddChannelComponent } from '../popup/add-channel/add-channel.component';
import { FirebaseService } from '../firebase-services/firebase.service';
import { CommonModule } from '@angular/common';

import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { PrivateMessage } from '../classes/private-message.class';
import { PrivateMessageService } from '../firebase-services/private-message.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [CommonModule, MatSidenavModule, MatDrawer, CommonModule],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
  animations: [
    trigger('rotateAnimation', [
      state('open', style({ transform: 'rotate(-90deg)' })),
      state('closed', style({ transform: 'rotate(0deg)' })),
      transition('open => closed', animate('100ms ease-in')),
      transition('closed => open', animate('100ms ease-out')),
    ]),
  ],
})
export class SideNavComponent implements OnInit {
  @ViewChild(MatDrawer) drawer!: MatDrawer;

  isOpen = false;
  isOpenSecond = false;
  userName: string = '';
  userEmail: string = '';
  userId: string = '';
  userImage: string = '';

  @Output() selectedUser: EventEmitter<any> = new EventEmitter<any>();

  sideNavBtnStatus: boolean = false;

  constructor(
    public dialog: MatDialog,
    public firebase: FirebaseService,
    private privateMessageService: PrivateMessageService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.firebase.ngOnInit();
    this.drawer.open();
    this.checkSideNavBtnStatus();
  }

  openAddChannels() {
    this.dialog.open(AddChannelComponent, {
      panelClass: 'border',
    });
  }

  toggleRotationChannel() {
    this.isOpen = !this.isOpen;
  }

  toggleRotationMessage() {
    this.isOpenSecond = !this.isOpenSecond;
  }

  buttonImage: string = './../../assets/img/hide-nav-black.png';
  openMenuChannel: string = './../../assets/img/arrow-drop-down-black.png';
  workspaceChannel: string = './../../assets/img/workspaces-black.png';
  openMenuMessage: string = './../../assets/img/arrow-drop-down-black.png';
  directNewsImage: string = './../../assets/img/account-circle-black.png';
  addChannelPlus: string = './../../assets/img/plus-circle-black.png';

  changeImagesChannel(isHovered: boolean): void {
    this.openMenuChannel = isHovered
      ? './../../assets/img/arrow-drop-down-blue.png'
      : './../../assets/img/arrow-drop-down-black.png';
    this.workspaceChannel = isHovered
      ? './../../assets/img/workspaces-blue.png'
      : './../../assets/img/workspaces-black.png';
    // this.plusChannel = isHovered ? './../../assets/img/plus-blue.png' : './../../assets/img/plus-black.png';
    this.addChannelPlus = isHovered
      ? './../../assets/img/plus-circle-blue.png'
      : './../../assets/img/plus-circle-black.png';
  }

  changeImageMessages(isHovered: boolean): void {
    this.openMenuMessage = isHovered
      ? './../../assets/img/arrow-drop-down-blue.png'
      : './../../assets/img/arrow-drop-down-black.png';
    this.directNewsImage = isHovered
      ? './../../assets/img/account-circle-blue.png'
      : './../../assets/img/account-circle-black.png';
  }

  changeImagesButton(isHovered: boolean): void {
    this.buttonImage = isHovered
      ? './../../assets/img/hide-nav-blue.png'
      : './../../assets/img/hide-nav-black.png';
  }

  openMessage() {
    // this.isMessageOpened = true;
  }

  selectChannel(channelId: string) {
    this.firebase.setSelectedChannelId(channelId);
    this.router.navigate(['/main', channelId]);
  }

  // In SideNavComponent
  async addNewPrivateMessage(user: any) {
    try {
      const currentUser = this.firebase.loggedInUserArray[0];
      if (!currentUser) {
        console.error('Current user not found.');
        return;
      }

      const sortedIds = [user.userId, currentUser.userId].sort();
      const uniqueChatId = sortedIds.join('_');

      let existingPrivateMessage = await this.firebase.findPrivateMessageByUniqueChatId(uniqueChatId);

      if (!existingPrivateMessage) {
        const newPrivateMessage = new PrivateMessage({
          members: [user, currentUser],
          messages: [],
          privateMessageId: uniqueChatId,
        });

        await this.firebase.saveNewPrivateMessage(newPrivateMessage, uniqueChatId);
        existingPrivateMessage = newPrivateMessage;
      }

      console.log('User data for private message:', user.name, user.profileImg); // Log user data
      this.privateMessageService.setSelectedPrivateMessage(existingPrivateMessage);
      this.privateMessageService.userSelected.emit({
        user,
        privateMessageId: existingPrivateMessage.privateMessageId,
      });
      this.selectedUser.emit(user);
      this.router.navigate(['/private-chat', user.userId]);
    } catch (error) {
      console.error('Error adding new private message:', error);
    }
  }



  checkSideNavBtnStatus() {
    if (this.sideNavBtnStatus) {
      this.sideNavBtnStatus = false;
    } else if (!this.sideNavBtnStatus) {
      this.sideNavBtnStatus = true;
    }
    console.log(this.sideNavBtnStatus);
  }
}
