import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-imprint-popup',
  standalone: true,
  imports: [],
  templateUrl: './imprint-popup.component.html',
  styleUrl: './imprint-popup.component.scss'
})
export class ImprintPopupComponent {
constructor(public dialogRef: MatDialogRef<ImprintPopupComponent>,){}
}
