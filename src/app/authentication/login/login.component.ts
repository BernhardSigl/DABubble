//google login:
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
import { FormGroup, FormControl, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthyService } from '../../firebase-services/authy.service';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { UserData} from '../../classes/user.class';
import { Firestore, addDoc, } from '@angular/fire/firestore';

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
  firestore: Firestore = inject(Firestore);
  private router = inject(Router);

  constructor(
    private authyService: AuthyService,
    // private user: UserData,
    private ngZone: NgZone
) { }
  isGuest: boolean | undefined;

  ngOnInit(): void {
    if (!this.animationPlayed) {
      this.playAnimation();
    }

    //google login
    google.accounts.id.initialize({
      client_id: '440475341248-7cnocq0n3c2vcmmfukg58lq3jeasfeua.apps.googleusercontent.com',
      callback: (resp: any) => this.handleLogin(resp)
    });

    //google login
    google.accounts.id.renderButton(document.getElementById('google-btn'), {
      theme: 'filled_blue',
      size: 'large',
      shape: 'rectangle',
      width: 350
    })
  }

  //google login
  private decodeToken(token: string) {
    return JSON.parse(atob(token.split('.')[1]));
  }

  //google login
  async handleLogin(response: any) {
    if (response) {
      const payLoad = this.decodeToken(response.credential);
      sessionStorage.setItem('loggedInUser', JSON.stringify(payLoad));

      const name = payLoad.given_name;
      const email = payLoad.email;
      const profileImg = payLoad.picture;
      const querySnapshot = await this.getUsersDocRef();

      const existingUser = querySnapshot.docs.find(doc => doc.data()['email'] === email); // email already exists?

      if (existingUser) {
        this.redirect(existingUser.id);
      } else {
        this.addField(name, email, profileImg);
      }
    }
  }

  //google login
  async redirect(token: string) {
    this.ngZone.run(() => {
      console.log('Weiterleitung auf landing page mit id: ', token);
      // this.router.navigate([``]);
    });
  }

  // google
  async addField(name: string, email: string, profileImg: string) {
    this.user = new User ({
      name: name,
      email: email,
      profileImg: profileImg,
    });
    await this.addUser().then((result: any) => {
      this.redirect(result.id);
    });
  }

  // google
  async addUser() {
    const docRef = await addDoc(this.getUsersColRef(), this.user.toJSON());
    return docRef;
  }

  // google
  async getUsersDocRef() {
    const q = query(this.getUsersColRef());
    const querySnapshot = await getDocs(q);
    return querySnapshot;
  }

  // google
  getUsersColRef() {
    return collection(this.firestore, "users");
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

    this.authyService.loginWithEmailAndPassword(guestEmail,guestPassword);
    this.router.navigate(['/main']);
    console.log('logged in');
  } catch (err: any) {

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
