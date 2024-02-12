import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  getDocs,
  DocumentData,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GetIdService {
  constructor(private firestore: Firestore) {}

  getMessageIds(): Observable<string[]> {
    const messageIdsCollection = collection(this.firestore, 'messages');
    const messageIdsQuery = query(messageIdsCollection);

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

  getThreadIds(messageId: string): Observable<string[]> {
    const threadsCollection = collection(
      collection(this.firestore, 'messages', messageId),
      'threads'
    );
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
}
