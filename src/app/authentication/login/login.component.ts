//google:
declare var google: any;

import { Component, OnInit, inject, NgZone } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { MatDividerModule } from '@angular/material/divider';
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthyService } from '../../firebase-services/authy.service';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import {
  Firestore,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { User } from '../../classes/user.class';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PolicyPopupComponent } from '../../popup/policy-popup/policy-popup.component';
import { ImprintPopupComponent } from '../../popup/imprint-popup/imprint-popup.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatDividerModule,
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AngularFirestoreModule,
    MatProgressSpinnerModule,
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
    email: new FormControl('', [
      Validators.required,
      Validators.email,
      validateEmail,
    ]),
    password: new FormControl('', Validators.required),
  });
  isLoading: boolean = false;
  // google
  user!: User;
  userId!: string;

  firestore: Firestore = inject(Firestore);
  private router = inject(Router);

  constructor(
    private authyService: AuthyService,
    private ngZone: NgZone, // google
    public firebase: FirebaseService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {}
  isGuest: boolean | undefined;

  ngOnInit(): void {
    if (!this.animationPlayed) {
      this.playAnimation();
    }

    //google
    this.loadGoogleApi(() => {
      google.accounts.id.initialize({
        client_id:
          '440475341248-7cnocq0n3c2vcmmfukg58lq3jeasfeua.apps.googleusercontent.com',
        callback: (resp: any) => this.handleLogin(resp),
      });
    });
    localStorage.clear();
  }

  // google login window
  ngAfterViewInit(): void {
    const customGoogleButton = document.getElementById('google-btn');
    if (customGoogleButton) {
      customGoogleButton.addEventListener('click', () => {
        this.loadGoogleApi(() => {
          google.accounts.id.prompt(() => {
            document.cookie = `g_state=;path=/;expires=Thu, 01 Jan 1970 00:00:01 GMT`;
            google.accounts.id.prompt();
          });
        });
      });
    }
  }

  // google
  private loadGoogleApi(callback: () => void): void {
    if (typeof google === 'undefined' || !google.accounts) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = callback;
      document.head.appendChild(script);
    } else {
      callback();
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

      const existingUser = querySnapshot.docs.find(
        (doc) => doc.data()['email'] === email
      ); // email already exists?

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
  redirect(userId: string) {
    this.ngZone.run(async () => {
      this.clearStorage();
      localStorage.setItem('userId', userId);
      await this.firebase.online();
      this.router.navigate(['/main'], { queryParams: { userId } });
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
      status: false,
      statusChangeable: false,
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
    return collection(this.firestore, 'users');
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
  async loginAsGuest() {
    const guestEmail = 'guest@guest.de';
    const guestPassword = '123456';
    // debugger;
    try {
      this.isLoading = true;
      await this.authenticateGuest(guestEmail, guestPassword);
      const userId = 'e7zSK07HmreqlBdt7cibNEcjAQW2';
      this.clearStorage();
      this.saveUserIdToLocalStorage(userId);
      await this.firebase.online();
      this.navigateToMainPageWithUserId(userId);
      this.showSuccessToastGuest('Successfully logged in as guest');
    } catch (error: any) {
      this.handleLoginErrorGuest(error);
    }
    this.isLoading = false;
  }

  private async authenticateGuest(
    email: string,
    password: string
  ): Promise<void> {
    await this.authyService.loginWithEmailAndPassword(email, password);
  }

  private saveUserIdToLocalStorage(userId: string): void {
    localStorage.setItem('userId', userId);
  }

  private navigateToMainPageWithUserId(userId: string): void {
    this.router.navigate(['/main'], { queryParams: { userId: userId } });
  }

  private handleLoginErrorGuest(error: any): void {
    let errorMessage =
      'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.';
    if (
      error.code === 'auth/invalid-email' ||
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password'
    ) {
      errorMessage =
        'Falsche E-Mail oder Passwort. Bitte überprüfen Sie Ihre Eingaben.';
    }

    this.snackBar.open(errorMessage, '', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: error.code === 'auth/invalid-email' ? 'top' : 'bottom',
      panelClass: ['no-close-button'],
    });
  }

  private showSuccessToastGuest(message: string): void {
    this.snackBar.open(message, '', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: ['no-close-button'],
    });
  }

  async submit() {
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;   
    if (
      this.loginForm.valid &&
      typeof email === 'string' &&
      typeof password === 'string'
    ) {
      this.loginForm.disable();
      this.isLoading = true;
      try {
        await this.login(email, password);
      } catch (err) {
        console.warn(err);
      }
      this.loginForm.enable();
      this.isLoading = false;
    } else {
      this.email?.markAsTouched();
      this.password?.markAsTouched();
    }
  }

  async login(email: string, password: string) {
    try {
      const userCredential = await this.authyService.loginWithEmailAndPassword(
        email,
        password
      );
      this.userId = userCredential.user?.uid;

      const userDocId = await this.findUserDocumentId(this.userId);

      if (userDocId) {
        this.clearStorage();
        localStorage.setItem('userId', userDocId);
        this.navigateToMainPage();
        this.showSuccessToast('Erfolgreich angemeldet');
      } else {
        console.log('User document does not exist.');
      }
    } catch (error: any) {
      this.handleLoginError(error);
    }
  }

  private async findUserDocumentId(userId: string): Promise<string | null> {
    const querySnapshot = await getDocs(
      query(collection(this.firestore, 'users'), where('userId', '==', userId))
    );

    return querySnapshot.empty ? null : querySnapshot.docs[0].id;
  }

  private handleLoginError(error: any): void {
    let errorMessage =
      'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.';
    if (
      error.code === 'auth/invalid-email' ||
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password'
    ) {
      errorMessage =
        'Falsche E-Mail oder Passwort. Bitte überprüfen Sie Ihre Eingaben.';
    }

    this.snackBar.open(errorMessage, '', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: error.code === 'auth/invalid-email' ? 'top' : 'bottom',
      panelClass: ['no-close-button'],
    });
  }

  private navigateToMainPage(): void {
    this.router.navigate(['/main'], { queryParams: { userId: this.userId } });
  }

  private showSuccessToast(message: string): void {
    this.snackBar.open(message, '', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: ['no-close-button'],
    });
  }

  showPrivacy() {
    this.dialog.open(PolicyPopupComponent, {
      panelClass: ['border', 'imprint-policy-popup'],
    });
  }

  showImprint() {
    this.dialog.open(ImprintPopupComponent, {
      panelClass: ['border', 'imprint-policy-popup'],
    });
  }

  clearStorage() {
    sessionStorage.clear();
    localStorage.clear();
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
    }, 2400);
    setTimeout(() => {
      this.backgroundState = 'mid';
    }, 2900);
    setTimeout(() => {
      this.backgroundState = 'final';
      this.setNone = true;
      this.svgTransform = 'small';
      this.textState = 'small';
    }, 2900);
    this.animationPlayed = true;
  }
}

function validateEmail(
  control: AbstractControl
): { [key: string]: any } | null {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (control.value && !emailPattern.test(control.value)) {
    return { email: true };
  }
  const dotIndex = control.value.lastIndexOf('.');
  if (dotIndex === -1 || dotIndex === control.value.length - 1) {
    return { invalidEnd: true };
  }
  return null;
}
