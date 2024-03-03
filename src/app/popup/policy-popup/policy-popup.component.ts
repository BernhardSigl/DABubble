import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-policy-popup',
  standalone: true,
  imports: [],
  templateUrl: './policy-popup.component.html',
  styleUrl: './policy-popup.component.scss'
})
export class PolicyPopupComponent {
  constructor(public dialogRef: MatDialogRef<PolicyPopupComponent>,){}
}
