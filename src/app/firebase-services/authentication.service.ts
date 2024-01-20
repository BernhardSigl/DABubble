// declare var google: any;
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { from } from 'rxjs';
import { Auth } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {
  // router = inject(Router);
  // private auth: Auth
  constructor(private firestore:AngularFirestore,private afAuth:AngularFireAuth) {

  }

  signUp(email: string, password: string) {
    this.afAuth.createUserWithEmailAndPassword(email, password)
      .then(() => {
        // Sign up successful
        // popup successfully signed up
        // route to login
      })
      .catch((error) => {
        // An error occurred
        // route to signup with popup
      });
  }

  login(email: string, password: string) {
    this.afAuth.signInWithEmailAndPassword(email, password)
      .then(() => {
        // Login successful
        // route to main
        // popup login sucessful
      })
      .catch((error) => {
        // An error occurred
        // route to login + popup
      });
  }



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
