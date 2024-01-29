//google:
declare var google: any;

import { Component, OnInit, inject, NgZone } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  keyframes,
} from '@angular/animations';
import { MatDividerModule } from '@angular/material/divider';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthyService } from '../../firebase-services/authy.service';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { Firestore, addDoc, collection, doc, getDocs, query, updateDoc, } from '@angular/fire/firestore';
import { User } from '../../classes/user.class'
import { FirebaseService } from '../../firebase-services/firebase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatDividerModule,
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AngularFirestoreModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  animations: [
    trigger('textAnimation', [
      state('hidden', style({ opacity: 0, transform: 'translateX(-350px)' })),
      state(
        'small',
        style({ opacity: 1, transform: 'translateX(0) scale(0.4)' })
      ),
      transition('visible => small', animate('0.5s ease-out')),
      transition('hidden => visible', [
        animate('1.3s ease', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
    trigger('slideAnimation', [
      state('middle', style({ transform: 'translateX(200px)' })),
      state('left', style({ transform: 'translateX(0)' })),
      state('small', style({ transform: 'translateX(0) scale(0.4)' })), // scale down to 50%
      transition('left => small', animate('0.5s ease-out')),
      transition('middle => left', animate('0.5s ease-in')),
    ]),
    trigger('backgroundAnimation', [
      state('initial', style({ opacity: 1 })),
      state('mid', style({ opacity: 0.5 })),
      state('final', style({ opacity: 0 })),
      transition('initial => mid', animate('0.5s ease-in')),
      transition('mid => final', animate('0.2s ease-in')),
    ]),
    trigger('moveAnimation', [
      state('middle', style({ transform: 'translate(-50%, -50%) ' })),
      state(
        'top-left',
        style({
          top: '0',
          left: '0',
          fontSize: '32px',
          transform: 'scale(0.4)',
        })
      ),
      transition('middle => top-left', animate('0.6s ease-out')),
    ]),
  ],
})

export class LoginComponent implements OnInit {
  textState: string = 'hidden';
  svgTransform: string = 'middle';
  backgroundState: string = 'initial';
  setNone: boolean = false;
  moveState: string = 'middle';
  animationPlayed: boolean = false;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  })

  // google
  user!: User;
  userId!: string;

  firestore: Firestore = inject(Firestore);
  private router = inject(Router);

  constructor(
    private authyService: AuthyService,
    private ngZone: NgZone, // google
    public firebase: FirebaseService, // push userId in firebase service
  ) { }
  isGuest: boolean | undefined;

  ngOnInit(): void {
    if (!this.animationPlayed) {
      this.playAnimation();
    }

    //google
    google.accounts.id.initialize({
      client_id: '440475341248-7cnocq0n3c2vcmmfukg58lq3jeasfeua.apps.googleusercontent.com',
      callback: (resp: any) => this.handleLogin(resp)
    });
  }


  // google login window
  ngAfterViewInit(): void {
    const customGoogleButton = document.getElementById('google-btn');
    if (customGoogleButton) {
      customGoogleButton.addEventListener('click', () => {
        google.accounts.id.prompt((response: any) => {
          if (response.isNotDisplayed() || response.isSkippedMoment()) {
            document.cookie = `g_state=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT`;
            google.accounts.id.prompt();
          }
        });
      });
    }
  }

  /**
   * Google: Get all information from google login service
   */
  private decodeToken(token: string) {
    return JSON.parse(atob(token.split('.')[1]));
  }

  /**
   * Google: convert google token in readable context (response.credential)
   * Save the converted google data in session storage
   * Define the essential data
   * Check if user already exists
   */
  async handleLogin(response: any) {
    if (response) {
      const payLoad = this.decodeToken(response.credential);
      sessionStorage.setItem('loggedInUser', JSON.stringify(payLoad));

      const name = payLoad.name; // find this in session storage
      const email = payLoad.email; // find this in session storage
      const profileImg = payLoad.picture; // find this in session storage
      const querySnapshot = await this.getUsersDocRef();

      const existingUser = querySnapshot.docs.find(doc => doc.data()['email'] === email); // email already exists?

      if (existingUser) {
        this.redirect(existingUser.id);
      } else {
        this.addField(name, email, profileImg);
      }
    }
  }

  /**
   * Google: Redirect to landing page after successful google credentials
   */
  async redirect(userId: string) {
    this.ngZone.run(() => {
      console.log('Weiterleitung auf landing page mit id: ', userId);
      localStorage.clear();
      localStorage.setItem('userId', userId);
      this.router.navigate([`/main`]);
    });
  }

  /**
   * Google: Create a user with google information data
   * Add doc id afterwards
   */
  async addField(name: string, email: string, profileImg: string) {
    this.user = new User({
      name: name,
      email: email,
      profileImg: profileImg,
    });
    await this.addUser().then((result: any) => {
      this.userId = result.id;
      this.user['userId'] = result.id;
      this.save();
      this.redirect(this.userId);
    });
  }

  /**
   * Save doc id after creating the user
   */
  async save() {
    let docRef = this.getSingleUserDocRef();
    await updateDoc(docRef, this.user.toJson());
  }

  /**
   * Get the doc of the current logging user
   */
  getSingleUserDocRef() {
    return doc(this.getUsersColRef(), this.userId);
  }

  /**
   * Google: Get firebase users collection
   */
  getUsersColRef() {
    return collection(this.firestore, "users");
  }

  /**
   * Add a user to firebase database
   */
  async addUser() {
    const docRef = await addDoc(this.getUsersColRef(), this.user.toJson());
    return docRef;
  }

  /**
   * Reference to all user docs
   */
  async getUsersDocRef() {
    const q = query(this.getUsersColRef());
    const querySnapshot = await getDocs(q);
    return querySnapshot;
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  /**
   * Logs in as a guest user.
   */
  loginAsGuest() {
    const guestEmail = 'guest@guest.de';
    const guestPassword = 'guest1';

    this.authyService.loginWithEmailAndPassword(guestEmail, guestPassword);
    this.router.navigate(['/main']);
    console.log('logged in');
  } catch(err: any) {

    if (err.code === 'auth/invalid-email' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
      window.alert('Falsche E-Mail oder Passwort. Bitte überprüfen Sie Ihre Eingaben.');
    } else {
      window.alert('Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.');
    }

  }



  async submit() {
    console.log('CLICKED');
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;


    if (this.loginForm.valid && typeof email === 'string' && typeof password === 'string') {
      this.loginForm.disable();
      try {
        await this.login(email, password);
      } catch (err) {
        console.error(err);
      }
      this.loginForm.enable();
    }
  }


  async login(email: string, password: string) {
    try {
      const userCredential = await this.authyService.loginWithEmailAndPassword(email, password);
      this.router.navigate(['/main']);
      console.log('logged in');
    } catch (err: any) {

      if (err.code === 'auth/invalid-email' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        window.alert('Falsche E-Mail oder Passwort. Bitte überprüfen Sie Ihre Eingaben.');
      } else {
        window.alert('Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.');
      }
    }
  }

  playAnimation() {
    this.textState = 'hidden';
    setTimeout(() => {
      this.svgTransform = 'left';
    }, 500);
    setTimeout(() => {
      this.textState = 'visible';
    }, 1000);
    setTimeout(() => {
      this.moveState = 'top-left';
    }, 2600);
    setTimeout(() => {
      this.backgroundState = 'mid';
    }, 2700);
    setTimeout(() => {
      this.backgroundState = 'final';
      this.setNone = true;
      this.svgTransform = 'small';
      this.textState = 'small';
    }, 2900);
    this.animationPlayed = true;
  }
}
