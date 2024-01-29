import { Component , ElementRef , ViewChild} from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PickerModule } from "@ctrl/ngx-emoji-mart";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-message-box',
  standalone: true,
  imports: [MatDividerModule, MatTooltipModule,PickerModule, CommonModule, FormsModule],
  templateUrl: './message-box.component.html',
  styleUrl: './message-box.component.scss',
})
export class MessageBoxComponent {
  public textArea: string = "";
  public isEmojiPickerVisible: boolean = false;
  @ViewChild('emojiPicker') emojiPicker: ElementRef | undefined;


  constructor(private elementRef: ElementRef) {}

  toggleEmojiPicker() {
    this.isEmojiPickerVisible = !this.isEmojiPickerVisible;
  }

  addEmoji(event: { emoji: { native: any } }) {
    this.textArea += event.emoji.native;
    this.isEmojiPickerVisible = false;
  }


}
