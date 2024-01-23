import { Injectable, inject } from '@angular/core';
import { AppUser } from '../classes/user.class';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  firestore: AngularFirestore = inject(AngularFirestore);
  constructor() {}

  async createUser(userId: string | undefined, user: AppUser): Promise<void> {
    if (userId) {
      await this.firestore.collection('User').doc(userId).set(user.toJson());
    }
  }
}
