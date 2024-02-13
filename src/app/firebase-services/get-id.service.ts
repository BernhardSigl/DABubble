import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  getDocs,
  DocumentData,
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GetIdService {
  constructor(private firestore: Firestore) {}
  private currentChannelIdSource = new BehaviorSubject<string | null>(null);
  currentChannelId$ = this.currentChannelIdSource.asObservable();

  getMessageIds(channelId: string): Observable<string[]> {
    const channelMessagesCollection = collection(this.firestore, 'channels', channelId, 'channelMessages');
    const messageIdsQuery = query(channelMessagesCollection);

    return new Observable<string[]>((observer) => {
      getDocs(messageIdsQuery)
        .then((querySnapshot) => {
          const messageIds: string[] = [];
          querySnapshot.forEach((doc) => {
            messageIds.push(doc.id);
          });
          observer.next(messageIds);
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }


  getThreadIds(channelId: string, messageId: string): Observable<string[]> {
    const threadsCollection = collection(this.firestore, 'channels', channelId, 'channelMessages', messageId, 'threads');
    const threadsQuery = query(threadsCollection);

    return new Observable<string[]>((observer) => {
      getDocs(threadsQuery)
        .then((querySnapshot) => {
          const threadIds: string[] = [];
          querySnapshot.forEach((doc) => {
            threadIds.push(doc.id);
          });
          observer.next(threadIds);
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }
  getChannelIds(): Observable<string[]> {
    const channelsCollection = collection(this.firestore, 'channels');
    const channelsQuery = query(channelsCollection);

    return new Observable<string[]>((observer) => {
      getDocs(channelsQuery)
        .then((querySnapshot) => {
          const channelIds: string[] = [];
          querySnapshot.forEach((doc) => {
            channelIds.push(doc.id);
          });
          observer.next(channelIds);
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  setCurrentChannelId(channelId: string) {
    this.currentChannelIdSource.next(channelId);
  }
}
