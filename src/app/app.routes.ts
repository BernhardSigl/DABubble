import { Routes } from '@angular/router';
import { LoginComponent } from './authentication/login/login.component';
import { RegisterComponent } from './authentication/register/register.component';
import { ChooseAvaterComponent } from './authentication/register/choose-avater/choose-avater.component';
import { MainChatComponent } from './main-chat/main-chat.component';
import { ForgetPasswordComponent } from './authentication/forget-password/forget-password.component';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import {
  canActivate,
  redirectUnauthorizedTo,
  redirectLoggedInTo,
} from '@angular/fire/auth-guard';
import { PrivateChatComponent } from './private-chat/private-chat.component';
import { ImprintComponent } from './authentication/imprint/imprint.component';
import { PrivacyPolicyComponent } from './authentication/privacy-policy/privacy-policy.component';
import { DistributeMessageComponent } from './distribute-message/distribute-message.component';

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
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'imprint',
    component: ImprintComponent,
  },
  {
    path: 'policy',
    component: PrivacyPolicyComponent,
  },
  { path: 'forgot', 
    component: ForgetPasswordComponent },
  {
    path: 'main',
    component: MainChatComponent,
    canActivate: [redirectLoggedIn],
  },
  {
    path: 'main/:channelId',
    component: MainChatComponent,
    canActivate: [redirectLoggedIn],
  },
  {
    path: 'chooseAvatar',
    component: ChooseAvaterComponent,
    canActivate: [redirectLoggedIn],
  },

  {
    path: 'distributor',
    component: DistributeMessageComponent,
    canActivate: [redirectLoggedIn],
  },
  {
    path: 'private-chat/:userId',
    component: PrivateChatComponent,
    canActivate: [redirectLoggedIn],
  },

  { path: '**', redirectTo: 'login' },
];