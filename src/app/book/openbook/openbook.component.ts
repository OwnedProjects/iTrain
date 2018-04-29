import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ParamMap, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

@Component({
  selector: 'app-openbook',
  templateUrl: './openbook.component.html',
  styleUrls: ['./openbook.component.css']
})
export class OpenbookComponent implements OnInit {
  public authState$: Observable<firebase.User>;
  bookDetails: any = null;
  loggedInUser: any;
  spinnerActive: boolean = true;
  showPageCounter: boolean = true;
  noPages: boolean = true;
  bookId: any;
  pageTitle: string = null;
  pageJump: string = null;
  totalPageCount: number = 1;
  currPageNo:number = 1;
  pages: any;
  prevBtn: boolean = true;  //if true then its disabled
  nextBtn: boolean = true;  //if true then its disabled
  isBookmarked: boolean = false;
  isBookmarkAvail: boolean = false;
  isFavorite: boolean = false;
  isNotePresent: boolean = false;
  allFavData: any[];
  userFavData: any[] = new Array();
  allNotesData: any[];
  favoriteSpinner: boolean = false;
  bookmarkedPgNo: number = null;
  bookmarkSpinner: boolean = false;
  disabledKeyPress: boolean = false;
  emptySpaceErr: boolean = false;
  addNoteFlag: boolean = false;
  noteAddedFlag: boolean = false;
  noteText: string = null;
  isNoteAvail: boolean = false;
  jumpErrorFlag: boolean = false;
  allNotesPopUpFlag: boolean = false;

  constructor(public afAuth: AngularFireAuth, private route: ActivatedRoute, private router: Router, public db: AngularFirestore) {
    this.bookId = this.route.snapshot.paramMap.get('bookId');
    let routePageNo = this.route.snapshot.paramMap.get('pageNo');
    if(routePageNo){
      this.currPageNo = parseInt(routePageNo);
    }
    console.log(routePageNo);
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
            vm.getUserDetails();
            vm.getPagesOnInit();
            vm.getBookmarksOnInit();
            vm.getFavoritesOnInit();
            vm.getNotesOnInit();
            vm.spinnerActive = false;
          }
          else{
            //Book is not present, go to All Books
            vm.router.navigate(['book/allbooks']);
          }
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

  getUserDetails(){
    let vm = this;
    var docRef = this.db.collection("users").doc(vm.loggedInUser.uid).ref;
    docRef.get().then(function(doc) {
      if(doc.exists){
        if(doc.data().favData){
          vm.userFavData = doc.data().favData;
        }
      }
    })
    .catch(function(error) {
      console.log("Error getting document:", error);
    });
  }

  goToNextPage(){
    if(this.currPageNo < this.totalPageCount){
      this.currPageNo++;
      if(this.currPageNo === this.totalPageCount){
        this.nextBtn = true;
      }
      this.prevBtn = false;
    }
    this.disabledKeyPress = false;
    this.allNotesPopUpFlag = false;
    this.checkBookmarksForBook();
    this.checkFavoritesForBook();
    this.checkNotesForBook();
    this.closeNotePopUp();
  }

  gotoPrevPage(){
    if(this.currPageNo > 0){
      this.currPageNo--;
      this.nextBtn = false;
      if(this.currPageNo == 1){
        this.prevBtn = true;
      }
    }
    this.disabledKeyPress = false;
    this.allNotesPopUpFlag = false;
    this.checkBookmarksForBook();
    this.checkFavoritesForBook();
    this.checkNotesForBook();
    this.closeNotePopUp();
  }

