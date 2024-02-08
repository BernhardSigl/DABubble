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

  isLoggedIn = false;

  constructor() { }

  isAuthenticated(): boolean {
    return this.isLoggedIn;
  }

}
