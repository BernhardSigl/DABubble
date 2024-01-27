import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AvatarDataService {
  private selectedAvatarSource = new BehaviorSubject<string>('../../assets/img/profile.png');
  selectedAvatar$ = this.selectedAvatarSource.asObservable();

  setSelectedAvatar(avatarSrc: string) {
    this.selectedAvatarSource.next(avatarSrc);
  }

  
}
