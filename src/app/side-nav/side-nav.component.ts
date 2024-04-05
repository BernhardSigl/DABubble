import {
  Component,
  ViewChild,
  OnInit,
  EventEmitter,
  Output,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  HostListener,
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
import { Router } from '@angular/router';
import { DrawerService } from '../firebase-services/drawer.service';
import { MessageServiceService } from '../firebase-services/message-service.service';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatDrawer,
    CommonModule,
    FormsModule,
    MatProgressSpinnerModule
  ],
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
  isLoading: boolean = true;
  isOpen = false;
  isOpenSecond = false;
  userName: string = '';
  userEmail: string = '';
  userId: string = '';
  userImage: string = '';
  filteredUsers!: any[];

  @Output() selectedUser: EventEmitter<any> = new EventEmitter<any>();

  sideNavBtnStatus: boolean = false;
  temporaryDisabled: boolean = true;

  privateChatIsActive: boolean = false;
  loggedInUserName!: string;
  loggedInUserProfileImg!: string;
  loggedInUserStatus!: boolean;

  lastOpened!: string;
  activeChannelId!: string;

  buttonLabel: string = "Workspace-Menü schließen";

  // mobile start
  @ViewChild('drawer') sideNavContent!: MatDrawer;
  hideThreadMobile: boolean = false;

  showDropdown: boolean = false;
  searchQuery: string = '';
  userArr: any = '';
  channelArr: any = '';
  filteredChannels: any[] = [];
  // mobile end

  constructor(
    public dialog: MatDialog,
    public firebase: FirebaseService,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
    public drawerService: DrawerService,
    public scrollHelper: MessageServiceService
  ) {}

  async ngOnInit(): Promise<void> {
    localStorage.setItem('sideNavMobileStatus', 'visible');
    this.checkSideNavBtnStatus();
    await this.subChannels();
    await this.subUser();
    this.checkMobileStatus();
    this.subscribeToCallToggleSideNavMobile();
    this.subscribeSideNavClosingFunction();
    this.channelArr = this.firebase.channelsArray;
    this.userArr = this.firebase.usersArray;
    this.filteredChannels = [...this.channelArr];
    this.filteredUsers = [...this.userArr];
    this.isLoading = false;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (window.innerWidth < 1400) {
      this.navBehaviour();
    }
    if (window.innerWidth < 980) {
      this.drawerService.closeDrawer(); // close thread
      this.drawer.open(); // open side-nav
    }
  }

  navBehaviour() {
    if (
      window.innerWidth < 1400 &&
      this.drawerService.threadIsOpen &&
      this.sideNavBtnStatus
    ) {
      this.drawer.close();
      this.checkSideNavBtnStatus();
    }
  }

  subscribeSideNavClosingFunction() {
    this.drawerService.closeSideNav$.subscribe((shouldClose) => {
      if (shouldClose) {
        this.navBehaviour();
      }
    });
  }

  subscribeToCallToggleSideNavMobile(): void {
    this.drawerService.showSideNavOnMobileToggle.subscribe(() => {
      this.showSideNavOnMobileToggle();
    });
  }

  showSideNavOnMobileToggle() {
    this.drawer.toggle();
  }

  checkMobileStatus() {
    const isSelectedForMobileStorage = localStorage.getItem('closeSideNav');
    if (isSelectedForMobileStorage === 'close') {
      this.drawerService.isSelectedForMobile = true;
      localStorage.removeItem('closeSideNav');
      localStorage.setItem('sideNavMobileStatus', 'hidden');
    }
  }

  async subUser() {
    await this.firebase.subAllUsers();
    this.lastOpened = this.firebase.loggedInUserArray[0].lastOpened;
    this.activeChannelId = this.firebase.loggedInUserArray[0].activeChannelId;
  }

  async subChannels() {
    await this.firebase.subAllChannels();
    await this.firebase.checkChannelRights();
    await this.firebase.showOnlyChannelsWithRights();
  }

  lastOpenedPrivateChatAtStartup() {
    if (
      this.firebase.lastOpenedPrivateMessageArray &&
      this.firebase.loggedInUserArray[0].lastOpened === 'privateChat'
    ) {
      this.firebase.addNewPrivateMessage(
        this.firebase.lastOpenedPrivateMessageArray
      );
    }
  }

  openAddChannels() {
    this.dialog.open(AddChannelComponent, {
      panelClass: 'add-channel-popup',
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

  async selectChannel(
    channelOrPrivateChat: string,
    channelOrPrivateChatId: any
  ) {
    if (channelOrPrivateChat === 'channel') {
      this.drawerService.closeDrawer();
      await this.channelWasSelected(
        channelOrPrivateChat,
        channelOrPrivateChatId
      );
    } else if (channelOrPrivateChat === 'privateChat') {
      await this.privateChatWasSelected(
        channelOrPrivateChat,
        channelOrPrivateChatId
      );
    }
  }

  async channelWasSelected(
    channelOrPrivateChat: string,
    channelOrPrivateChatId: any
  ) {
    this.firebase.setSelectedChannelId(channelOrPrivateChatId);
    await this.firebase.activeChannelId(
      channelOrPrivateChat,
      channelOrPrivateChatId
    );
    await this.firebase.channelOrPrivateChat('channel');
    this.hideSideNavOnMobile();
    this.router.navigate(['/main', channelOrPrivateChatId]);
  }

  async privateChatWasSelected(
    channelOrPrivateChat: string,
    channelOrPrivateChatId: any
  ) {
    this.firebase.setSelectedChannelId(channelOrPrivateChatId['userId']);
    await this.firebase.activeChannelId(
      channelOrPrivateChat,
      `${channelOrPrivateChatId['userId']}_${this.firebase.loggedInUserId}`
    );
    await this.firebase.channelOrPrivateChat('privateChat');
    this.hideSideNavOnMobile();
    await this.firebase.addNewPrivateMessage(channelOrPrivateChatId);
  }

  hideSideNavOnMobile() {
    this.drawerService.isSelectedForMobile = true;
    localStorage.setItem('closeSideNav', 'close');
    localStorage.setItem('sideNavMobileStatus', 'hidden');
  }

  comparePrivateChatId(userId: string): boolean {
    const updadetUserId = userId + '_' + this.firebase.loggedInUserId;
    return updadetUserId === this.firebase.currentChannelId;
  }

  checkSideNavBtnStatus() {
    if (this.sideNavBtnStatus) {
      this.sideNavBtnStatus = false;
    } else if (!this.sideNavBtnStatus) {
      this.sideNavBtnStatus = true;
    }
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  routeToDistribute() {
    this.router.navigate(['/distributor']);
    this.hideSideNavOnMobile();
  }

  toggleSideNav() {
    this.drawer.toggle();
    this.updateButtonLabel();
    
    this.checkSideNavBtnStatus();
    if (window.innerWidth < 1400) {
      this.drawerService.closeDrawer();
    }
  }

   updateButtonLabel() {
    this.buttonLabel = this.sideNavBtnStatus ? "Workspace-Menü öffnen" : "Workspace-Menü schließen";
  }

  // search start
  async navigateToChannel(channelId: string) {
    this.firebase.setSelectedChannelId(channelId);
    await this.firebase.activeChannelId('channel', channelId);
    await this.firebase.channelOrPrivateChat('channel');
    this.router.navigate(['/main', channelId]);
    this.showDropdown = false;
    this.searchQuery = '';
    this.hideSideNavOnMobile();
  }

  async navigateToUser(userId: string) {
    const user = this.firebase.usersArray.find(
      (user) => user.userId === userId
    );
    this.firebase.setSelectedChannelId(userId);
    await this.firebase.activeChannelId(
      'privateChat',
      `${userId}_${this.firebase.loggedInUserId}`
    );
    await this.firebase.channelOrPrivateChat('privateChat');
    await this.firebase.addNewPrivateMessage(user);
    this.showDropdown = false;
    this.searchQuery = '';
    this.hideSideNavOnMobile();
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  search(event: Event) {
    const query = (event.target as HTMLInputElement).value.trim();
    const searchTerm = query.substring(1).toLowerCase();
    this.searchQuery = query;

    if (query.startsWith('@')) {
      this.filteredUsers = this.filterArray(this.userArr, 'name', searchTerm);
      this.firebase.channelsDataWithRights = []; // Reset channels
      this.showDropdown = true;
    } else if (query.startsWith('#')) {
      this.firebase.channelsDataWithRights = this.filterChannelsWithRights(
        this.channelArr,
        'channelName',
        searchTerm,
        this.userId
      );
      this.filteredUsers = []; // Reset users
      this.showDropdown = true;
    } else {
      // Show both channels and users if no specific symbol is entered
      this.firebase.channelsDataWithRights = this.filterChannelsWithRights(
        this.channelArr,
        'channelName',
        searchTerm,
        this.userId
      );
      this.filteredUsers = this.filterArray(this.userArr, 'name', searchTerm);
      this.showDropdown = true;
    }
  }

  filterArray(array: any[], propertyName: string, searchTerm: string): any[] {
    return array.filter((item: any) => {
      return (
        item &&
        item[propertyName] &&
        item[propertyName].toLowerCase().includes(searchTerm)
      );
    });
  }

  filterChannelsWithRights(channels: any[], propertyName: string, searchTerm: string, userId: string): any[] {

    userId = this.firebase.loggedInUserId
    const user = this.userArr.find((u: { userId: string; }) => u.userId === userId);
   
    if (!user || !user.channelRights) {

      return []; // Return empty if no user or user has no channel rights
    }
  

    const filteredChannels = channels.filter(channel => {
      const hasRight = user.channelRights.includes(channel.channelId);
      const nameMatches = channel && channel[propertyName] && channel[propertyName].toLowerCase().includes(searchTerm);
      return hasRight && nameMatches;
    });

    return filteredChannels;
  }
  // search end
}
