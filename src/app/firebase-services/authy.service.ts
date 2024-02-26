import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  getAuth,
  UserCredential,
  fetchSignInMethodsForEmail,
  updateProfile,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  updateEmail,
  sendEmailVerification,
  verifyBeforeUpdateEmail
} from '@angular/fire/auth';
import { AppUser } from '../classes/user.class';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root',
})
export class AuthyService {
  constructor(private auth: Auth, private firebase: FirebaseService) {
    this.auth = getAuth();
  }

  async registerWithEmailAndPassword(user: AppUser) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        user.email || '',
        user.password || ''
      );
      return userCredential;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async loginWithEmailAndPassword(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return userCredential;
    } catch (err) {
      throw err;
    }
  }

  async forgotPassword(email: string) {
    try {
      const userCredential = await sendPasswordResetEmail(this.auth, email);
      return userCredential;
    } catch (err) {
      throw err;
    }
  }

  async checkEmailExists(email: string): Promise<any> {
    try {
      const userCredential = await fetchSignInMethodsForEmail(this.auth, email);
      return userCredential;
    } catch (error) {
      console.error('Error checking email existence:', error);
      throw error;
    }
  }

  async updateUserData(user: AppUser) {
    try {
      const currentUser = this.auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, {
          displayName: user.name,
          photoURL: user.profileImg,
        });
      } else {
        console.error('Current user is null. Unable to update user data.');
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  }

  async changeEmailAuth(newEmail: string): Promise<void> {
    const currentUser = this.auth.currentUser;
    const actionCodeSettings = {
      url: `http://localhost:4200/main?userId=${this.firebase.loggedInUserId}_email`,
    };
    if (currentUser) {
      verifyBeforeUpdateEmail(
      currentUser, newEmail, actionCodeSettings)
      .then(function() {
        console.log('Verification email sent');
      })
      .catch(function(error) {
       console.log('Fehler: ', error);
      });
    }
  }

  async acceptEmailChange() {
    // const currentUser = this.auth.currentUser;
    // const email = window.localStorage.getItem('emailForSignIn');
    // if (currentUser && email) {
    //   try {
    //     await updateEmail(currentUser, email);
    //     window.localStorage.removeItem('emailForSignIn');
    //     console.log('klappt', email);
    //   } catch (error) {
    //     console.log('Fehler beim Aktualisieren der E-Mail:', error);
    //   }
    // }
  }

  async completeEmailChange(): Promise<void> {
    try {
      const email = window.localStorage.getItem('emailForSignIn');

      // Warten auf den aktuellen Benutzer
      await new Promise<void>((resolve, reject) => {
        const unsubscribe = this.auth.onAuthStateChanged((user) => {
          if (user) {
            resolve();
          } else {
            reject('No authenticated user found.');
          }
          unsubscribe();
        });
      });

      // Aktualisiere die E-Mail-Adresse, wenn ein Benutzer gefunden wurde
      const user = this.auth.currentUser;
      if (
        user &&
        email &&
        isSignInWithEmailLink(this.auth, window.location.href)
      ) {
        await updateEmail(user, email); // Hier wird die E-Mail-Adresse aktualisiert
        window.localStorage.removeItem('emailForSignIn');
      } else {
        console.error(
          'Error: Unable to update email. User not authenticated or missing email.'
        );
      }
    } catch (error) {
      console.error('Error completing email change:', error);
      throw error;
    }
  }
}
