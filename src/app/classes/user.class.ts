interface UserData {
  name: string;
  email: string;
  userId: string;
  profileImg: string;
  password: string;
}

export class AppUser {
  name: string;
  email: string;
  userId: string;
  profileImg: string;
  password: string;

  constructor(data?: UserData) {
    this.name = data?.name || '';
    this.email = data?.email || '';
    this.userId = data?.userId || '';
    this.profileImg = data?.profileImg || '';
    this.password = data?.password || '';
  }

  toJson() {
    return {
      name: this.name,
      email: this.email,
      userId: this.userId,
      profileImg: this.profileImg,
      password: this.password,
    };
  }
}
