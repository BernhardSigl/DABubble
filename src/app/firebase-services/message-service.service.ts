import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Message } from '../classes/message.class';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
@Injectable({
  providedIn: 'root'
})
export class MessageServiceService {
  public contentContainer: any
  constructor(private breakpointObserver: BreakpointObserver) {
  }

  // pmMessageToJson(message: Message): any {
  //   return {
  //     sender: message.sender,
  //     profileImg: message.profileImg,
  //     content: message.content,
  //     reactions: message.reactions,
  //     creationDate: message.creationDate,
  //     creationTime: message.creationTime,
  //     creationDay: message.creationDay,
  //     id: message.id,
  //     collectionId: message.collectionId,
  //     messageType: message.messageType,
  //     thread: message.thread,
  //   };
  // }

}
