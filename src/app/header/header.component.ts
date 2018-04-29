import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  userSpinner: Boolean = true;
  username: string;
  public authState$: Observable<firebase.User>;
  constructor(public afAuth: AngularFireAuth, private router: Router) { 
    this.authState$ = afAuth.authState;
    this.authState$.subscribe( (user: firebase.User) => {
      if (user !== null) {
        //console.log(user);
        this.username = user.displayName.split(" ")[0]; //only first name
        this.userSpinner = false;
      }
      else{
        this.userSpinner = false;
      }
    });
  }

  ngOnInit() {
  }

  logout() {
    this.afAuth.auth.signOut().then( success => {
      window.location.reload();
    });
  }
}