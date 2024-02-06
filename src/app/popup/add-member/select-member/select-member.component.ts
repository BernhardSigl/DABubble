import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FirebaseService } from '../../../firebase-services/firebase.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-select-member',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './select-member.component.html',
  styleUrl: './select-member.component.scss'
})
export class SelectMemberComponent {
  checkboxAddAll: boolean;
  checkboxAddSpecific: boolean;

  constructor(
    public firebase: FirebaseService,
    public dialogRef: MatDialogRef<SelectMemberComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.checkboxAddAll = data.checkboxAddAll;
    this.checkboxAddSpecific = data.checkboxAddSpecific;
  }

  async ngOnInit(): Promise<void> {
    await this.firebase.ngOnInit();

    setInterval(() => {
      console.log(this.checkboxAddSpecific);

    }, 1000);
  }

}
