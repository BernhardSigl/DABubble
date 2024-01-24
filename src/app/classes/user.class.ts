export interface AppUser {
  name?: string;
  email?: string;
  userId?: string;
  profileImg?: string;
  password?: string;
}

export class User {
  name?: string;
  email?: string;
  profileImg?: string;
  userId?: string;
  password?: string;

  constructor(obj?: any) {
    this.name = obj && obj.name ? obj.name : '';
    this.email = obj && obj.email ? obj.email : '';
    this.userId = obj && obj.userId ? obj.userId : '';
    this.profileImg = obj && obj.profileImg ? obj.profileImg : '';
    this.password = obj && obj.password ? obj.password : '';
  }

  toJson() {
    return {
      name: this.name,
      email: this.email,
      userId: this.userId,
      profileImg: this.profileImg,
      password: this.password,
    }
  }
}
