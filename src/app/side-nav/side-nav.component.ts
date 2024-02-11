import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDrawer } from '@angular/material/sidenav';
import { AddChannelComponent } from '../popup/add-channel/add-channel.component';
import { FirebaseService } from '../firebase-services/firebase.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatDrawer,
    AddChannelComponent,
  ],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss'
})
export class SideNavComponent {
  buttonImage: string = './../../assets/img/hide-nav-black.png';

  constructor(
    public dialog: MatDialog,
    public firebase: FirebaseService,
  ) { }

  async ngOnInit(): Promise<void> {
    await this.firebase.ngOnInit();
    console.log(this.firebase.channelsArray);
    
  }

  openAddChannels() {
    this.dialog.open(AddChannelComponent, {
      panelClass: 'border'
    });
  }

  changeImage(isHovered: boolean): void {
    this.buttonImage = isHovered ? './../../assets/img/hide-nav-blue.png' : './../../assets/img/hide-nav-black.png';
  }

}
