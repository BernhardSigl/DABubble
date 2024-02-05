import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDrawer } from '@angular/material/sidenav';
import { AddChannelComponent } from '../popup/add-channel/add-channel.component';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [
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
  ) { }

  openAddChannels() {
    this.dialog.open(AddChannelComponent, {
      panelClass: 'border'
    });
  }

  changeImage(isHovered: boolean): void {
    this.buttonImage = isHovered ? './../../assets/img/hide-nav-blue.png' : './../../assets/img/hide-nav-black.png';
  }

}
