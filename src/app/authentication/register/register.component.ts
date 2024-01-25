import { Component, inject } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthyService } from '../../firebase-services/authy.service';
import { User, AppUser } from '../../classes/user.class';
import { AvatarDataService } from '../../firebase-services/avatar-data.service';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    MatDividerModule,
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AngularFirestoreModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  // fireStore:AngularFirestore = inject(AngularFirestore)
  checkboxChecked: boolean = false;

  loginForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });

  constructor(
    private router: Router,
    private authyService: AuthyService,
    private avatarDataService: AvatarDataService,
    // private firestore: AngularFirestore
  ) {
    this.avatarDataService.selectedAvatar$.subscribe((avatarSrc) => { });
  }



  isValidForm(): boolean {
    return this.loginForm.valid && this.checkboxChecked;
  }

  toggleCheckbox() {
    this.checkboxChecked = !this.checkboxChecked;
  }

  navigateToChooseAvatar() {
    if (this.isValidForm()) {
      const name = this.loginForm.get('name')?.value;
      const email = this.loginForm.get('email')?.value;
      const password = this.loginForm.get('password')?.value;
      this.router.navigate(['/chooseAvatar'], { queryParams: { name: name, email:email, password:password } });
    }
  }
}
