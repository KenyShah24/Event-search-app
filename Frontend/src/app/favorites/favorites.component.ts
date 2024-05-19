import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {
  noFavorites = true;
  favoritesExists = false;
  favoriteEventsData = [];
  favoriteEventsObj = {};
  
  constructor() {
    if(localStorage !== null)
      this.getFavoritesData();
    }

  ngOnInit() {

    if(localStorage==null || this.favoriteEventsData==null || this.favoriteEventsData.length==0){
      this.noFavorites = true;
      this.favoritesExists = false;
    
    }
    else{
      this.noFavorites=false;
      this.favoritesExists=true;
    }
  
  }

  getFavoritesData(){
    if(localStorage.getItem('Favorites')){
      this.favoriteEventsObj = JSON.parse(localStorage.getItem('Favorites'));
      this.favoriteEventsData = Object.values(this.favoriteEventsObj);
    }
  }

  removeEvent(id) {
    delete this.favoriteEventsObj[id];
    this.favoriteEventsData = Object.values(this.favoriteEventsObj);
    localStorage.setItem('Favorites', JSON.stringify(this.favoriteEventsObj));
    this.getFavoritesData();

    if(this.favoriteEventsData.length==0){
      this.noFavorites = true;
      this.favoritesExists = false;
      
    }
    else{
      this.noFavorites=false;
      this.favoritesExists=true;
    } 
    alert("Removed from Favorites!");   
  } 
}
