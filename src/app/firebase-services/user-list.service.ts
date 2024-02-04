import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UserListService {

  private userNameSubject = new BehaviorSubject<string>('');
  private userImageSubject = new BehaviorSubject<string>('');

  userName$ = this.userNameSubject.asObservable();
  userImage$ = this.userImageSubject.asObservable();


  constructor(private firestore: Firestore) {}

  async fetchUserData(userId: string): Promise<void> {
    try {
      const usersCollection = collection(this.firestore, 'users');
      const q = query(usersCollection, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(doc => {
        const userData = doc.data();
        const userName = userData['name'];
        const userImage = userData['profileImg'];
        const userId = userData['userId']
        this.userNameSubject.next(userName);
        this.userImageSubject.next(userImage);

      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }
}
