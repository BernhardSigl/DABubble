declare var google: any;
import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, doc, getDocs, onSnapshot, query, setDoc, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Message } from '../classes/message.class';
import { Channel } from '../classes/channel.class';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  name!: string;
  status!: boolean;
  statusChangeable!: boolean;
  email!: string;
  profileImg!: string;

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
  channelMessages:  any[] = [];
  channelProfileImages:  any[] = [];
  currentChannelRights: any[] = [];
  currentUserWithRights: any[] = [];
  private selectedChannelIdSource = new BehaviorSubject<string | null>(null);
selectedChannelId$ = this.selectedChannelIdSource.asObservable();
  router = inject(Router);
  firestore: Firestore = inject(Firestore);
  constructor(
  ) { }

  async ngOnInit(): Promise<void> {
    await this.pullLoggedInUserId();
    await this.subAllUsers();
    await this.loggedInUserData();
    await this.subAllMessages();
    await this.subAllChannels();
    await this.selectLastOpenedChannel();
    await this.checkChannelRights();
    this.showOnlyChannelsWithRights();
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
    return collection(this.firestore, "messages");
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
    return collection(this.firestore, "users");
  }

  getSingleUserDocRef() {
    return doc(this.getUsersColRef(), this.loggedInUserId);
  }

  async pullLoggedInUserId(): Promise<void> {
    this.loggedInUserId = await Promise.resolve(localStorage.getItem('userId') || '');
  }

  async loggedInUserData(): Promise<void> {
    this.loggedInUserArray = this.usersArray.filter(user => user.userId === this.loggedInUserId);
  }

  async setOnlineStatus(): Promise<void> {
    await setDoc(this.getSingleUserDocRef(), { status: true }, { merge: true });
  }

  async setOfflineStatus(): Promise<void> {
    await setDoc(this.getSingleUserDocRef(), { status: false }, { merge: true });
  }

  async online() {
    await this.pullLoggedInUserId();
    await setDoc(this.getSingleUserDocRef(), { statusChangeable: false }, { merge: true });
    await this.ngOnInit();
  }

  async offline() {
    await setDoc(this.getSingleUserDocRef(), { statusChangeable: true }, { merge: true });
    await this.ngOnInit();
    await new Promise<void>((resolve) => {
      resolve();
    });
    google.accounts.id.disableAutoSelect();
    this.router.navigate(['/']);
  }

  async getLoggedInUserInfos(): Promise<void> {
    const loggedInUserInfo = this.usersArray.find(user => user.userId === this.loggedInUserId);

    this.name = loggedInUserInfo.name;
    this.status = loggedInUserInfo.status;
    this.statusChangeable = loggedInUserInfo.statusChangeable;
    this.email = loggedInUserInfo.email;
    this.profileImg = loggedInUserInfo.profileImg;
  }

  async changeName(newName: string): Promise<void> {
    await setDoc(this.getSingleUserDocRef(), { name: newName }, { merge: true });
  }

  async changeEmail(newEmail: string): Promise<void> {
    await setDoc(this.getSingleUserDocRef(), { email: newEmail }, { merge: true });
  }

  // Email Change:

  // Channels:
  async addChannel(newChannel: Channel) {
    await addDoc(this.getChannelColRef(), newChannel.toJson()).then((result: any) => {
      this.channelId = result.id;
      newChannel.channelId = this.channelId;
      this.saveChannelId(newChannel);
    });
  }

  async saveChannelId(newChannel: Channel) {
    let docRef = this.getSingleChannelDocRef();
    await updateDoc(docRef, newChannel.toJson());
  }

  async updateChannel(updatedMembers: any) {
    await setDoc(this.currentOnClickedSingleChannelDocRef(), { members: updatedMembers }, { merge: true });
  }

  async updatedChannelName(updatedChannelName: string) {
    await setDoc(this.currentOnClickedSingleChannelDocRef(), { channelName: updatedChannelName }, { merge: true });
  }

  async updatedChannelDescription(updatedChannelDescription: string) {
    await setDoc(this.currentOnClickedSingleChannelDocRef(), { description: updatedChannelDescription }, { merge: true });
  }

  getChannelColRef() {
    return collection(this.firestore, "channels");
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
        querySnapshot.forEach(async (doc) => {
          const channelsData = doc.data();
          this.channelsArray.push(channelsData);
        });
        resolve();
      });
    });
  }

  setSelectedChannelId(channelId: string) {
    console.log('Setting selected channel ID:', channelId);
    this.selectedChannelIdSource.next(channelId);
  }

  async selectLastOpenedChannel() {
    const currentChannelId = this.loggedInUserArray[0].activeChannelId;
    if (currentChannelId) {
      const channelToSelect = this.channelsArray.find(channel => channel.channelId === currentChannelId);
      if (channelToSelect) {
        await this.activeChannelId(channelToSelect.channelId);
      }
    }
  }

  async activeChannelId(activeChannelId: string): Promise<void> {
    this.currentChannelId = activeChannelId;
    await setDoc(this.getSingleUserDocRef(), { activeChannelId: this.currentChannelId }, { merge: true });
    await this.activeChannelData();
    this.currentChannelName = this.currentChannelData[0].channelName,
    this.channelMembers = this.currentChannelData[0].members;
    this.channelCreatedBy = this.currentChannelData[0].createdBy;
    this.channelDescription = this.currentChannelData[0].description;
    this.currentChannelId = this.currentChannelData[0].channelId;
    this.channelProfileImages = this.currentChannelData[0].members.map((member: any) => member.profileImg);
  }

  async activeChannelData(): Promise<void> {
    this.currentChannelData = this.channelsArray.filter(channel => channel.channelId === this.currentChannelId);
  }

  async checkChannelRights() {
    this.currentChannelRights = [];
    this.channelsArray.forEach(channel => {
      channel.members.forEach((member: any) => {
        if (member.userId.includes(this.loggedInUserId)) {
          this.currentChannelRights.push(channel.channelId);
        }
      });
    });
    this.changeChannelRights();
  }

  async changeChannelRights(): Promise<void> {
    await setDoc(this.getSingleUserDocRef(), { channelRights: this.currentChannelRights }, { merge: true });
  }

  showOnlyChannelsWithRights() {
      const filteredChannels = [];
      for (const channel of this.channelsArray) {
    if (this.currentChannelRights.includes(channel.channelId)) {
      filteredChannels.push(channel);
    }
  }
  this.currentUserWithRights = filteredChannels;
  }

}
