import { Component } from '@angular/core';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-view-profile',
  standalone: true,
  imports: [],
  templateUrl: './view-profile.component.html',
  styleUrl: './view-profile.component.scss'
})
export class ViewProfileComponent {
  constructor(
    public firebase: FirebaseService,
  ) {
  }

  async ngOnInit(): Promise<void> {
    await this.firebase.ngOnInit();
  }


}
