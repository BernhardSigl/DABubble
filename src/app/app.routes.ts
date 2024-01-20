import { Routes } from '@angular/router';
import { LoginComponent } from './authentication/login/login.component';
import { RegisterComponent } from './authentication/register/register.component';

export const routes: Routes = [
  {path:'', component:LoginComponent},
  {path:'register', component:RegisterComponent}
];
