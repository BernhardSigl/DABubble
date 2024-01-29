import { Injectable, inject } from '@angular/core';
import { Firestore, collection, onSnapshot, query } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  usersArray: object[] = [];
  currentLoggedInUserId!: string;

  firestore: Firestore = inject(Firestore);

  ngOnInit(): void {
    this.subAllUsers();
    this.currentLoggedInUserId = localStorage.getItem('userId') || '';
  }

  subAllUsers() {
    const q = query(this.getUsersColRef());
    onSnapshot(q, (querySnapshot) => {
      this.usersArray = [];
      querySnapshot.forEach((doc) => {
        this.usersArray.push(doc.data());
      });
      console.log('All users: ', this.usersArray);
      console.log('Current ID: ', this.currentLoggedInUserId);

    });
  }

  getUsersColRef() {
    return collection(this.firestore, "users");
  }
}
