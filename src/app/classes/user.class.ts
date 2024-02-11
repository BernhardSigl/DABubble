export interface AppUser {
  name?: string;
  email?: string;
  userId?: string;
  profileImg?: string;
  password?: string;
  // status?: boolean;
  // statusChangeable?: boolean;
}

export class User {
  name?: string;
  email?: string;
  profileImg?: string;
  userId?: string;
  password?: string;
  status?: boolean
  statusChangeable?: boolean;
  activeChannel?: string;

  constructor(obj?: any) {
    this.name = obj && obj.name ? obj.name : '';
    this.email = obj && obj.email ? obj.email : '';
    this.userId = obj && obj.userId ? obj.userId : '';
    this.profileImg = obj && obj.profileImg ? obj.profileImg : '';
    this.password = obj && obj.password ? obj.password : ''
    this.status = obj && obj.status ? obj.status : false;
    this.statusChangeable = obj && obj.statusChangeable ? obj.statusChangeable : false;
    this.activeChannel = obj && obj.activeChannel ? obj.activeChannel : ''
  }

  toJson() {
    return {
      name: this.name,
      email: this.email,
      userId: this.userId,
      profileImg: this.profileImg,
      password: this.password,
      status: this.status,
      statusChangeable: this.statusChangeable,
      activeChannel: this.activeChannel,
    }
  }
}
