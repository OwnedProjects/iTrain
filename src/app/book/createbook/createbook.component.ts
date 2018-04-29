import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-createbook',
  templateUrl: './createbook.component.html',
  styleUrls: ['./createbook.component.css']
})
export class CreatebookComponent implements OnInit {
  public authState$: Observable<firebase.User>;
  spinnerActive: boolean = true;
  bookSuccess: boolean = false;
  loggedInUser: any;
  author: string;
  title: string;
  desc: string;

  constructor(public afAuth: AngularFireAuth, private router: Router, public db: AngularFirestore) { 
    this.authState$ = afAuth.authState;
    this.authState$.subscribe( (user: firebase.User) => {
      if (user !== null) {
        this.loggedInUser = user;
        this.author = user.displayName;
      }
      else{
        this.router.navigate(['login']);
      }
      this.spinnerActive = false;
    });
  }

  ngOnInit() {
    
  }

  createBook(){
    console.log("createBook click");
    this.spinnerActive = true;
    let dt = new Date();
    let vm = this;
    let description = this.desc.replace(/(\r\n|\n|\r)/gm, "<br>");
    this.db.collection("books").doc("book_"+ dt.getTime()).set({
      author: vm.loggedInUser.uid,
      authorName: vm.loggedInUser.displayName,
      title: vm.title,
      desc: description,
      bookName: 'book_'+ dt.getTime(),
      creationDate: dt.getTime()
    })
    .then(function() {
        console.log("Book Created successfully!");
        vm.spinnerActive = false;
        vm.bookSuccess = true;
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
    });
  }
}
