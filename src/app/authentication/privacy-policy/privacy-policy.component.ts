import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {
  private router = inject(Router);
  constructor(private location: Location) { }

  goBack() {
    this.location.back();
  }

  openImprint() {
    this.router.navigate(['/imprint']);
  }
}
