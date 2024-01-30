import { Component } from '@angular/core';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'app-view-profile',
  standalone: true,
  imports: [
  ],
  templateUrl: './view-profile.component.html',
  styleUrl: './view-profile.component.scss'
})
export class ViewProfileComponent {
  constructor(
    public firebase: FirebaseService,
    private sanitizer: DomSanitizer
  ) {
  }

  async ngOnInit(): Promise<void> {
    await this.firebase.ngOnInit();
  }

  getSafeProfileImageStyle(): SafeStyle {
    const backgroundImage = `url('${this.firebase.profileImg}')`;
    return this.sanitizer.bypassSecurityTrustStyle(backgroundImage);
  }
}
