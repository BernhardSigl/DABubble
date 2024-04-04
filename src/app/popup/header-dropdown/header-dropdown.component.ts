import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ViewProfileComponent } from '../view-profile/view-profile.component';
import { FirebaseService } from '../../firebase-services/firebase.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ImprintPopupComponent } from '../imprint-popup/imprint-popup.component';
import { PolicyPopupComponent } from '../policy-popup/policy-popup.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-dropdown',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './header-dropdown.component.html',
  styleUrl: './header-dropdown.component.scss',
})
export class HeaderDropdownComponent {
  isLoading: boolean = false;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<HeaderDropdownComponent>,
    public firebase: FirebaseService
  ) {}

  showProfile() {
    this.dialogRef.close();
    this.dialog.open(ViewProfileComponent, {
      position: { top: '6.875rem', right: '1.25rem' },
      panelClass: ['view-profile-dropdown-popup'],
    });
  }

  logOut() {
    this.isLoading = true;
    this.dialogRef.close();
    this.firebase.offline();
    this.isLoading = false;
  }

  showImprint() {
    this.dialogRef.close();
    this.dialog.open(ImprintPopupComponent, {
      panelClass: ['border', 'imprint-policy-popup'],
    });
  }

  showPrivacy() {
    this.dialogRef.close();
    this.dialog.open(PolicyPopupComponent, {
      panelClass: ['border', 'imprint-policy-popup'],
    });
  }
}
