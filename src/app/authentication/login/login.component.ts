// google:
// declare var google: any;

import { Component, OnInit, inject, NgZone } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  keyframes,
} from '@angular/animations';
import {MatDividerModule} from '@angular/material/divider';
import { FormGroup , FormControl, NonNullableFormBuilder , Validators} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../firebase-services/authentication.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatDividerModule,
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule
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
    email:new FormControl('', [Validators.required,Validators.email]),
    password: new FormControl('', Validators.required),
  })

  constructor(

  ) {}


  // google:
  // firestore: Firestore = inject(Firestore);
  // google:
  // private router = inject(Router);

  // google:
  // constructor(private ngZone: NgZone) { }
  isGuest:boolean | undefined;

  ngOnInit(): void {
    if (!this.animationPlayed) {
      this.playAnimation();
    }
    // this.authService.currentUser$.subscribe((user) => {
    //   this.isGuest = !user;
    // });
  }

  get email(){
    return this.loginForm.get('email');
  }

  get password(){
    return this.loginForm.get('password');
  }

  submit() {
    const { email, password } = this.loginForm.value;


  }
  /**
   * Logs in as a guest user.
   */
  loginAsGuest() {
    const guestEmail = 'guest@guest.de';
    const guestPassword = 'guest1';

  }


    // google:
    // google.accounts.id.initialize({
    // client_id: '440475341248-7cnocq0n3c2vcmmfukg58lq3jeasfeua.apps.googleusercontent.com',
    // callback: (resp: any) => this.handleLogin(resp)
    // });

    // google:
    // google.accounts.id.renderButton(document.getElementById('google-btn'), {
    // theme: 'filled_blue',
    // size: 'large',
    // shape: 'rectangle',
    // width: 350
    // })


  // google:
  // private decodeToken(token: string) {
  // return JSON.parse(atob(token.split('.')[1]));
  // }

  // google:
  // async handleLogin(response: any) {
  // if (response) {
  // const payLoad = this.decodeToken(response.credential);
  // sessionStorage.setItem('loggedInUser', JSON.stringify(payLoad));

  // const newEmail = payLoad.email; // choosen user-email at login
  // const newFirstName = payLoad.given_name;
  // const newProfilePic = payLoad.picture;
  // const newLocation = payLoad.locale;
  // const querySnapshot = await this.getUsersDocRef();

  // const existingUser = querySnapshot.docs.find(doc => doc.data()['email'] === newEmail); // email already exists?

  // if (existingUser) {
  // this.redirect(existingUser.id);
  // } else {
  // this.addField(newEmail, newFirstName, newProfilePic, newLocation);
  // }
  // }
  // }

  // google:
  // async addField(newEmail: string, newFirstName: string, newProfilePic: string, newLocation: string) {
  // this.user = new User({
  // firstName: newFirstName,
  // picture: newProfilePic,
  // location: newLocation,
  // email: newEmail
  // });
  // await this.addUser().then((result: any) => {
  // this.redirect(result.id);
  // });
  // }

  // google:
  // async redirect(token: string) {
  // this.ngZone.run(() => {
  // this.router.navigate([`path...`]);
  // });
  // }



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
