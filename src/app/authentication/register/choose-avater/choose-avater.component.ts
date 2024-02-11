import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AvatarDataService } from '../../../firebase-services/avatar-data.service';
import { AuthyService } from '../../../firebase-services/authy.service';
import { AppUser, User } from '../../../classes/user.class';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import {
  DocumentData,
  DocumentReference,
  Firestore,
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  setDoc,
} from '@angular/fire/firestore';
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from 'firebase/storage';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-choose-avater',
  standalone: true,
  imports: [RouterModule, AngularFirestoreModule],
  templateUrl: './choose-avater.component.html',
  styleUrl: './choose-avater.component.scss',
})
export class ChooseAvaterComponent implements OnInit {
  profileImageSrc: string = '../../assets/img/profile.png';
  userName: string = '';
  email: string = '';
  password: string = '';
  firestore: Firestore = inject(Firestore);
  user!: User;
  storage = getStorage();
  constructor(
    private route: ActivatedRoute,
    private avatarDataService: AvatarDataService,
    private authyService: AuthyService,
    private router: Router,
    private snackBar: MatSnackBar
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

          // Upload the image to Firebase Storage
          const storageRef = ref(
            this.storage,
            `profilePicture/${this.userName}_${file.name}`
          );
          await uploadString(storageRef, dataURL, 'data_url');

          // Get the download URL of the uploaded image
          const downloadURL = await getDownloadURL(storageRef);
          this.profileImageSrc = downloadURL;

          // Update user data in Firestore with the uploaded image URL
          const user = new User({
            name: this.userName,
            email: this.email,
            userId: '',
            profileImg: downloadURL, // Use the uploaded image URL
            password: '',
          });

          // Update user data in Firestore
          await this.authyService.updateUserData(user);
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
    // Update the profileImageSrc with the selected avatar
    this.profileImageSrc = avatarSrc;

    // Update the user's profileImg in Firestore
    const user = new User({
      name: this.userName,
      email: this.email,
      userId: '',
      profileImg: avatarSrc, // Use the selected image URL
      password: '',
    });

    try {
      // If the user is already registered, update their profileImg
      if (this.user && this.user.userId) {
        user.userId = this.user.userId;
        await this.authyService.updateUserData(user);
      }
    } catch (error) {
      console.error('Error updating user profileImg:', error);
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
      const userCredential =
        await this.authyService.registerWithEmailAndPassword(user);
      user.userId = userCredential.user?.uid;

      this.user = user;

      await this.addUser().then((result: any) => {
        this.snackBar.open('Successfully Registered', 'Close', {
          duration: 3000, // Duration the toast is shown (in milliseconds)
          horizontalPosition: 'center', // Position of the toast
          verticalPosition: 'bottom',
        });
        console.log('User added to collection:', result);
      });
    } catch (error) {
      this.snackBar.open('Registration failed. Please try again.', 'Close', {
        duration: 3000, // Duration the toast is shown (in milliseconds)
        horizontalPosition: 'center', // Position of the toast
        verticalPosition: 'bottom',
      });
    }
  }

  async addUser() {
    // Check if 'user' is defined before adding it to the collection
    if (this.user) {
      try {
        const userRef: DocumentReference<DocumentData> = doc(
          this.firestore,
          `users/${this.user.userId}`
        );
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
    return collection(this.firestore, 'users');
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
