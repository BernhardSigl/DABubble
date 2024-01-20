import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthyService {
  firestore: Firestore = inject(Firestore);
  constructor(private afAuth: Auth) {
  }

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
