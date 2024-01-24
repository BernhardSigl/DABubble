import { Component , OnInit} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { AuthyService } from '../../firebase-services/authy.service';
import { HotToastService } from '@ngneat/hot-toast';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,

    MatInputModule
  ],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss',
})
export class ForgetPasswordComponent implements OnInit{

  emailForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  })

  constructor(private authService:AuthyService,private toast: HotToastService){}

  ngOnInit(): void {

  }

  async sendResetEmail() {
    const email = this.emailForm.get('email')?.value;

    if (email) {
      try {
        const emailExists = await this.authService.checkEmailExists(email);

        if (emailExists) {
          await this.authService.forgotPassword(email);
          this.toast.success('Reset email sent successfully');
          console.log('Reset email sent successfully');
        } else {
          console.log('Email is not registered in the system.');
        }
      } catch (error) {
        console.error('Error:', error);
        this.toast.error('An error occurred');
      }
    }
  }


}
