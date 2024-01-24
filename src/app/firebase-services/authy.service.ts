import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
} from '@angular/fire/auth';
import { User } from '../classes/user.class';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthyService {
  constructor(private auth: Auth) { }
  //  private fireStore: AngularFirestore
  async registerWithEmailAndPassword(user: User) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        user.email,
        user.password
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
}