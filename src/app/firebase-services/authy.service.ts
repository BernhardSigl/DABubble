import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { AppUser } from '../classes/user.class';
import { AngularFirestore } from '@angular/fire/compat/firestore';
@Injectable({
  providedIn: 'root'
})
export class AuthyService {
  // currentUser: User;

  constructor( private auth: Auth , private firestore: AngularFirestore) {
  }

  async registerWithEmailAndPassword(user: AppUser) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        user.email,
        user.password
      );
      return userCredential;
    } catch (err) {
      console.error(err);
      return err;
    }
  }

  async loginWithEmailAndPassword(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
    } catch (err) {
      throw err;
    }
  }

  async updateUserData(user: AppUser): Promise<void> {
    const userId = user.userId;

    if (userId) {
      try {
        await this.firestore.collection('users').doc(userId).update(user.toJson());
        console.log('User data updated successfully');
      } catch (error) {
        console.error('Error updating user data:', error);
      }
    }
  }


  // async updateEmailInFirebaseAuth(email: string) {
  //   try {
  //     await updateEmail(this.currentUser, email);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }

  //   signOut() {
  //     google.accounts.id.disableAutoSelect();
  //     this.router.navigate(['/']);
  //      this.afAuth.signOut()
  //       .then(() => {
  //         // Logout successful
  //       })
  //       .catch((error) => {
  //         // An error occurred
  //       });
  //   }

  // }

  // get isAuthenticated(): boolean {
  //   return this.afAuth.currentUser !== null;
  // }
}
