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
        console.log('Email wurde gesendet');
      })
      .catch(function(error) {
       console.log('Fehler: ', error);
      });
    }
  }
}
