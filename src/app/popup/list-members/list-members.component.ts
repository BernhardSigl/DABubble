import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { AddMembersRetrospectivelyComponent } from '../add-members-retrospectively/add-members-retrospectively.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-list-members',
  standalone: true,
  imports: [
    CommonModule,
    AddMembersRetrospectivelyComponent
  ],
  templateUrl: './list-members.component.html',
  styleUrl: './list-members.component.scss'
})
export class ListMembersComponent {

constructor(
  public firebase: FirebaseService,
  public dialog: MatDialog,
  public dialogRef: MatDialogRef<ListMembersComponent>,
){}

async ngOnInit(): Promise<void> {
  await this.firebase.ngOnInit();
}

addMemberDropdown() {
  this.dialogRef.close();
  this.dialog.open(AddMembersRetrospectivelyComponent, {
    position: { top: '210px', right: '550px' },
    panelClass: 'no-border-tr',
  });
}

}
