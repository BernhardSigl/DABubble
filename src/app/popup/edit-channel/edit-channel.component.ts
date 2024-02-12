import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-edit-channel',
  standalone: true,
  imports: [
    MatDividerModule
  ],
  templateUrl: './edit-channel.component.html',
  styleUrl: './edit-channel.component.scss'
})
export class EditChannelComponent {


constructor(
  public dialogRef: MatDialogRef<EditChannelComponent>,
  public firebase: FirebaseService,
) {}


async ngOnInit(): Promise<void>{
  await this.firebase.ngOnInit();
  }
}


