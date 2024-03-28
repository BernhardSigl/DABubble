export class Channel {
    channelName: string;
    channelDescription: string;
    members: any[] = [];
    messages: any[] = [];
    createdBy?: string;
    channelId: string;

    constructor(obj?: any) {
        this.channelName = obj && obj.channelName ? obj.channelName : '';
        this.channelDescription = obj && obj.channelDescription ? obj.channelDescription : '';
        this.members = obj && obj.members ? obj.members : '';
        this.messages = obj && obj.messages ? obj.messages : '';
        this.createdBy = obj && obj.createdBy ? obj.createdBy : '';
        this.channelId = obj && obj.channelId ? obj.channelId : '';
    }

    toJson() {
        return {
            channelName: this.channelName,
            description: this.channelDescription,
            members: this.members,
            messages: this.messages,
            createdBy: this.createdBy,
            channelId: this.channelId,
        }
    }
}
