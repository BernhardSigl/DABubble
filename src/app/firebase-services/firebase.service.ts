declare var google: any;
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, onSnapshot, query, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  name!: string;
  status!: boolean;
  statusChangeable!: boolean;
  email!: string;

  usersArray: any[] = [];
  loggedInUserId!: string;

  router = inject(Router);
  firestore: Firestore = inject(Firestore);
  constructor() { }

  async ngOnInit(): Promise<void> {
    await this.pullLoggedInUserId();
    await this.subAllUsers();
  }

  async subAllUsers(): Promise<void> {
    return new Promise<void>((resolve) => {
      const q = query(this.getUsersColRef());
      onSnapshot(q, async (querySnapshot) => {
        this.usersArray = [];
        querySnapshot.forEach(async (doc) => {
          const usersData = doc.data();
          this.usersArray.push(usersData);
        });
        await this.getLoggedInUserInfos();
        if (!this.statusChangeable) {
          await this.setOnlineStatus();
        } else {
          await this.setOfflineStatus();
        }
        resolve();
      });
    });
  }

  getUsersColRef() {
    return collection(this.firestore, "users");
  }

  getSingleUserDocRef() {
    return doc(this.getUsersColRef(), this.loggedInUserId);
  }

  async pullLoggedInUserId(): Promise<void> {
    this.loggedInUserId = await Promise.resolve(localStorage.getItem('userId') || '');
  }

  async setOnlineStatus(): Promise<void> {
    await setDoc(this.getSingleUserDocRef(), { status: true }, { merge: true });
  }

  async setOfflineStatus(): Promise<void> {
    await setDoc(this.getSingleUserDocRef(), { status: false }, { merge: true });
  }

  async online() {
    await setDoc(this.getSingleUserDocRef(), { statusChangeable: false }, { merge: true });
    await this.ngOnInit();
  }

  async offline() {
    await setDoc(this.getSingleUserDocRef(), { statusChangeable: true }, { merge: true });
    await this.ngOnInit();
    await new Promise<void>((resolve) => {
      localStorage.removeItem('userId');
      sessionStorage.clear();
      resolve();
    });
    google.accounts.id.disableAutoSelect();
    this.router.navigate(['/']);
  }

  async getLoggedInUserInfos(): Promise<void> {
    const loggedInUserInfo = this.usersArray.find(user => user.userId === this.loggedInUserId);

    this.name = loggedInUserInfo.name;
    this.status = loggedInUserInfo.status;
    this.statusChangeable = loggedInUserInfo.statusChangeable;
    this.email = loggedInUserInfo.email;

    console.log('status', this.status);
    console.log('statusChangeable', this.statusChangeable);
  }
}
