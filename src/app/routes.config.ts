import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './home/dashboard/dashboard.component';
import { BookComponent } from './book/book.component';
import { AllbooksComponent } from './book/allbooks/allbooks.component';
import { CreatebookComponent } from './book/createbook/createbook.component';
import { AddpagesComponent } from './book/addpages/addpages.component';
import { OpenbookComponent } from './book/openbook/openbook.component';
import { FavoriteComponent } from './favorite/favorite.component';
import { AllfavoriteComponent } from './favorite/allfavorite/allfavorite.component';

export let RoutesConfig: any = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'home',
    component: HomeComponent,
    children: [
      {path: '', redirectTo: 'dashboard', pathMatch: 'full'}, 
      {path: 'dashboard', component: DashboardComponent} 
    ]
  },
  { 
    path: 'book',
    component: BookComponent,
    children: [
      {path: '', redirectTo: 'allbooks', pathMatch: 'full'}, 
      {path: 'allbooks', component: AllbooksComponent},
      {path: 'createbook', component: CreatebookComponent},
      {path: 'addpages/:bookId', component: AddpagesComponent},
      {path: 'openedbook/:bookId', component: OpenbookComponent},
      {path: 'openedbook/:bookId/:pageNo', component: OpenbookComponent}
    ]
  },
  { 
    path: 'favorites',
    component: FavoriteComponent,
    children: [
      {path: '', redirectTo: 'allfavorites', pathMatch: 'full'}, 
      {path: 'allfavorites', component: AllfavoriteComponent } 
    ]
  }
 ];