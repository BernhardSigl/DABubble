export class Message {
  public messageId: string = '';
  public name: string = '';
  public time: number | string = '';
  public message: string[] = [];
  public thread: string[] = [];
  public image: string = '';
  public messageImage: string | File = '';
  public senderId: string = '';
  public reactions: { [key: string]: any } = {};
  public users: { [key: string]: number } = {};

  public toJson() {
    return {
      messageId: this.messageId,
      name: this.name,
      time: this.time,
      message: this.message,
      thread: this.thread,
      image: this.image,
      messageImage: this.messageImage,
      senderId: this.senderId,
      reactions: this.reactions,
      users: this.users
    };
  }
}
