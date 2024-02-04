import { Component, ViewChild, OnInit } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDrawer } from '@angular/material/sidenav';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [
    MatSidenavModule,
    MatDrawer, 
    CommonModule
  ],
  templateUrl: './side-nav.component.html',
  styleUrl: './side-nav.component.scss',
  animations: [
    trigger('rotateAnimation', [
      state('open', style({ transform: 'rotate(-90deg)' })),
      state('closed', style({ transform: 'rotate(0deg)' })),
      transition('open => closed', animate('100ms ease-in')),
      transition('closed => open', animate('100ms ease-out'))
    ])
  ]
})
export class SideNavComponent implements OnInit {

  isOpen = false;
  isOpenSecond = false;

  ngOnInit(): void {
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
  addChannelPlus: string = './../../assets/img/plus-circle-black.png'


  changeImagesChannel(isHovered: boolean): void {
    this.openMenuChannel = isHovered ? './../../assets/img/arrow-drop-down-blue.png' : './../../assets/img/arrow-drop-down-black.png';
    this.workspaceChannel = isHovered ? './../../assets/img/workspaces-blue.png' : './../../assets/img/workspaces-black.png';
    // this.plusChannel = isHovered ? './../../assets/img/plus-blue.png' : './../../assets/img/plus-black.png';
    this.addChannelPlus = isHovered ? './../../assets/img/plus-circle-blue.png' : './../../assets/img/plus-circle-black.png';
  }


  changeImageMessages(isHovered: boolean): void {
    this.openMenuMessage = isHovered ? './../../assets/img/arrow-drop-down-blue.png' : './../../assets/img/arrow-drop-down-black.png';
    this.directNewsImage = isHovered ? './../../assets/img/account-circle-blue.png' : './../../assets/img/account-circle-black.png';
  }


  changeImagesButton(isHovered: boolean): void {
    this.buttonImage = isHovered ? './../../assets/img/hide-nav-blue.png' : './../../assets/img/hide-nav-black.png';
  }

  openMessage() {
    // this.isMessageOpened = true;
  }

}
