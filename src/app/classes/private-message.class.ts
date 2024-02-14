export class PrivateMessage {
    members: any[] = [];
    messages: any[] = [];
    privateMessageId: string;

    constructor(obj?: any) {
        this.members = obj && obj.members ? obj.members : '';
        this.messages = obj && obj.messages ? obj.messages : '';
        this.privateMessageId = obj && obj.privateMessageId ? obj.privateMessageId : '';
    }

    toJson() {
        return {
            members: this.members,
            messages: this.messages,
            privateMessageId: this.privateMessageId,
        }
    }
}
