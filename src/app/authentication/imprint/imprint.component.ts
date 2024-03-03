import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-imprint',
  standalone: true,
  imports: [],
  templateUrl: './imprint.component.html',
  styleUrl: './imprint.component.scss'
})
export class ImprintComponent {
  private router = inject(Router);
  constructor(private location: Location) { }

  goBack() {
    this.location.back();
  }

  openPolicy() {
    this.router.navigate(['/policy']);
  }
}
