import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { AppUser } from '../classes/user.class';

@Injectable({
  providedIn: 'root'
})
export class AuthyService {
  // currentUser: User;

  constructor(    private auth: Auth) {
  }

  // async registerWithEmailAndPassword(user: AppUser) {
  //   try {
  //     const userCredential = await createUserWithEmailAndPassword(
  //       this.auth,
  //       user.email,
  //       user.password
  //     );
  //     return userCredential;
  //   } catch (err) {
  //     console.error(err);
  //     return err;
  //   }
  // }

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



  // async updateEmailInFirebaseAuth(email: string) {
  //   try {
  //     await updateEmail(this.currentUser, email);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }


  // signUp(email: string, password: string) {
  //   this.afAuth.createUserWithEmailAndPassword(email, password)
  //     .then(() => {
  //       // Sign up successful
  //       // popup successfully signed up
  //       // route to login
  //     })
  //     .catch((error) => {
  //       // An error occurred
  //       // route to signup with popup
  //     });
  // }

  // login(email: string, password: string) {
  //   this.afAuth.signInWithEmailAndPassword(email, password)
  //     .then(() => {
  //       // Login successful
  //       // route to main
  //       // popup login sucessful
  //     })
  //     .catch((error) => {
  //       // An error occurred
  //       // route to login + popup
  //     });
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
