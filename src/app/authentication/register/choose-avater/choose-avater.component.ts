import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AvatarDataService } from '../../../firebase-services/avatar-data.service';
import { AuthyService } from '../../../firebase-services/authy.service';
import { AppUser, User } from '../../../classes/user.class';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { Firestore, addDoc, collection, getDocs, query, } from '@angular/fire/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';



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
  storage = getStorage();
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

  async handleFileSelect(event: any): Promise<void> {
    const file = event.target.files[0];

    if (file) {
      try {
        const reader = new FileReader();

        reader.onload = async (e) => {
          const dataURL = e.target?.result as string;
          console.log(dataURL)

          const storageRef = ref(this.storage, `profilePicture/${this.userName}_${file.name}`);
          await uploadString(storageRef, dataURL, 'data_url');

          const downloadURL = await getDownloadURL(storageRef);
          this.profileImageSrc = downloadURL;
        };

        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error uploading avatar:', error);

      }
    } else {
      alert('Please select a file.');
    }
  }



  // Function to trigger file input click when "Datei hochladen" link is clicked
  triggerFileInput(): void {
    document.getElementById('uploadFile')?.click();
  }

  async handleAvatarSelect(avatarSrc: string): Promise<void> {
    this.profileImageSrc = avatarSrc;
    this.avatarDataService.setSelectedAvatar(avatarSrc);

    const user = new User({
      name: this.userName,
      email: this.email,
      userId: '',
      profileImg: avatarSrc,
      password: '',
    });

    try {
      const storageRef = ref(this.storage, `profilePicture/${user.userId}`);
      await uploadString(storageRef, avatarSrc, 'data_url');

      // Get the download URL of the uploaded image
      const downloadURL = await getDownloadURL(storageRef);
      user.profileImg = downloadURL;

      // Update user data in Firestore
      await this.authyService.updateUserData(user);
    } catch (error) {
      console.error('Error uploading avatar:', error);
    }
  }


async registerUser() {
  const user = new User({
    name: this.userName,
    email: this.email,
    userId: '',
    profileImg: this.profileImageSrc, // Use uploaded image URL
    password: this.password,
  });

  try {
    const userCredential = await this.authyService.registerWithEmailAndPassword(user);
    user.userId = userCredential.user?.uid;

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
    const docRef = await addDoc(this.getUsersColRef(), this.user.toJson());
    return docRef;
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

  dataURLtoBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) return new Blob();

    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }



}
