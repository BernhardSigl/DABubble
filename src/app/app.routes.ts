import { Routes } from '@angular/router';
import { LoginComponent } from './authentication/login/login.component';
import { RegisterComponent } from './authentication/register/register.component';
import { ChooseAvaterComponent } from './authentication/register/choose-avater/choose-avater.component';
import { MainChatComponent } from './main-chat/main-chat.component';
import { ForgetPasswordComponent } from './authentication/forget-password/forget-password.component';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import { canActivate, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';

const redirectLoggedIn = () => redirectUnauthorizedTo(['login']);
const redirectToMain = () => redirectLoggedInTo(['main']);

export const routes: Routes = [

  {
    path: 'login',
    component: LoginComponent,
    canActivate: [redirectToMain],
  },
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full',
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'main',
    component: MainChatComponent,
    canActivate: [redirectLoggedIn],
  },
  { path: 'chooseAvatar',
    component: ChooseAvaterComponent,
    canActivate: [redirectLoggedIn], // This ensures that the user can only access choose-avatar after logging in.
  },
  { path: '**', redirectTo: 'login' },
];
