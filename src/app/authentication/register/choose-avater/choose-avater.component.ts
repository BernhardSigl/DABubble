import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AvatarDataService } from '../../../firebase-services/avatar-data.service';
import { AuthyService } from '../../../firebase-services/authy.service';
import { AppUser, User } from '../../../classes/user.class';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
@Component({
  selector: 'app-choose-avater',
  standalone: true,
  imports: [
    RouterModule,
    AngularFirestoreModule
  ],
  templateUrl: './choose-avater.component.html',
  styleUrl: './choose-avater.component.scss',
})
export class ChooseAvaterComponent implements OnInit {
  profileImageSrc: string = '../../assets/img/profile.png';
  userName: string = '';

  constructor(
    private route: ActivatedRoute,
    private avatarDataService: AvatarDataService,
    private authyService: AuthyService
  ) {}

  ngOnInit() {
    // Retrieve the name from the query parameters
    this.route.queryParams.subscribe((params) => {
      this.userName = params['name'];
    });
  }
  handleFileSelect(event: any): void {
    const file = event.target.files[0];
    // Check if the selected file is an image
    if (file && file.type.startsWith('image/')) {
      // If avatars are chosen, reset the uploaded image and show the selected avatar
      if (this.profileImageSrc !== '../../assets/img/profile.png') {
        this.profileImageSrc = '';
      }
      // Display the selected image in .profile-img
      this.profileImageSrc = URL.createObjectURL(file);
    } else {
      // Show alert for wrong format
      alert('Wrong format chosen. Please select a valid image file.');
    }

    this.avatarDataService.setSelectedAvatar(this.profileImageSrc);
  }

  // Function to trigger file input click when "Datei hochladen" link is clicked
  triggerFileInput(): void {
    document.getElementById('uploadFile')?.click();
  }

  handleAvatarSelect(avatarSrc: string): void {
    this.profileImageSrc = avatarSrc;
    this.avatarDataService.setSelectedAvatar(avatarSrc);

    // Get user data from Firebase
    const user = new User({
      name: this.userName,
      email: '',
      userId: '',
      profileImg: avatarSrc,
      password: '',
    });

    // Update user data in Firebase
    // this.authyService.updateUserData(user);
  }
}
