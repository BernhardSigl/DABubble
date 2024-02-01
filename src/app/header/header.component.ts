import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AvatarDataService } from '../firebase-services/avatar-data.service';
import { Firestore, addDoc, collection, getDocs, query, where} from '@angular/fire/firestore';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth'; 

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AngularFirestoreModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  userName: string = '';
  userEmail: string = '';
  userId: string = '';
  userImage: string = '';

  constructor(private firestore: Firestore,private route: ActivatedRoute) {
   
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params=>{
      this.userId = params['userId'];
      console.log(this.userId)
      if(this.userId){
        this.getUserData(this.userId)
      }else{
        console.error('userId parameter us undefined')
      }
    })
  }

  async getUserData(userId: string) {
    try{
      const usersCollection = collection(this.firestore,'users');
      const q = query(usersCollection, where('userId','==', userId));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(doc=>{
        const userData = doc.data();
        this.userName = userData['name'];
        this.userEmail = userData['email'];
        this.userImage = userData['profileImg'];

        console.log(this.userName, this.userEmail, this.userImage)
      })
      
    }
    catch(err){
      console.error(err)
    }
  }

}
