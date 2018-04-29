import { Component, OnInit } from '@angular/core';
import { Router, ParamMap, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-addpages',
  templateUrl: './addpages.component.html',
  styleUrls: ['./addpages.component.css']
})
export class AddpagesComponent implements OnInit {
  public authState$: Observable<firebase.User>;
  bookId: any;
  loggedInUser: any;
  spinnerActive: boolean = true;
  bookDetails: any = null;
  livePreview: boolean = false;
  desc: string;
  pageTitle: string;
  successFlag: boolean = false;
  errorFlag: boolean = false;
  showDescription: boolean = false;

  constructor(public afAuth: AngularFireAuth, private route: ActivatedRoute, private router: Router, public db: AngularFirestore) {
    this.bookId = this.route.snapshot.paramMap.get('bookId');
    console.log(this.bookId);
    this.authState$ = afAuth.authState;
    let vm = this;
    this.authState$.subscribe( (user: firebase.User) => {
      if (user !== null) {
        this.loggedInUser = user;
        let bookRef = db.collection("books").doc("book_"+this.bookId).ref;
        bookRef.get().then(function(doc) {
          if (doc.exists) {
            vm.bookDetails = doc.data();
          }
          else{
            //Book is not present, go to All Books
            vm.router.navigate(['book/allbooks']);
          }
          vm.spinnerActive = false;
        }).catch(function(error) {
          console.log("Error getting document:", error);
          vm.spinnerActive = false;
        });
      }
      else{
        this.router.navigate(['login']);
      }
    });
  }

  ngOnInit() {
  }

  showLivePreview(){
    this.livePreview = true;
  }

  hideLivePreview(){
    this.livePreview = false;
  }

  createPage(){
    console.log("Create Page");
    this.spinnerActive = true;
    let dt = new Date();
    let vm = this;
    let description = this.desc.replace(/(\r\n|\n|\r)/gm, "<br>");
    let tmpObj;
    if(vm.pageTitle){
      tmpObj = {
        author: vm.loggedInUser.uid,
        title: vm.pageTitle,
        desc: description,
        creationDate: dt.getTime()
      }
    }
    else{
      tmpObj = {
        author: vm.loggedInUser.uid,
        desc: description,
        creationDate: dt.getTime()
      }
    }
    
    this.db.collection('pages').doc("book_page_"+ this.bookId).collection<any>("AllPages").doc("page_"+ dt.getTime()).set(tmpObj)
    .then(function() {
        console.log("Pages Created successfully!");
        vm.pageTitle = null;
        vm.desc = null;
        vm.successFlag = true;
        vm.errorFlag = false;
        vm.spinnerActive = false;
        Observable.interval(1000).take(1).subscribe(() => {
          vm.successFlag = false;
          vm.errorFlag = false;
        });
    })
    .catch(function(error) {
        console.error("Error writing document: ", error);
        vm.successFlag = false;
        vm.errorFlag = true;
        vm.spinnerActive = false;
        Observable.interval(1000).take(1).subscribe(() => {
          vm.successFlag = false;
          vm.errorFlag = false;
        });
    });
  }
}