  favoriteThisPage(){
    if(this.isFavorite == false){
      //Add Favorite
      let vm = this;
      let isFavPresentUser = false;
      for(let i in vm.userFavData){
        if(vm.bookDetails.bookName == vm.userFavData[i]){
          isFavPresentUser = true;
          break;
        }
      }
      if(isFavPresentUser == false){
        vm.userFavData.push(vm.bookDetails.bookName);
        console.log(vm.userFavData)
          vm.db.collection("users").doc(vm.loggedInUser.uid).set({
            favData: vm.userFavData
          }, { merge: true })
          .then(function() {
              console.log("Favorite - Book Name added in User data !");
              vm.spinnerActive = false;
          })
          .catch(function(error) {
              console.error("Error writing document: ", error);
          });
      }
      
      this.favoriteSpinner = true;
      let dt = new Date();
      let favoriteObj = {
        bookName: this.bookDetails.bookName,
        currPageNo: this.currPageNo,
        creationDate: dt.getTime()
      };
      this.db.collection('favorites').doc(this.loggedInUser.uid).collection<any>(this.bookDetails.bookName).doc('fav_'+dt.getTime()).set(favoriteObj)
      .then(function(){
        console.log("Favorite Successfully");
        Observable.interval(1000).take(1).subscribe(() => {
          vm.favoriteSpinner = false;
          vm.isFavorite = true;
        });
      })
      .catch(function(error){
        console.error("Error writing document: ", error);
        Observable.interval(1000).take(1).subscribe(() => {
          vm.favoriteSpinner = false;
          vm.isFavorite = false;
        });
      });
    }else{
      //Remove Favorite
      let creationDate: number = null;
      for(let i in this.allFavData){
        if(this.currPageNo === this.allFavData[i].currPageNo){
          creationDate = this.allFavData[i].creationDate;
          break;
        }
      }

      let vm = this;
      vm.favoriteSpinner = true;
      this.db.collection('favorites').doc(this.loggedInUser.uid).collection<any>(this.bookDetails.bookName).doc('fav_'+creationDate).delete().then(function() {
        console.log("Favorite successfully deleted!");
        vm.favoriteSpinner = false;
        vm.isFavorite = false;
      }).catch(function(error) {
          console.error("Error removing favorite: ", error);
          vm.favoriteSpinner = false;
          vm.isFavorite = true;
      });

      let fav = this.db.collection("favorites").doc(this.loggedInUser.uid).collection(this.bookDetails.bookName).valueChanges();
      fav.subscribe(favs => {
        console.log(favs);
        if(favs.length == 0){
          let isFavPresentUser = false;
          let index:number = -1;
          for(let i in vm.userFavData){
            if(vm.bookDetails.bookName == vm.userFavData[i]){
              isFavPresentUser = true;
              index = parseInt(i);
              break;
            }
          }
          if(isFavPresentUser == true){
            vm.userFavData.splice(index, 1);
              vm.db.collection("users").doc(vm.loggedInUser.uid).set({
                favData: vm.userFavData
              }, { merge: true })
              .then(function() {
                  console.log("Favorite - Book Name removed in User data !");
              })
              .catch(function(error) {
                  console.error("Error writing document: ", error);
              });
          }// isFavPresentUser condn 
        } // favs.length
      });
    } //remove fav else
  }

  bookmarkThisPage(){
    //console.log(this.bookDetails, this.currPageNo, this.loggedInUser);
    if(this.isBookmarked === false){
      //Add Bookmark
      this.bookmarkSpinner = true;
      let dt = new Date();
      let bookmrkObj = {
        bookName: this.bookDetails.bookName,
        currPageNo: this.currPageNo,
        creationDate: dt.getTime()
      };

      let vm = this;
      this.db.collection('bookmarks').doc(this.loggedInUser.uid).collection<any>("AllBooksmarks").doc(this.bookDetails.bookName).set(bookmrkObj)
      .then(function() {
        console.log("Bookmarked successfully!");
        Observable.interval(1000).take(1).subscribe(() => {
          vm.bookmarkSpinner = false;
          vm.isBookmarked = true;
        });
      })
      .catch(function(error) {
        console.error("Error writing document: ", error);
        Observable.interval(1000).take(1).subscribe(() => {
          vm.bookmarkSpinner = false;
          vm.isBookmarked = false;
        });
      });
    }
    else{
      //Remove Bookmark
      let vm = this;
      vm.bookmarkSpinner = true;
      this.db.collection('bookmarks').doc(this.loggedInUser.uid).collection<any>("AllBooksmarks").doc(this.bookDetails.bookName).delete().then(function() {
        console.log("Document successfully deleted!");
        vm.bookmarkSpinner = false;
        vm.isBookmarked = false;
        vm.isBookmarkAvail = false;
      }).catch(function(error) {
          console.error("Error removing document: ", error);
          vm.bookmarkSpinner = false;
          vm.isBookmarked = true;
      });
    }
  }


