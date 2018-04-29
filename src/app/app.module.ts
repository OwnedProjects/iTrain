import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';
import {Routes, RouterModule} from "@angular/router";
import { RoutesConfig } from "./routes.config"
import { environment } from '../environments/environment'

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './home/dashboard/dashboard.component';
import { BookComponent } from './book/book.component';
import { SubmenuComponent } from './submenu/submenu.component';
import { AllbooksComponent } from './book/allbooks/allbooks.component';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { CreatebookComponent } from './book/createbook/createbook.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { AddpagesComponent } from './book/addpages/addpages.component';
import { OpenbookComponent } from './book/openbook/openbook.component';
import { FavoriteComponent } from './favorite/favorite.component';
import { AllfavoriteComponent } from './favorite/allfavorite/allfavorite.component';

const routes:Routes = RoutesConfig;

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    DashboardComponent,
    BookComponent,
    SubmenuComponent,
    AllbooksComponent,
    HeaderComponent,
    SidebarComponent,
    CreatebookComponent,
    SpinnerComponent,
    AddpagesComponent,
    OpenbookComponent,
    FavoriteComponent,
    AllfavoriteComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    RouterModule.forRoot(routes, {useHash: true})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
