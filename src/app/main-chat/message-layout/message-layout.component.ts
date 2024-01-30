import { Component } from '@angular/core';
import {MatDividerModule} from '@angular/material/divider';

@Component({
  selector: 'app-message-layout',
  standalone: true,
  imports: [MatDividerModule],
  templateUrl: './message-layout.component.html',
  styleUrl: './message-layout.component.scss'
})
export class MessageLayoutComponent {

}
