import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd } from '@angular/router';
import { AvatarDataService } from '../firebase-services/avatar-data.service';
import { Firestore, addDoc, collection, getDocs, query, where } from '@angular/fire/firestore';
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
  imports: [AngularFirestoreModule,CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  userName: string = '';
  userEmail: string = '';
  userId: string = '';
  userImage: string = '';
  channelArr:any='';
  userArr:any='';
  filteredChannels: any[] = [];
  filteredUsers: any[] = [];
  showDropdown: boolean = false;
  searchQuery: string = '';
  channelId:string='';
  constructor(
    public firebase: FirebaseService,
    public dialog: MatDialog,
    public router: Router
  ) {

  }

  async ngOnInit(): Promise<void> {
    await this.firebase.ngOnInit();
    this.channelArr = this.firebase.channelsArray;
    this.channelId= this.firebase.channelId;
    this.userArr = this.firebase.usersArray;
    this.filteredChannels = [...this.channelArr];
    this.filteredUsers = [...this.userArr];
  }

  headerDropdownMenu() {
    this.dialog.open(HeaderDropdownComponent, {
      position: { top: '6.875rem', right: '1.25rem' },
      panelClass: 'no-border-tr'
    });
  }


  search(event: Event) {
    const query = (event.target as HTMLInputElement).value.trim();
    const searchTerm = query.substring(1).toLowerCase();
    this.searchQuery = query;
  
    if (query.startsWith('@')) {
      this.filteredUsers = this.filterArray(this.userArr, 'name', searchTerm);
      this.filteredChannels = []; // Reset channels
      this.showDropdown = true;
    } else if (query.startsWith('#')) {
      this.filteredChannels = this.filterArray(this.channelArr, 'channelName', searchTerm);
      this.filteredUsers = []; // Reset users
      this.showDropdown = true;
    } else {
      this.showDropdown = false; // Hide dropdown if neither @ nor # is entered
    }
  }
  
  
  filterArray(array: any[], propertyName: string, searchTerm: string): any[] {
    return array.filter((item: any) => {
      return item && item[propertyName] && item[propertyName].toLowerCase().includes(searchTerm);
    });
  }
  
  async navigateToChannel(channelId: string) {
    this.firebase.setSelectedChannelId(channelId);
      await this.firebase.activeChannelId(
        'channel',
        channelId
      );
      await this.firebase.channelOrPrivateChat('channel');
      this.router.navigate(['/main', channelId]);
  }

  async navigateToUser(userId: string) {
    const user = this.firebase.usersArray.find(user => user.userId === userId);
    this.firebase.setSelectedChannelId(userId);
    await this.firebase.activeChannelId(
      'privateChat',
      `${userId}_${this.firebase.loggedInUserId}`
    );
    await this.firebase.channelOrPrivateChat('privateChat');
    await this.firebase.addNewPrivateMessage(user);
  }
}
