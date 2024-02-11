import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-email-sent',
  standalone: true,
  imports: [],
  templateUrl: './email-sent.component.html',
  styleUrl: './email-sent.component.scss'
})
export class EmailSentComponent {

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<EmailSentComponent>,
  ) { }

}
