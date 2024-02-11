declare var google: any;
import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, doc, getDocs, onSnapshot, query, setDoc, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Message } from '../classes/message.class';
import { Channel } from '../classes/channel.class';

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

  channel!: Channel;
  channelsArray: any[] = [];

  router = inject(Router);
  firestore: Firestore = inject(Firestore);
  constructor(
  ) { }

  async ngOnInit(): Promise<void> {
    await this.pullLoggedInUserId();
    await this.subAllUsers();
    await this.subAllMessages();
    await this.subAllChannels();
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
    });
  }

  getChannelColRef() {
    return collection(this.firestore, "channels");
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

  async channelIsActiveToFalse(): Promise<void> {
    const querySnapshot = await getDocs(this.getChannelColRef());
    querySnapshot.forEach(async doc => {
      await updateDoc(doc.ref, { channelIsActive: false });
    });
  }
}