  ngOnInit() {
  }

  getPagesOnInit(){
    let vm = this;
    let pagesRef = this.db.collection("pages").doc("book_page_"+vm.bookId).collection("AllPages").valueChanges();
    pagesRef.subscribe(pages => {
      //console.log(pages);
      vm.pages = pages;
      vm.totalPageCount = pages.length;
      if(pages.length<=0){
        console.log("Cannot find any pages for the book");
        vm.noPages = true;
      }
      else{
        vm.noPages = false;
        vm.showPageCounter = false;
        if(pages.length>1){
          vm.nextBtn = false;
        }
      }
    });
  }

  getBookmarksOnInit(){
    let vm = this;
    let bookmarkRef = this.db.collection("bookmarks").doc(this.loggedInUser.uid).collection<any>("AllBooksmarks").valueChanges();
    bookmarkRef.subscribe(bookmarks => {
        //console.log("bookmarks",bookmarks);
        if(bookmarks.length<=0){
          console.log("Cannot find any bookmarks for the book");
        }
        else{
          for(let i in bookmarks){
            if(bookmarks[i].bookName === this.bookDetails.bookName){
              vm.isBookmarkAvail = true;
              vm.bookmarkedPgNo = bookmarks[i].currPageNo;
              break;
            }
          }

          if(vm.bookmarkedPgNo == vm.currPageNo){
            vm.bookmarkSpinner = false;
            vm.isBookmarked = true;
          }

        }
        vm.spinnerActive = false;
      });
  }

  getFavoritesOnInit(){
    let vm = this;
    let favRef = this.db.collection("favorites").doc(this.loggedInUser.uid).collection<any>(this.bookDetails.bookName).valueChanges();
    favRef.subscribe(favorites => {
      if(favorites.length<=0){
        console.log("Cannot find any favorites for the book");
      }
      else{
        //Check Favorite on init;
        //console.log(favorites);
        vm.allFavData = favorites; 
        let flag = false;
        for(let i in favorites){
          if(favorites[i].currPageNo === this.currPageNo){
            flag = true;
            break;
          }
        }

        if(flag == true){
          vm.isFavorite = true;
        }
        else{
          vm.isFavorite = false;
        }
      }
    });
  }

  //Fetch / get notes on start
  getNotesOnInit(){
    let vm = this;
    let noteRef = this.db.collection("Notes").doc(this.loggedInUser.uid).collection<any>(this.bookDetails.bookName).valueChanges();
    noteRef.subscribe(notes => {
      if(notes.length<=0){
        console.log("Cannot find any notes for the book");
      }
      else{
        //Check Notes on init;
        console.log(notes);
        vm.allNotesData = notes;
        let indexval:string = null;
        let flag = false;
        for(let i in notes){
          if(notes[i].currPageNo === this.currPageNo){
            indexval = i;
            flag = true;
            break;
          }
        }

        if(flag === true){
          //Note present
          this.isNotePresent = true;
          vm.noteText = notes[indexval].noteText;
        }
        else{
          //Note not present
          this.isNotePresent = false;
          vm.noteText = null;
        }
      }
    });
  }

  //Check bookmarks for current page
  checkBookmarksForBook(){
    if(this.bookmarkedPgNo == this.currPageNo){
      this.bookmarkSpinner = false;
      this.isBookmarked = true;
    }
    else{
      this.bookmarkSpinner = false;
      this.isBookmarked = false;
    }
  }

  //Check favorite for current page
  checkFavoritesForBook(){
        let flag = false;
        for(let i in this.allFavData){
          if(this.allFavData[i].currPageNo === this.currPageNo){
            flag = true;
            break;
          }
        }

        if(flag == true){
          this.isFavorite = true;
        }
        else{
          this.isFavorite = false;
        }
  }

