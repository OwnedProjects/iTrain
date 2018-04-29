import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public authState$: Observable<firebase.User>;
  private usersCollection: AngularFirestoreCollection<any>;
  userdata: any;
  loggedInUser: any;
  spinnerActive: boolean = true;

  constructor(public afAuth: AngularFireAuth, public db: AngularFirestore) {
    this.authState$ = afAuth.authState;
    this.authState$.subscribe( (user: firebase.User) => {
      if (user !== null) {
        let vm = this;
        vm.loggedInUser = user;
        //console.log(user);

        var docRef = db.collection("users").doc(vm.loggedInUser.uid).ref;

        docRef.get().then(function(doc) {
            if (doc.exists) {
                //console.log("Document data:", doc.data());
                vm.spinnerActive = false;
            } else {
                console.log("No such document!");
                db.collection("users").doc(vm.loggedInUser.uid).set({
                  uid: vm.loggedInUser.uid,
                  displayName: vm.loggedInUser.displayName,
                  email: vm.loggedInUser.email
                })
                .then(function() {
                    console.log("Document successfully written!");
                    vm.spinnerActive = false;
                })
                .catch(function(error) {
                    console.error("Error writing document: ", error);
                });
            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });
      }
      else{
        this.spinnerActive = false;
      }
    } );
  }

  ngOnInit() {
  }

}
