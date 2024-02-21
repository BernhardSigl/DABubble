export class Message {
  public messageId: string = '';
  public name: string = '';
  public time: number | string = '';
  public message: string[] = [];
  public threads: Thread[] = [];
  public image: string = '';
  public messageImage: string | undefined = '';
  public senderId: string = '';
  public reactions: { [key: string]: any } = {};
  public users: { [key: string]: number } = {};
  reactionsByUser?: ReactionsByUser;
  public threadId: string = '';

  public toJson() {
    const json: any = {
      messageId: this.messageId,
      name: this.name,
      time: this.time,
      message: this.message,
      threads: this.threads.map(thread => thread.toJson()), // Convert threads to JSON
      image: this.image,
      senderId: this.senderId,
      reactions: this.reactions,
      users: this.users,
    };

    if (this.messageImage !== undefined) {
      json.messageImage = this.messageImage;
    }

    if (this.reactionsByUser !== undefined) {
      json.reactionsByUser = this.reactionsByUser;
    }

    return json;
  }
}

interface ReactionByUser {
  [emoji: string]: boolean;
}

interface ReactionsByUser {
  [userId: string]: ReactionByUser;
}
export class Thread {
  public threadId: string = '';
  public name: string = '';
  public time: number | string = '';
  public messages: Message[] = [];
  public messageImage: string | undefined ='';
  public senderId:string='';
  public toJson() {
    return {
      threadId: this.threadId,
      name: this.name,
      time: this.time,
      messages: this.messages.map(message => message.toJson()),
      messageImage: this.messageImage,
      senderId: this.senderId,
    };
  }
}

