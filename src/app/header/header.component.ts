import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AvatarDataService } from '../firebase-services/avatar-data.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  userName: string = '';
 

  constructor(private avatarDataService: AvatarDataService, ){
    
  }

  ngOnInit() {
    this.avatarDataService.selectedAvatar$.subscribe((newUserName) => {
      this.userName = newUserName;
      console.log(this.userName);
      
    });
     
  }
  
}
