import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-allfavorite',
  templateUrl: './allfavorite.component.html',
  styleUrls: ['./allfavorite.component.css']
})
export class AllfavoriteComponent implements OnInit {
  public authState$: Observable<firebase.User>;
  spinnerActive: boolean = false;
  loggedInUser: any;
  userFavData: any[] = new Array();

  constructor(private router: Router, public afAuth: AngularFireAuth, public db: AngularFirestore) {
    this.authState$ = afAuth.authState;
    let vm = this;
    this.authState$.subscribe( (user: firebase.User) => {
      if (user !== null) {
        this.loggedInUser = user;
        this.getUserBooksFavData();
      }
      else{
        this.router.navigate(['login']);
      }
    });
  }

  getUserBooksFavData(){
    let vm = this;
    vm.spinnerActive = true;
    var docRef = this.db.collection("users").doc(vm.loggedInUser.uid).ref;
    docRef.get().then(function(doc) {
      if(doc.exists){
        if(doc.data().favData.length>0){
          let favData = doc.data().favData;
          for(let i in favData){
            (function(e){
              let bookRef = vm.db.collection("books").doc(favData[e]).ref;
              bookRef.get().then(function(bookDet) {
                if (bookDet.exists) {
                  let tmpObj = {
                    bookDets: bookDet.data(),
                    favorites: []
                  }
                  vm.userFavData.push(tmpObj);
                  vm.getFavoritesData(favData[e], e);
                }

                if( parseInt(e) == favData.length-1){
                  vm.spinnerActive = false;
                }
              });
            })(i);
          }
        }
        else{
          vm.spinnerActive = false;
        }
      }
    })
    .catch(function(error) {
      console.log("Error getting document:", error);
    });

  }

  getFavoritesData(bookNm, index){
    //console.log(bookNm);
    let fav = this.db.collection("favorites").doc(this.loggedInUser.uid).collection(bookNm).valueChanges();
    fav.subscribe(favs => {
      this.userFavData[index].favorites = favs; 
    });
  }

  ngOnInit() {
  }

}
