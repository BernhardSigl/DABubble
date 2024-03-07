declare var google: any;
import { Injectable, inject } from '@angular/core';
import {
  DocumentData,
  Firestore,
  QueryDocumentSnapshot,
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Message } from '../classes/message.class';
import { Channel } from '../classes/channel.class';
import { BehaviorSubject } from 'rxjs';
import { PrivateMessage } from '../classes/private-message.class';
import { ChangeDetectorRef } from '@angular/core';
import { interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import { PrivateMessageService } from './private-message.service';
import { DrawerService } from './drawer.service';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  name!: string;
  status!: boolean;
  statusChangeable!: boolean;
  email!: string;
  profileImg!: string;
  updatedName!: string;
  usersArray: any[] = [];
  loggedInUserId!: string;
  loggedInUserArray: any[] = [];

  channel!: Channel;
  channelId!: string;
  channelsArray: any[] = [];
  currentChannelData: any[] = [];
  currentChannelName!: string;
  currentChannelId!: string;
  channelCreatedBy!: string;
  channelDescription!: string;
  channelMembers: any[] = [];
  channelMessages: any[] = [];
  channelProfileImages: any[] = [];
  channelMessagesId!: string;

  currentChannelRights: any[] = [];
  currentUserWithRights: any[] = [];
  private selectedChannelIdSource = new BehaviorSubject<string | null>(null);
  selectedChannelId$ = this.selectedChannelIdSource.asObservable();

  channelRightsIds: any[] = [];
  channelsDataWithRights: any[] = [];

  currentPrivateMessageId!: string; // onclicked
  currentPrivateMessageArray: any[] = []; // only use id's
  currentPrivateMessageMembers: any[] = []; // don't use this
  lastOpenedPrivateMessageArray!: [];
  privateMessagesArray: any[] = []; // don't use this
  privateMessageId!: string; // don't use this
  privateMessageExists: boolean = false; // don't use this
  lastOpenedElementSideNav!: string;
  router = inject(Router);
  firestore: Firestore = inject(Firestore);
  constructor(
    private privateMessageService: PrivateMessageService,
    private threadService: DrawerService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.pullLoggedInUserId();
    await this.subAllUsers();
    await this.loggedInUserData();
    await this.subAllMessages();
    await this.subAllChannels();
    await this.checkChannelRights();
    this.showOnlyChannelsWithRights();
    await this.subAllPrivateMessages();
    await this.selectLastOpenedChannel();
    this.scheduleAutomaticUpdate();
  }

  scheduleAutomaticUpdate(): void {
    interval(24 * 60 * 60 * 1000)
      .pipe(
        startWith(0),
        switchMap(() => this.updateUsersStatus())
      )
      .subscribe(() => {
        console.log('Automatische Aktualisierung abgeschlossen');
      });
  }

  async updateUsersStatus(): Promise<void> {
    const now = new Date();
    const targetTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      17,
      0
    );
    let delay = targetTime.getTime() - now.getTime();
    if (delay < 0) {
      delay += 24 * 60 * 60 * 1000;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));

    const usersSnapshot = await getDocs(collection(this.firestore, 'users'));
    const updatePromises: Promise<void>[] = [];
    usersSnapshot.forEach((userDoc) => {
      const userRef = doc(this.firestore, 'users', userDoc.id);
      console.log('test');
      const updatePromise = setDoc(
        userRef,
        {
          statusChangeable: true,
          status: false,
        },
        { merge: true }
      );
      updatePromises.push(updatePromise);
    });
    await Promise.all(updatePromises);
  }

  async subAllMessages(): Promise<void> {
    return new Promise<void>((resolve) => {
      const q = query(this.getMessagesColRef());
      onSnapshot(q, async (querySnapshot) => {
        // Handle message changes here, if necessary
        resolve();
      });
    });
  }

  getMessagesColRef() {
    return collection(this.firestore, 'messages');
  }

  async sendMessage(message: Message): Promise<void> {
    try {
      await addDoc(this.getMessagesColRef(), message.toJson());
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  async subAllUsers(): Promise<void> {
    return new Promise<void>((resolve) => {
      const q = query(this.getUsersColRef());
      onSnapshot(q, async (querySnapshot) => {
        this.usersArray = [];
        querySnapshot.forEach(async (doc) => {
          const usersData = doc.data();
          this.usersArray.push(usersData);
        });
        await this.getLoggedInUserInfos();
        if (!this.statusChangeable) {
          await this.setOnlineStatus();
        } else {
          await this.setOfflineStatus();
        }
        resolve();
      });
    });
  }

  getUsersColRef() {
    return collection(this.firestore, 'users');
  }

  getSingleUserDocRef() {
    return doc(this.getUsersColRef(), this.loggedInUserId);
  }

  async pullLoggedInUserId(): Promise<void> {
    this.loggedInUserId = await Promise.resolve(
      localStorage.getItem('userId') || ''
    );
  }

  async loggedInUserData(): Promise<void> {
    this.loggedInUserArray = this.usersArray.filter(
      (user) => user.userId === this.loggedInUserId
    );
  }

  async setOnlineStatus(): Promise<void> {
    await setDoc(this.getSingleUserDocRef(), { status: true }, { merge: true });
  }

  async setOfflineStatus(): Promise<void> {
    await setDoc(
      this.getSingleUserDocRef(),
      { status: false },
      { merge: true }
    );
  }

  async online() {
    await this.pullLoggedInUserId();
    await setDoc(
      this.getSingleUserDocRef(),
      { statusChangeable: false },
      { merge: true }
    );
    await this.ngOnInit();
  }

  async offline() {
    await setDoc(
      this.getSingleUserDocRef(),
      { statusChangeable: true },
      { merge: true }
    );
    await this.ngOnInit();
    await new Promise<void>((resolve) => {
      resolve();
    });
    google.accounts.id.disableAutoSelect();
    this.router.navigate(['/']);
  }

  async getLoggedInUserInfos(): Promise<void> {
    const loggedInUserInfo = this.usersArray.find(
      (user) => user.userId === this.loggedInUserId
    );

    this.name = loggedInUserInfo.name;
    this.status = loggedInUserInfo.status;
    this.statusChangeable = loggedInUserInfo.statusChangeable;
    this.email = loggedInUserInfo.email;
    this.profileImg = loggedInUserInfo.profileImg;
  }

  async changeName(newName: string): Promise<void> {
    await setDoc(
      this.getSingleUserDocRef(),
      { name: newName },
      { merge: true }
    );
    this.updateUserNameInMessages(
      this.loggedInUserId,
      newName,
      this.currentChannelId
    );
    this.updatedName = newName;
  }

  async changeEmail(newEmail: string): Promise<void> {
    await setDoc(
      this.getSingleUserDocRef(),
      { email: newEmail },
      { merge: true }
    );
  }

  // Email Change:

  // Channels:
  async addChannel(newChannel: Channel) {
    try {
      const result = await addDoc(this.getChannelColRef(), newChannel.toJson());
      this.channelId = result.id;
      newChannel.channelId = this.channelId;
      await this.saveChannelId(newChannel);
    } catch (error) {
      console.error('Error adding channel:', error);
    }
  }

  async saveChannelId(newChannel: Channel) {
    let docRef = this.getSingleChannelDocRef();
    await updateDoc(docRef, newChannel.toJson());
  }

  async updateChannel(updatedMembers: any) {
    await setDoc(
      this.currentOnClickedSingleChannelDocRef(),
      { members: updatedMembers },
      { merge: true }
    );
  }

  async updatedChannelName(updatedChannelName: string) {
    await setDoc(
      this.currentOnClickedSingleChannelDocRef(),
      { channelName: updatedChannelName },
      { merge: true }
    );
  }

  async updatedChannelDescription(updatedChannelDescription: string) {
    await setDoc(
      this.currentOnClickedSingleChannelDocRef(),
      { description: updatedChannelDescription },
      { merge: true }
    );
  }

  getChannelColRef() {
    return collection(this.firestore, 'channels');
  }

  getSingleChannelDocRef() {
    return doc(this.getChannelColRef(), this.channelId);
  }

  currentOnClickedSingleChannelDocRef() {
    return doc(this.getChannelColRef(), this.currentChannelId);
  }

  async subAllChannels(): Promise<void> {
    return new Promise<void>((resolve) => {
      const q = query(this.getChannelColRef());
      onSnapshot(q, async (querySnapshot) => {
        this.channelsArray = [];
        const updatePromises: Promise<void>[] = [];
        querySnapshot.forEach(async (doc) => {
          const channelsData = doc.data();
          await this.updateChannelMembers(channelsData);
          updatePromises.push(
            this.updateChannelInFirebase(
              channelsData['channelId'],
              channelsData['members']
            )
          );
          this.channelsArray.push(channelsData);
        });
        await Promise.all(updatePromises);
        resolve();
      });
    });
  }

  async updateChannelInFirebase(
    channelId: string,
    updatedMembers: any[]
  ): Promise<void> {
    const channelDocRef = doc(this.getChannelColRef(), channelId);
    try {
      await updateDoc(channelDocRef, { members: updatedMembers });
      // console.log("Channel updated successfully in Firebase");
    } catch (error) {
      // console.error("Error updating channel in Firebase: ", error);
    }
  }

  async updateChannelMembers(channelsData: any): Promise<void> {
    const updatedMembers = [];
    for (let member of channelsData.members) {
      const updatedMember = this.usersArray.find(
        (user) => user.userId === member.userId
      );
      if (updatedMember) {
        member.name = updatedMember.name;
        member.email = updatedMember.email;
      }
      updatedMembers.push(member);
    }
    channelsData.members = updatedMembers;
  }

  setSelectedChannelId(channelId: string) {
    this.selectedChannelIdSource.next(channelId);
  }

  async selectLastOpenedChannel() {
    const currentChannelId = this.loggedInUserArray[0].activeChannelId;
    const lastOpenedOnSideNav = this.loggedInUserArray[0].lastOpened;
    const correctedPrivateMessageId =
      this.correctedPrivateMessageId(currentChannelId);
    const reversePrivateMessageId =
      this.reversePrivateMessageId(currentChannelId);
    const chatPartner = this.usersArray.find(
      (chatPartners) =>
        chatPartners.userId === this.getFirstId(currentChannelId)
    );

    if (currentChannelId) {
      if (lastOpenedOnSideNav === 'channel') {
        const channelToSelect = this.channelsArray.find(
          (channel) => channel.channelId === currentChannelId
        );
        await this.activeChannelId('channel', channelToSelect.channelId);
        this.setSelectedChannelId(channelToSelect.channelId);
      } else if (lastOpenedOnSideNav === 'privateChat') {
        const privateMessageToSelect = this.privateMessagesArray.find(
          (privateMessages) =>
            privateMessages.privateMessageId === currentChannelId ||
            privateMessages.privateMessageId === reversePrivateMessageId
        );
        this.addNewPrivateMessage(chatPartner);
        await this.activeChannelId('privateChat', correctedPrivateMessageId);
        // this.lastOpenedPrivateMessageArray = privateMessageToSelect['members'][0];
      }
    }
  }

  async addNewPrivateMessage(user: any) {
    try {
      const currentUser = this.loggedInUserArray[0];
      if (!currentUser) {
        console.error('Current user not found.');
        return;
      }

      const sortedIds = [user.userId, currentUser.userId].sort();
      const uniqueChatId = sortedIds.join('_');

      let existingPrivateMessage = await this.findPrivateMessageByUniqueChatId(
        uniqueChatId
      );

      if (!existingPrivateMessage) {
        const newPrivateMessage = new PrivateMessage({
          members: [user, currentUser],
          messages: [],
          privateMessageId: uniqueChatId,
        });

        await this.saveNewPrivateMessage(newPrivateMessage, uniqueChatId);
        existingPrivateMessage = newPrivateMessage;
      }

      this.privateMessageService.setSelectedPrivateMessage(
        existingPrivateMessage
      );
      this.privateMessageService.setSelectedUser(
        user,
        existingPrivateMessage.privateMessageId
      );
      this.router.navigate(['/private-chat', user.userId]);
    } catch (error) {
      console.error('Error adding new private message:', error);
    }
  }

  getFirstId(id: string): string {
    const parts = id.split('_');
    if (parts.length === 2) {
      return parts[0]; // Gibt die ID vor dem Unterstrich zurück
    } else {
      return ''; // Wenn kein Unterstrich vorhanden ist, geben Sie einen leeren String zurück oder behandeln Sie es entsprechend
    }
  }

  correctedPrivateMessageId(str: string): string {
    const parts = str.split('_');
    if (parts.length === 2) {
      if (parts[1] === this.loggedInUserId) {
        return str;
      } else if (parts[0] === this.loggedInUserId) {
        return parts[1] + '_' + parts[0];
      }
    }
    return str;
  }

  reversePrivateMessageId(str: string): string {
    const parts = str.split('_');
    if (parts.length === 2) {
      return parts[1] + '_' + parts[0];
    } else {
      return str;
    }
  }

  async channelOrPrivateChat(channelOrPrivateChat: string): Promise<void> {
    await setDoc(
      this.getSingleUserDocRef(),
      { lastOpened: channelOrPrivateChat },
      { merge: true }
    );
  }

  async activeChannelId(
    channelOrPrivateChat: string,
    activeChannelId: string
  ): Promise<void> {
    this.currentChannelId = activeChannelId;
    await setDoc(
      this.getSingleUserDocRef(),
      { activeChannelId: this.currentChannelId },
      { merge: true }
    );

    if (channelOrPrivateChat === 'channel') {
      await this.activeChannelData();
      const createdByUserId = this.currentChannelData[0].createdBy;
      const creator = this.usersArray.find(
        (user) => user.userId === createdByUserId
      );

      (this.currentChannelName = this.currentChannelData[0].channelName),
        (this.channelMembers = this.currentChannelData[0].members);

      // noch ändern !!!
      if (creator) {
        this.channelCreatedBy = creator.name;
      } else {
        // delete
        this.channelCreatedBy = this.currentChannelData[0].createdBy; // delete
      }

      this.channelDescription = this.currentChannelData[0].description;
      this.currentChannelId = this.currentChannelData[0].channelId;
      this.channelProfileImages = this.currentChannelData[0].members.map(
        (member: any) => member.profileImg
      );
    }
  }

  async activeChannelData(): Promise<void> {
    this.currentChannelData = this.channelsArray.filter(
      (channel) => channel.channelId === this.currentChannelId
    );
  }

  async checkChannelRights() {
    this.channelRightsIds = [];
    this.channelsArray.forEach((channel) => {
      channel.members.forEach((member: any) => {
        if (member.userId.includes(this.loggedInUserId)) {
          this.channelRightsIds.push(channel.channelId);
        }
      });
    });
    this.changeChannelRights();
  }

  async changeChannelRights(): Promise<void> {
    await setDoc(
      this.getSingleUserDocRef(),
      { channelRights: this.channelRightsIds },
      { merge: true }
    );
  }

  showOnlyChannelsWithRights() {
    const filteredChannels = [];
    for (const channel of this.channelsArray) {
      if (this.channelRightsIds.includes(channel.channelId)) {
        filteredChannels.push(channel);
      }
    }

    this.currentUserWithRights = filteredChannels;

    this.channelsDataWithRights = filteredChannels;
  }

  // private messages:

  async saveNewPrivateMessage(
    newPrivateMessage: PrivateMessage,
    uniqueChatId: string
  ) {
    const privateMessagesRef = this.getPrivateMessagesColRef();
    const privateMessageDocRef = doc(privateMessagesRef, uniqueChatId);

    const privateMessageData = newPrivateMessage.toJson();

    await setDoc(privateMessageDocRef, privateMessageData);
  }

  // Inside FirebaseService class

  findPrivateMessageByMembers(members: any[]): PrivateMessage | null {
    for (const privateMessage of this.currentPrivateMessageArray) {
      const sortedMembers = privateMessage.members.sort((a: any, b: any) =>
        a.id.localeCompare(b.id)
      );
      const sortedInputMembers = members.sort((a: any, b: any) =>
        a.id.localeCompare(b.id)
      );

      const isSameMembers = sortedMembers.every(
        (member: any, index: number) => {
          return member.id === sortedInputMembers[index].id;
        }
      );

      if (isSameMembers) {
        return privateMessage;
      }
    }
    return null;
  }

  getPrivateMessagesColRef() {
    return collection(this.firestore, 'privateMessages');
  }

  async savePrivateMessageId(newPrivateMessagesArray: PrivateMessage) {
    let docRef = this.getSinglePrivateMessageDocRef();
    await updateDoc(docRef, newPrivateMessagesArray.toJson());
  }

  async getUsersInCurrentChannel(): Promise<any[]> {
    try {
      const currentChannelId = this.currentChannelId;
      const channel = this.channelsArray.find(
        (channel) => channel.channelId === currentChannelId
      );
      if (channel) {
        const members = channel.members;
        return members;
      }
      return [];
    } catch (error) {
      console.error('Error fetching users from current channel:', error);
      return [];
    }
  }

  async findPrivateMessageByUniqueChatId(
    uniqueChatId: string
  ): Promise<PrivateMessage | null> {
    const privateMessagesRef = this.getPrivateMessagesColRef();
    const q = query(
      privateMessagesRef,
      where('privateMessageId', '==', uniqueChatId)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0].data();
      return new PrivateMessage({
        privateMessageId: docData['privateMessageId'],
        members: docData['members'],
        messages: docData['messages'],
      });
    } else {
      console.log('Keine Nachricht gefunden');
      return null;
    }
  }

  // only for first creation
  getSinglePrivateMessageDocRef() {
    return doc(this.getPrivateMessagesColRef(), this.privateMessageId);
  }

  // use for after the creation
  getCurrentSinglePrivateMessageDocRef() {
    return doc(this.getPrivateMessagesColRef(), this.currentPrivateMessageId);
  }

  async subAllPrivateMessages(): Promise<void> {
    return new Promise<void>((resolve) => {
      const q = query(this.getPrivateMessagesColRef());
      onSnapshot(q, async (querySnapshot) => {
        this.privateMessagesArray = [];
        querySnapshot.forEach(async (doc) => {
          const privateMessagesData = doc.data();
          this.privateMessagesArray.push(privateMessagesData);
        });
        resolve();
      });
    });
  }

  async checkCurrentPrivateMessageId() {
    let foundMatchingMessage = false;
    for (const privateMessage of this.privateMessagesArray) {
      if (
        this.membersMatch(
          privateMessage.members,
          this.currentPrivateMessageMembers
        )
      ) {
        // log id
        this.currentPrivateMessageId = privateMessage.privateMessageId;
        // log onclicked private message array
        const onClickedPrivateMessageArray = this.privateMessagesArray.filter(
          (privateMessage) =>
            this.membersMatch(
              privateMessage.members,
              this.currentPrivateMessageMembers
            ) &&
            privateMessage.privateMessageId === this.currentPrivateMessageId
        );
        this.currentPrivateMessageArray = onClickedPrivateMessageArray[0];
        this.privateMessageExists = true;
        foundMatchingMessage = true;
        break;
      }
    }
    if (!foundMatchingMessage) {
      this.privateMessageExists = false;
    }
  }

  getPrivateMessageMembers(privateMessageId: string): any[] {
    const privateMessage = this.privateMessagesArray.find(
      (msg) => msg.privateMessageId === privateMessageId
    );
    return privateMessage ? privateMessage.members : [];
  }

  membersMatch(members1: any[], members2: any[]): boolean {
    if (members1.length !== members2.length) {
      return false;
    }
    const sortedMembers1 = members1.map((member) => member.userId).sort();
    const sortedMembers2 = members2.map((member) => member.userId).sort();
    for (let i = 0; i < sortedMembers1.length; i++) {
      if (sortedMembers1[i] !== sortedMembers2[i]) {
        return false;
      }
    }
    return true;
  }

  async updateUserNameInMessages(
    userId: string,
    newName: string,
    currentChannelId: string
  ): Promise<void> {
    try {
      const q = query(
        collection(
          this.firestore,
          `channels/${currentChannelId}/channelMessages`
        )
      );
      const querySnapshot = await getDocs(q);
      for (const doc of querySnapshot.docs) {
        try {
          const messageData = doc.data(); // Retrieve the document data
          const channelMessagesId = doc.id;
          this.channelMessagesId = channelMessagesId;
          console.log(this.channelMessagesId)
          if (messageData['senderId'] === userId) {
            const messageRef = doc.ref; // Access the document reference
            // Update the user name in the message data
            const updatedData = { ...messageData, name: newName };
            this.updatedName = newName;
            // Set the updated data back to the document
            await setDoc(messageRef, updatedData);
          }
        } catch (updateError) {
          console.error(`Error updating message: ${updateError}`);
        }
      }
    } catch (error) {
      console.error('Error updating user name in channelMessages:', error);
    }
  }

}
