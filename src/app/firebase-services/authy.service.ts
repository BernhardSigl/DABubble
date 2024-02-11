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
} from '@angular/fire/auth';
import { AppUser } from '../classes/user.class';
import { FirebaseService } from './firebase.service';


@Injectable({
  providedIn: 'root',
})
export class AuthyService {
  constructor(
    private auth: Auth,
    private firebase: FirebaseService,
  ) {

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
          photoURL: user.profileImg
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
    this.firebase.pullLoggedInUserId();

    try {
      const currentUser = this.auth.currentUser;

      if (currentUser && currentUser.email) {

        const actionCodeSettings = {
          url: `http://localhost:4200/main?userId=${this.firebase.loggedInUserId}`,
          handleCodeInApp: true,
        };

        await sendSignInLinkToEmail(this.auth, newEmail, actionCodeSettings);

        window.localStorage.setItem('emailForSignIn', newEmail);
      } else {
        throw new Error('User not authenticated or missing email.');
      }
    } catch (error) {
      console.error('Error sending authentication link:', error);
      throw error;
    }
  }

  async completeEmailChange(): Promise<void> {
    try {
      const email = window.localStorage.getItem('emailForSignIn');

      if (email && isSignInWithEmailLink(this.auth, window.location.href)) {
        const user = this.auth.currentUser;

        if (user) {
          await (user as any).updateEmail(email);
          window.localStorage.removeItem('emailForSignIn');
        } else {
          console.error('Error: Current user not found.');
        }
      }
    } catch (error) {
      console.error('Error completing email change:', error);
      throw error;
    }
  }


}
