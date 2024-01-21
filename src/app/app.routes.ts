import { Routes } from '@angular/router';
import { LoginComponent } from './authentication/login/login.component';
import { RegisterComponent } from './authentication/register/register.component';
import { ChooseAvaterComponent } from './authentication/register/choose-avater/choose-avater.component';
import { MainChatComponent } from './main-chat/main-chat.component';

export const routes: Routes = [
  {path:'', component:LoginComponent},
  {path:'register', component:RegisterComponent},
  {path:'chooseAvatar', component:ChooseAvaterComponent},
  {path:'main', component:MainChatComponent}
];
