import { Component } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthenticationService } from '../../firebase-services/authentication.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthyService } from '../../firebase-services/authy.service';
import { UserData,AppUser } from '../../classes/user.class';
import { AvatarDataService } from '../../firebase-services/avatar-data.service';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    MatDividerModule,
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AngularFirestoreModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  checkboxChecked: boolean = false;

  loginForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  })

  constructor(private router: Router, private authyService:AuthyService,    private avatarDataService: AvatarDataService) {
        this.avatarDataService.selectedAvatar$.subscribe((avatarSrc) => {
          console.log('Selected Avatar:', avatarSrc);
        });
  }

  async registerUser() {
    if (this.isValidForm()) {
      const formData = this.loginForm.value;

      const userData: UserData = {
        name: formData.name || '',
        email: formData.email || '',
        userId: '',
        profileImg: '',
        password: formData.password || '',
      };

      const user = new AppUser(userData);

      try {
        const userCredential = await this.authyService.registerWithEmailAndPassword(
          user
        );
        this.router.navigate(['/chooseAvatar'], {
          queryParams: { name: user.name },
        });
      } catch (error) {
        console.error(error);
        alert('Registration failed. Please try again.');
      }
    }
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
      this.router.navigate(['/chooseAvatar'], { queryParams: { name: name } });
    }
  }
}
