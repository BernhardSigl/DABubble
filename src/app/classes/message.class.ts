export class Message{
  public name: string = '';
  public time: number | string = '';
  public message: string[] = [];
  public thread: string[] = []
  public image : string = '';
  public messageImage: string | File = '';
  public toJson(){
      return {
          name: this.name,
          time: this.time,
          message: this.message,
          thread: this.thread,
          image : this.image,
          messageImage:this.messageImage
      }
  }
}
