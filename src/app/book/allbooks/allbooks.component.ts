import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-allbooks',
  templateUrl: './allbooks.component.html',
  styleUrls: ['./allbooks.component.css']
})
export class AllbooksComponent implements OnInit {
  public authState$: Observable<firebase.User>;
  spinnerActive: boolean = true;
  loggedInUser: any;
  books: Observable<any[]>;

  constructor(public afAuth: AngularFireAuth, private router: Router, public db: AngularFirestore) {
    this.authState$ = afAuth.authState;
    this.authState$.subscribe( (user: firebase.User) => {
      if (user !== null) {
        this.loggedInUser = user;
      }
      else{
        this.router.navigate(['login']);
      }
    });
  }

  ngOnInit() {
    this.books = this.db.collection("books").valueChanges();
    this.books.subscribe(favs => {
      this.spinnerActive = false;
    });
  }

  openBook(bookDets){
    //console.log("Open Book");
    this.router.navigate(['book/openedbook/'+ bookDets]);
  }

  editBook(event, bookDets){
    //console.log("Edit Book", bookDets);
    this.router.navigate(['book/addpages/'+ bookDets]);
    event.stopPropagation();
  }
}
