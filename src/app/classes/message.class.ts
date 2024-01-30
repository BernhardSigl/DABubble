interface MessageData {
  creationTime: string;
  sender: string;
  profileImg: string;
  content: string;
  thread: any[];
  reactions: [];
  creationDate: number;
  id: number;
  collectionId: string;
  creationDay: string;
  messageType: string;
  senderId: string;
  recipientId: string;
}

interface ThreadMessageData {
  sender: string;
  profileImg: string;
  content: string;
  reactions: [];
  timeWhenCreated: string;
  creationDate: number;
  id: number;
  creationTime: string;
  collectionId: string;
  creationDay: string;
  messageType: string;
  senderId: string;
  recipientId: string;
}

export class Message {
  sender: string;
  profileImg: string;
  content: string;
  thread: any[];
  reactions: [];
  timeWhenCreated: string | undefined;
  creationDate: number;
  id: number;
  creationTime: string;
  collectionId: string;
  creationDay: string;
  messageType: string;
  senderId: string;
  recipientId: string;

  constructor(data?: MessageData) {
    this.sender = data?.sender || '';
    this.content = data?.content || '';
    this.profileImg = data?.profileImg || '';
    this.thread = data?.thread || [];
    this.reactions = data?.reactions || [];
    this.creationDate = data?.creationDate || 0;
    this.creationTime = data?.creationTime || '';
    this.creationDay = data?.creationDay || '';
    this.id = data?.id || 0;
    this.collectionId = data?.collectionId || '';
    this.messageType = data?.messageType || '';
    this.senderId = data?.senderId || '';
    this.recipientId = data?.recipientId || '';
  }

  private threadMessageToJSON(message: ThreadMessageData): any {
    return {
      sender: message.sender,
      profileImg: message.profileImg,
      content: message.content,
      reactions: message.reactions,
      creationDate: message.creationDate,
      creationTime: message.creationTime,
      creationDay: message.creationDay,
      id: message.id,
      collectionId: message.collectionId,
      messageType: message.messageType,
    };
  }

  toJSON() {
    const threadAsJSON = this.thread.map((threadMessage) =>
      this.threadMessageToJSON(threadMessage)
    );

    return {
      sender: this.sender,
      profileImg: this.profileImg,
      content: this.content,
      thread: threadAsJSON,
      reactions: this.reactions,
      creationDate: this.creationDate,
      creationTime: this.creationTime,
      creationDay: this.creationDay,
      id: this.id,
      collectionId: this.collectionId,
      messageType: this.messageType,
      senderId: this.senderId,
      recipientId: this.recipientId,
    };
  }
}
