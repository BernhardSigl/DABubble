import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd } from '@angular/router';
import { AvatarDataService } from '../firebase-services/avatar-data.service';
import {
  Firestore,
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from '@angular/fire/firestore';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatDialog } from '@angular/material/dialog';
import { HeaderDropdownComponent } from '../popup/header-dropdown/header-dropdown.component';
import { FirebaseService } from '../firebase-services/firebase.service';
import { user } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { filter } from 'rxjs';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AngularFirestoreModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  userName: string = '';
  userEmail: string = '';
  userId: string = '';
  userImage: string = '';
  channelArr: any = '';
  userArr: any = '';
  filteredChannels: any[] = [];
  filteredUsers: any[] = [];
  showDropdown: boolean = false;
  searchQuery: string = '';
  channelId: string = '';

  constructor(
    public firebase: FirebaseService,
    public dialog: MatDialog,
    public router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.loadFirebaseContent();
    this.channelArr = this.firebase.channelsArray;
    this.channelId = this.firebase.channelId;
    this.userArr = this.firebase.usersArray;
    this.filteredChannels = [...this.channelArr];
    this.filteredUsers = [...this.userArr];
  }

  async loadFirebaseContent() {
    // await this.firebase.ngOnInit(); // performance: alt
    await this.firebase.pullLoggedInUserId(); // performance: neu
    await this.firebase.subAllUsers(); // performance: neu
    await this.firebase.loggedInUserData(); // performance: neu
    await this.firebase.subAllChannels(); // performance: neu
    await this.firebase.checkChannelRights(); // performance: neu
    this.firebase.showOnlyChannelsWithRights(); // performance: neu
    await this.firebase.selectLastOpenedChannel(); // performance: neu
  }

  headerDropdownMenu() {
    this.dialog.open(HeaderDropdownComponent, {
      position: { top: '6.875rem', right: '1.25rem' },
      panelClass: 'no-border-tr',
    });
  }

  // Updated search method to handle channel permissions
  search(event: Event) {
    const query = (event.target as HTMLInputElement).value.trim();
    const searchTerm = query.substring(1).toLowerCase();
    this.searchQuery = query;

    if (query.startsWith('@')) {
        this.filteredUsers = this.filterArray(this.userArr, 'name', searchTerm);
        this.filteredChannels = []; // Reset channels
        this.showDropdown = true;
    } else if (query.startsWith('#')) {
        this.filteredChannels = this.filterChannelsWithRights(
            this.channelArr,
            'channelName',
            searchTerm,
            this.userId
        );
        this.filteredUsers = []; // Reset users
        this.showDropdown = true;
    } else {
        // Show both channels and users if no specific symbol is entered
        this.filteredChannels = this.filterChannelsWithRights(
            this.channelArr,
            'channelName',
            searchTerm,
            this.userId
        );
        this.filteredUsers = this.filterArray(this.userArr, 'name', searchTerm);
        this.showDropdown = true;
    }
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
  

  filterArray(array: any[], propertyName: string, searchTerm: string): any[] {
    return array.filter((item: any) => {
      return (
        item &&
        item[propertyName] &&
        item[propertyName].toLowerCase().includes(searchTerm)
      );
    });
  }

  async navigateToChannel(channelId: string) {
    this.firebase.setSelectedChannelId(channelId);
    await this.firebase.activeChannelId('channel', channelId);
    await this.firebase.channelOrPrivateChat('channel');
    this.router.navigate(['/main', channelId]);
    this.showDropdown = false;
    this.searchQuery='';
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
    this.showDropdown=false;
    this.searchQuery='';
  }
}
