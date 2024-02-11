import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AvatarDataService } from '../firebase-services/avatar-data.service';
import { Firestore, addDoc, collection, getDocs, query, where } from '@angular/fire/firestore';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatDialog } from '@angular/material/dialog';
import { HeaderDropdownComponent } from '../popup/header-dropdown/header-dropdown.component';
import { FirebaseService } from '../firebase-services/firebase.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AngularFirestoreModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  userName: string = '';
  userEmail: string = '';
  userId: string = '';
  userImage: string = '';

  constructor(
    private firestore: Firestore,
    private route: ActivatedRoute,
    public firebase: FirebaseService,
    public dialog: MatDialog) {
  }

  // ngOnInit() {
  //   this.route.queryParams.subscribe(params=>{
  //     this.userId = params['userId'];
  //     // console.log(this.userId)
  //     if (this.userId) {
  //       this.getUserData(this.userId)
  //     } else {
  //       console.error('userId parameter us undefined')
  //     }
  //   })
  // }
  async ngOnInit(): Promise<void> {
    await this.firebase.ngOnInit();
  }




  // async ngOnInit(): Promise<void> {
  //   await this.firebase.ngOnInit();
  // }

  headerDropdownMenu() {
    this.dialog.open(HeaderDropdownComponent, {
      position: { top: '6.875rem', right: '1.25rem' },
      panelClass: 'no-border-tr'
    });
  }

}
