export interface AppUser {
  name?: string;
  email?: string;
  userId?: string;
  profileImg?: string;
  password?: string;
  // status?: boolean;
}

export class User {
  name?: string;
  email?: string;
  profileImg?: string;
  userId?: string;
  password?: string;
  status?: boolean

  constructor(obj?: any) {
    this.name = obj && obj.name ? obj.name : '';
    this.email = obj && obj.email ? obj.email : '';
    this.userId = obj && obj.userId ? obj.userId : '';
    this.profileImg = obj && obj.profileImg ? obj.profileImg : '';
    this.password = obj && obj.password ? obj.password : ''
    this.status = obj.status || false;
  }

  toJson() {
    return {
      name: this.name,
      email: this.email,
      userId: this.userId,
      profileImg: this.profileImg,
      password: this.password,
      status: this.status
    }
  }
}
