import { Component } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AvatarDataService } from '../../firebase-services/avatar-data.service';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { PolicyPopupComponent } from '../../popup/policy-popup/policy-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { ImprintPopupComponent } from '../../popup/imprint-popup/imprint-popup.component';
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
  checkboxChecked: boolean = false;
  showCheckboxError: boolean = false;

  loginForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email, validateEmail]),
    password: new FormControl('', Validators.required),
  });

  constructor(
    private router: Router,
    private avatarDataService: AvatarDataService,
    public dialog: MatDialog,
  ) {
    this.avatarDataService.selectedAvatar$.subscribe((avatarSrc) => { });
  }

  ngOnInit() {
    this.loadFromLocalStorage();
  }

  isValidForm(): boolean {
    return this.loginForm.valid && this.checkboxChecked;
  }

  toggleCheckbox() {
    this.checkboxChecked = !this.checkboxChecked;
    if (this.checkboxChecked) {
      this.showCheckboxError = false;
    } else {
      this.showCheckboxError = true;
    }
  }

  navigateToChooseAvatar() {
    if (!this.checkboxChecked) {
      this.showCheckboxError = true;
    }
    this.loginForm.get('password')?.markAsTouched();
    this.loginForm.get('email')?.markAsTouched();
    this.loginForm.get('name')?.markAsTouched();
    
    if (this.isValidForm()) {
      const name = this.loginForm.get('name')?.value;
      const email = this.loginForm.get('email')?.value;
      const password = this.loginForm.get('password')?.value;
      this.saveToLocalStorage();
      this.router.navigate(['/chooseAvatar'], { queryParams: { name: name, email:email, password:password } });
    }
  }

  saveToLocalStorage() {
    const name = this.loginForm.get('name')?.value ?? '';
    const email = this.loginForm.get('email')?.value ?? '';
    const password = this.loginForm.get('password')?.value ?? '';
    const checkbox = this.loginForm.get('checkbox')?.value ?? true;
  
    localStorage.setItem('name', name);
    localStorage.setItem('email', email);
    localStorage.setItem('password', password);
    localStorage.setItem('checkbox', checkbox.toString());
  }

  loadFromLocalStorage() {
    const name = localStorage.getItem('name');
    const email = localStorage.getItem('email');
    const password = localStorage.getItem('password');
    const checkbox = localStorage.getItem('checkbox');


    if (name) {
      this.loginForm.get('name')?.setValue(name);
    }
    if (email) {
      this.loginForm.get('email')?.setValue(email);
    }
    if (password) {
      this.loginForm.get('password')?.setValue(password);
    }
    if (checkbox && checkbox === 'true') {
     this.toggleCheckbox();
    }
  }

  showPrivacy(){
    this.dialog.open(PolicyPopupComponent, {
      panelClass: ['border', 'imprint-policy-popup']
    });
  }

  showImprint() {
    this.dialog.open(ImprintPopupComponent, {
      panelClass: ['border', 'imprint-policy-popup']
    });
  }
}

function validateEmail(control: AbstractControl): { [key: string]: any } | null {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (control.value && !emailPattern.test(control.value)) {
    return { 'email': true };
  }
  const dotIndex = control.value.lastIndexOf('.');
  if (dotIndex === -1 || dotIndex === control.value.length - 1) {
    return { 'invalidEnd': true };
  }
  return null;
}
