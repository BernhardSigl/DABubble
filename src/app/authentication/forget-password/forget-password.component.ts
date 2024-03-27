import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { AuthyService } from '../../firebase-services/authy.service';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [
    MatFormFieldModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatInputModule,
  ],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss',
})
export class ForgetPasswordComponent implements OnInit {
  emailForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  constructor(
    private authService: AuthyService,
    private snackBar: MatSnackBar,
    private router:Router
  ) {}

  ngOnInit(): void {}

  async sendResetEmail() {
    const email = this.emailForm.get('email')?.value;

    if (email) {
      try {
        const emailExists = await this.authService.checkEmailExists(email);

        if (emailExists) {
          await this.authService.forgotPassword(email);
          this.snackBar.open('Email sent to reset', '', {
            duration: 3000, // Duration the toast is shown (in milliseconds)
            horizontalPosition: 'right', // Position of the toast
            verticalPosition: 'bottom',
            panelClass: ['no-close-button'], 
          });
        } else {
          this.snackBar.open(
            'Email is not registered in the system.',
            'Close',
            {
              duration: 3000, // Duration the toast is shown (in milliseconds)
              horizontalPosition: 'right', // Position of the toast
              verticalPosition: 'bottom',
              panelClass: ['no-close-button'], 
            }
          );
        }
      } catch (error) {
        console.error('Error:', error);
        this.snackBar.open(
          'Error sending mail',
          'Close',
          {
            duration: 3000, // Duration the toast is shown (in milliseconds)
            horizontalPosition: 'right', // Position of the toast
            verticalPosition: 'bottom',
            panelClass: ['no-close-button'], 
          }
        );
      }
    }
    this.router.navigate(['/login'])
  }
}