  //Check notes for book or pages
  checkNotesForBook(){
    let indexval:string = null;
    let flag = false;
    for(let i in this.allNotesData){
      if(this.allNotesData[i].currPageNo === this.currPageNo){
        indexval = i;
        flag = true;
        break;
      }
    }

    if(flag === true){
      //Note present
      this.isNotePresent = true;
      this.noteText = this.allNotesData[indexval].noteText;
    }
    else{
      //Note not present
      this.isNotePresent = false;
      this.noteText = null;
    }
  }

  //Add New Note
  addNotePopUp(){
    this.addNoteFlag = !this.addNoteFlag;
    this.emptySpaceErr = false;
  }

  //Close note
  closeNotePopUp(){
    this.addNoteFlag = false;
  }

  //Save note
  saveNote(){
    let textSize = this.noteText.trim();
    if(textSize.length != 0){
      let vm = this;
      let dt = new Date();
      let noteObj = {
        bookName: this.bookDetails.bookName,
        currPageNo: this.currPageNo,
        creationDate: dt.getTime(),
        noteText: this.noteText.trim()
      };
      this.db.collection('Notes').doc(this.loggedInUser.uid).collection<any>(this.bookDetails.bookName).doc('fav_'+this.currPageNo).set(noteObj)
      .then(function(){
        console.log("Note added Successfully");
        vm.noteAddedFlag = true;
        Observable.interval(3000).take(1).subscribe(() => {
          vm.addNoteFlag = false;
          vm.noteAddedFlag = false;
        });
      })
      .catch(function(error){
        console.error("Error writing document: ", error);
      });
    }
    else{
      this.emptySpaceErr = true;
      Observable.interval(2000).take(1).subscribe(() => {
        this.emptySpaceErr = false;
      });
    }
  }

  //Jump To Page
  jumpToPage(){
    //this.pageJump
    if(parseInt(this.pageJump) <= this.totalPageCount){
      this.jumpErrorFlag = false;
      this.currPageNo = parseInt(this.pageJump);
      this.pageJump = null;
      this.checkBookmarksForBook();
      this.checkFavoritesForBook();
      this.checkNotesForBook();
      this.closeNotePopUp();
      if(this.currPageNo == 1){
        this.nextBtn = false;
        this.prevBtn = true;
      }
      else{
        if(this.currPageNo < this.totalPageCount){
          this.nextBtn = false;
          this.prevBtn = false;
        }
        else{
          this.nextBtn = true;
          this.prevBtn = false;
        }
      }
    }
    else{
      this.jumpErrorFlag = true;
      Observable.interval(2000).take(1).subscribe(() => {
        this.jumpErrorFlag = false;
      });
    }
  }

  jumpToBookmark(){
    if(this.bookmarkedPgNo){
      this.currPageNo = this.bookmarkedPgNo;
      if(this.currPageNo === this.totalPageCount){
        this.nextBtn = true;
        this.prevBtn = false;
      }
      else if(this.currPageNo == 1){
        this.prevBtn = true;
        this.nextBtn = false;
      }else{
        this.prevBtn = false;
        this.nextBtn = false;
      }
      this.disabledKeyPress = false;
      this.allNotesPopUpFlag = false;
      this.checkBookmarksForBook();
      this.checkFavoritesForBook();
      this.checkNotesForBook();
      this.closeNotePopUp();
    }
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    //console.log(event);
    let x = event.keyCode;
    if (x === 39) {
      if(this.currPageNo != this.totalPageCount && this.disabledKeyPress == false && this.addNoteFlag == false){
        this.goToNextPage();
        this.disabledKeyPress = true;
        Observable.interval(2000).take(1).subscribe(() => {
          this.disabledKeyPress = false;
        });
      }
    }
    if (x === 37) {
      if(this.currPageNo>1  && this.disabledKeyPress == false && this.addNoteFlag == false){
        this.gotoPrevPage();
        this.disabledKeyPress = true;
        Observable.interval(2000).take(1).subscribe(() => {
          this.disabledKeyPress = false;
        });
      }
    }
  }
}