import { Routes } from '@angular/router';
import { LoginComponent } from './authentication/login/login.component';
import { RegisterComponent } from './authentication/register/register.component';
import { ChooseAvaterComponent } from './authentication/register/choose-avater/choose-avater.component';
import { MainChatComponent } from './main-chat/main-chat.component';
import { ForgetPasswordComponent } from './authentication/forget-password/forget-password.component';
import { ResetPasswordComponent } from './authentication/reset-password/reset-password.component';
import { AuthGuard } from './firebase-services/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {path:'login', component:LoginComponent},
  {path:'register', component:RegisterComponent},
  {path:'chooseAvatar', component:ChooseAvaterComponent},
  {path:'main', component:MainChatComponent,canActivate: [AuthGuard] },
  {path:'forgot', component:ForgetPasswordComponent},
  {path:'reset', component:ResetPasswordComponent}
];
