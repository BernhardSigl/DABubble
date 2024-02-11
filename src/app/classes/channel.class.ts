// export class Channel {
//   name: string;
//   description: string;
//   users: any[] = [];
//   id: number;
//   messages = [];
//   createdBy: string
//   index: number
//   constructor(obj?: any) {
//     this.name = obj?.name || '';
//     this.description = obj?.description || '';
//     this.users = obj?.users || [];
//     this.messages = obj?.messages || [];
//     this.id = obj?.id || '';
//     this.createdBy = obj?.createdBy || '';
//     this.index = obj?.index || ''
//   }

//   toJSON() {
//     const messagesAsJson = this.messages.map((message) => {
//       return message.toJSON();
//     });

//     return {
//       name: this.name,
//       description: this.description,
//       users: this.users,
//       messages: messagesAsJson,
//       id: this.id,
//       createdBy: this.createdBy,
//       index: this.index
//     };
//   }
// }

export class Channel {
    channelName: string;
    channelDescription: string;
    members: any[] = [];
    messages: any[] = [];
    createdBy: string;
    channelIsActive: boolean;

    constructor(obj?: any) {
        this.channelName = obj && obj.channelName ? obj.channelName : '';
        this.channelDescription = obj && obj.channelDescription ? obj.channelDescription : '';
        this.members = obj && obj.members ? obj.members : '';
        this.messages = obj && obj.messages ? obj.messages : '';
        this.createdBy = obj && obj.createdBy ? obj.createdBy : '';
        this.channelIsActive = obj && obj.channelIsActive ? obj.channelIsActive : '';
    }

    toJson() {
        return {
            channelName: this.channelName,
            description: this.channelDescription,
            members: this.members,
            messages: this.messages,
            createdBy: this.createdBy,
            channelIsActive: this.channelIsActive,
        }
    }
}
