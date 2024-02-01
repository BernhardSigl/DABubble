import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AvatarDataService } from '../../../firebase-services/avatar-data.service';
import { AuthyService } from '../../../firebase-services/authy.service';
import { AppUser, User } from '../../../classes/user.class';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { Firestore, addDoc, collection, doc, getDocs, query, setDoc, DocumentReference, DocumentData } from '@angular/fire/firestore';



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
  email:string='';
  password:string='';
  firestore: Firestore = inject(Firestore);
  user!: User;
  constructor(
    private route: ActivatedRoute,
    private avatarDataService: AvatarDataService,
    private authyService: AuthyService,
    private router:Router
  ) {}

  ngOnInit() {
    // Retrieve the name from the query parameters
    this.route.queryParams.subscribe((params) => {
      this.userName = params['name'];
      this.email = params['email'];
      this.password = params['password'];
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
      email: this.email,
      userId:'',
      profileImg: avatarSrc,
      password: '',
    });
    console.log(user)

    // Update user data in Firebase
    // this.authyService.updateUserData(user);
  }

  async registerUser() {
    const user = new User({
      name: this.userName,
      email: this.email,
      userId: '',
      profileImg: this.profileImageSrc,
      password: this.password,
    });

    try {
      const userCredential = await this.authyService.registerWithEmailAndPassword(user);
      user.userId = userCredential.user?.uid; // Assign the generated userId


      this.user = user;

      await this.addUser().then((result: any) => {
        console.log('User added to collection:', result);
      });
    } catch (error) {
      console.error(error);
      alert('Registration failed. Please try again.');
    }
  }

  async addUser() {
    // Check if 'user' is defined before adding it to the collection
    if (this.user) {
      try {
        const userRef: DocumentReference<DocumentData> = doc(this.firestore, `users/${this.user.userId}`);
        await setDoc(userRef, this.user.toJson());
        console.log('User added to collection:', this.user);
        return userRef;
      } catch (error) {
        console.error('Error adding user to collection:', error);
        return null;
      }
    } else {
      console.error('User data is not defined.');
      return null;
    }
  }



  async getUsersDocRef() {
    const q = query(this.getUsersColRef());
    const querySnapshot = await getDocs(q);
    return querySnapshot;
  }


  getUsersColRef() {
    return collection(this.firestore, "users");
  }




}
