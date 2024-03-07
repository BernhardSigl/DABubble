import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';

import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { UserListService } from '../firebase-services/user-list.service';
import { AuthyService } from '../firebase-services/authy.service';
import { Message } from '../classes/message.class';
import { FirebaseService } from '../firebase-services/firebase.service';
import { AddMembersRetrospectivelyComponent } from '../popup/add-members-retrospectively/add-members-retrospectively.component';
import { MatDialog } from '@angular/material/dialog';
import { ListMembersComponent } from '../popup/list-members/list-members.component';
import { EditChannelComponent } from '../popup/edit-channel/edit-channel.component';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadString,
} from 'firebase/storage';
import { Firestore, addDoc, collection, getFirestore } from '@angular/fire/firestore';
@Component({
  selector: 'app-distribute-message',
  standalone: true,
  imports: [
    MatCardModule,
    HeaderComponent,
    SideNavComponent,
    FormsModule,
    CommonModule,
    MatDividerModule,
    AngularFirestoreModule,
    AddMembersRetrospectivelyComponent,
    ListMembersComponent,
    EditChannelComponent,
    MatDividerModule,
    MatTooltipModule,
    PickerModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './distribute-message.component.html',
  styleUrl: './distribute-message.component.scss',
})
export class DistributeMessageComponent implements OnInit {
  filteredChannels: any[] = [];
  filteredUsers: any[] = [];
  showDropdown: boolean = false;
  searchQuery: string = '';
  public textArea: string = '';
  public isEmojiPickerVisible: boolean = false;
  @ViewChild('emojiPicker') emojiPicker: ElementRef | undefined;
  clickedUserIndex: number | null = null;
  mentionedUsers: { name: string; profilePicture: string }[] = [];
  userName: string = '';
  userImage: string = '';
  channelIds: string[] = [];
  selectedFile?: File;
  sendButtonDisabled: boolean = true;
  messages$!: Observable<Message[]>;
  private currentChannelId: string | null = null;
  selectedChannelIds: string[] = [];
  selectedPrivateChatId:string[]=[];

  usersToDisplay: any[]=[];
  channelsToDisplay: any[]=[];

  constructor(
    private firebase: FirebaseService,
    private router: Router,
    private firestore: Firestore
  ) {}
  
  async ngOnInit() {
    await this.firebase.ngOnInit();
  }

  convertUserId() {
    this.usersToDisplay = [];
    const privateChatIds = this.selectedPrivateChatId.map(id => id.split('_')[0]);
    const matchedUsers = this.firebase.usersArray.filter(user => privateChatIds.includes(user.userId));
    this.usersToDisplay.push(...matchedUsers);
  }

  convertChannelId() {
    this.channelsToDisplay = [];
    const matchedChannels = this.firebase.channelsArray.filter(channel => this.selectedChannelIds.includes(channel.channelId));
    this.channelsToDisplay.push(...matchedChannels)
  }

  removeUser(userToRemove: any) {
    const index = this.usersToDisplay.indexOf(userToRemove);
    if (index !== -1) {
      this.usersToDisplay.splice(index, 1);
    }
  }

  removeChannel(channelToRemove: any) {
    const index = this.channelsToDisplay.indexOf(channelToRemove);
    if (index !== -1) {
      this.channelsToDisplay.splice(index, 1);
    }
  }

  search(event: Event) {
    const query = (event.target as HTMLInputElement).value.trim();
    const searchTerm = query.substring(1).toLowerCase();
    this.searchQuery = query;

    if (query.startsWith('@')) {
      this.filteredUsers = this.filterArray(
        this.firebase.usersArray,
        'name',
        searchTerm
      );
      this.showDropdown = true;
      this.filteredChannels = []; // Reset channels
    } else if (query.startsWith('#')) {
      this.filteredChannels = this.filterChannelsWithRights(
        this.firebase.channelsArray,
        'channelName',
        searchTerm,
        this.firebase.loggedInUserId
      );
      this.showDropdown = true;
      this.filteredUsers = []; // Reset users
    } else {
      // Show both channels and users if no specific symbol is entered
      this.filteredChannels = this.filterChannelsWithRights(
        this.firebase.channelsArray,
        'channelName',
        searchTerm,
        this.firebase.loggedInUserId
      );
      this.filteredUsers = this.filterArray(
        this.firebase.usersArray,
        'name',
        searchTerm
      );
      this.showDropdown = true;
    }
  }

  filterChannelsWithRights(
    channels: any[],
    propertyName: string,
    searchTerm: string,
    userId: string
  ): any[] {
    const user = this.firebase.usersArray.find((u) => u.userId === userId);
    if (!user || !user.channelRights) {
      return []; // Return empty if no user or user has no channel rights
    }

    const filteredChannels = channels.filter((channel) => {
      const hasRight = user.channelRights.includes(channel.channelId);
      const nameMatches =
        channel &&
        channel[propertyName] &&
        channel[propertyName].toLowerCase().includes(searchTerm);
      return hasRight && nameMatches;
    });

    return filteredChannels;
  }

  filterArray(array: any[], propertyName: string, searchTerm: string): any[] {
    return array.filter((item) => {
      return (
        item &&
        item[propertyName] &&
        item[propertyName].toLowerCase().includes(searchTerm)
      );
    });
  }

  async navigateToChannel(channelId: string) {
    const channel = this.filteredChannels.find(
      (c) => c.channelId === channelId
    );
    if (channel) {
      this.selectedChannelIds.push(channel.channelId); // Push channelId into the array
      this.updateInputValue(channel.channelName);
      this.convertChannelId();
    }
  }
  
  async navigateToUser(userId: string) {
    const user = this.filteredUsers.find((u) => u.userId === userId);
    this.selectedPrivateChatId.push(user.userId+'_'+  this.firebase.loggedInUserId)  ;

    if (user) {
      this.updateInputValue(user.name);
      this.convertUserId();
    }
    // Additional logic if needed
  }

  private updateInputValue(value: string) {
    const inputElement = document.querySelector('.distributor-input') as HTMLInputElement;
    if (inputElement) {
      inputElement.value = '';
    }

    // const inputElement = document.querySelector(
    //   '.distributor-input'
    // ) as HTMLInputElement;
    // if (inputElement) {
    //   const currentValue = inputElement.value;
    //   if (currentValue) {
    //     // Check if the current value starts with '#' or '@'
    //     if (currentValue.startsWith('#') || currentValue.startsWith('@')) {
    //       // If yes, replace the current value with the new value
    //       inputElement.value = value + ', ';
    //     } else {
    //       // If not, append the new value to the current value with a comma
    //       inputElement.value = currentValue + ', ' + value;
    //     }
    //   } else {
    //     inputElement.value = value + ', ';
    //     this.showDropdown = false;
    //   }
    // }
  }

  async sendMessage(): Promise<void> {
    try {
      if (this.textArea.trim() || this.selectedFile) {
        const newMessage = new Message();
        newMessage.senderId = this.firebase.loggedInUserId;
        newMessage.message = [this.textArea.trim()];
        newMessage.time = Date.now();
        newMessage.name = this.firebase.loggedInUserArray[0].name;
        newMessage.image = this.firebase.loggedInUserArray[0].profileImg;
  
        // Check if any channel is selected
        if (this.selectedChannelIds.length > 0) {
          // Iterate over each selected channel ID and send the message
          for (const channelId of this.selectedChannelIds) {
            await this.sendMessageToChannel(newMessage, channelId);
          }
        }
        if(this.selectedPrivateChatId.length>0){
          for(const pcId of this.selectedPrivateChatId){
            await this.sendMessageToPrivateChat(newMessage,pcId)
          }
        }
  
        this.clearInputFields();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
  
  
  
  async sendMessageToChannel(newMessage: Message, channelId: string): Promise<void> {
    try {
      if (channelId) {
        const channelMessagesCollectionPath = `channels/${channelId}/channelMessages`;
  
        if (this.selectedFile) {
          await this.uploadSelectedFile(newMessage, channelMessagesCollectionPath);
        } else {
          await addDoc(
            collection(this.firestore, channelMessagesCollectionPath),
            newMessage.toJson()
          );
        }
      } else {
        console.error('No channel ID provided.');
      }
    } catch (error) {
      console.error('Error sending message to channel:', error);
    }
  }
  
  
  async sendMessageToPrivateChat(newMessage: Message,pcId:string): Promise<void> {
    try {
      if (pcId) {
        const messagesCollectionPath = `privateMessages/${pcId}/messages`;
  
        if (this.selectedFile) {
          await this.uploadSelectedFile(newMessage, messagesCollectionPath);
        } else {
          await addDoc(
            collection(this.firestore, messagesCollectionPath),
            newMessage.toJson()
          );
        }
      } else {
        console.error('No private chat selected.');
      }
    } catch (error) {
      console.error('Error sending message to private chat:', error);
    }
  }
  

  private subscribeToChannelChanges(): void {
    // This subscription will update the local variable whenever the selected channel changes.
    // Make sure to unsubscribe properly to avoid memory leaks, e.g., by using a takeUntil mechanism or unsubscribing in ngOnDestroy.
    this.firebase.selectedChannelId$.subscribe((channelId) => {
      this.currentChannelId = channelId;
    });
  }

  toggleEmojiPicker() {
    this.isEmojiPickerVisible = !this.isEmojiPickerVisible;
  }

  addEmoji(event: { emoji: { native: any } }) {
    this.textArea += event.emoji.native;
    this.isEmojiPickerVisible = false;
  }

  private async uploadSelectedFile(
    newMessage: Message,
    channelId: string
  ): Promise<void> {
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `files/${this.selectedFile!.name}`);
      const fileDataUrl = await this.readFileDataUrl(this.selectedFile!);

      await uploadString(storageRef, fileDataUrl, 'data_url');

      // Get the download URL for the uploaded file
      const downloadURL = await getDownloadURL(storageRef);

      newMessage.messageImage = downloadURL; // Set the download URL to the message

      const messageId = await this.addMessageToFirestore(newMessage, channelId);
      newMessage.messageId = messageId;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error; // Re-throw the error to propagate it upwards
    }
  }

  private async readFileDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        resolve(fileReader.result as string);
      };
      fileReader.onerror = reject;
      fileReader.readAsDataURL(file);
    });
  }

  private async addMessageToFirestore(
    newMessage: Message,
    channelId: string
  ): Promise<string> {
    const channelMessagesRef = collection(
      this.firestore,
      'channels',
      channelId,
      'channelMessages'
    );
    const messageRef = await addDoc(channelMessagesRef, newMessage.toJson());
    return messageRef.id;
  }

  private clearInputFields(): void {
    this.textArea = '';
    this.selectedFile = undefined;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  // mention User

  onTextAreaChange() {
    this.suggestUsers();
  }

  suggestUsers() {
    if (this.textArea.includes('@')) {
      // Filter users from the channel based on the input value
      this.firebase
        .getUsersInCurrentChannel()
        .then((users) => {
          this.mentionedUsers = users
            .filter((user) =>
              user.name
                .toLowerCase()
                .includes(
                  this.textArea
                    .toLowerCase()
                    .slice(this.textArea.lastIndexOf('@') + 1)
                )
            )
            .map((user) => ({
              name: user.name,
              profilePicture: user.profileImg,
            }));
        })
        .catch((error) => {
          console.error('Error suggesting users:', error);
        });
    } else {
      this.mentionedUsers = [];
    }
  }

  selectMention(index: number) {
    // Handle mention selection
    // Insert the selected mention into the textarea
    const mentionedUser = this.mentionedUsers[index];
    this.textArea = this.textArea.replace(`@${mentionedUser.name}`, ''); // Remove mention from the textarea
    this.textArea += `${mentionedUser.name} `;
    this.mentionedUsers = []; // Clear mentioned users after selection
  }

  addMention() {
    // Add '@' to the text area
    this.textArea += '@';
    this.suggestUsers();
    this.onTextAreaChange();
  }
}
