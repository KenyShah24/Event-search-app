import { Inject, Component } from '@angular/core';
import { DOCUMENT } from '@angular/common'; 
import { SubmitDetailsService } from '../submit-details.service';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { switchMap, debounceTime, tap, finalize, distinctUntilChanged, filter } from 'rxjs/operators';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent{

  keyword: string = "";
  distance: number;
  category: string = "";
  location: string = "";
  autodetect: boolean;
  LATITUDE: number;
  LONGITUDE: number;
  initialValues;
  showChiRule = false;
  showGenRule = false;
  showHours = false;

  tableResults = {};
  gotResults = false;
  noResults = false;
  row_data:Array<any> = [];
  clickedCard  = false;
  cardResults:any = {};
  venueResults:any = {};

  currentDate = new Date().toJSON().slice(0, 10);

  options = []; 
  filteredOptions;
  formGroup : FormGroup;
  modalForm : FormGroup;
  ResultsFavorites =1;

  constructor(private submitService: SubmitDetailsService, private http: HttpClient, private fb: FormBuilder, @Inject(DOCUMENT) document: Document){
    this.formGroup = this.fb.group({
      keyword: [''],
      distance: 10,
      category: ['default'],
      location: [{value:'',disabled: false}],
      autodetect: [false]
    });

    this.initialValues = this.formGroup.value;

    this.formGroup.get('autodetect').valueChanges
    .subscribe(() => {
      if(this.formGroup.get('autodetect')?.value){
        this.formGroup.controls['location'].setValue('');
        this.formGroup.get('location').disable();
        this.ipInfo();
      }
      else{
        this.formGroup.get('location').enable();
      }
    })

  }

  ngOnInit() {
    this.initForm();
  }

  initForm(){
    this.formGroup.get('keyword').valueChanges
    .pipe(debounceTime(1000))
    .subscribe(response => {
      if(response && response.length){
        this.filterData(response);
      } else{
        this.filteredOptions = [];
      }
      this.getautocompleteSuggestions(response);
    })
  }

  filterData(enteredData){
  }
  
  getautocompleteSuggestions(keyword){
    this.submitService.fetchSearchutil(keyword).subscribe((response:any) => {
      let embData: any[] = [];
      response._embedded?.events?.map((event:any)=>{
        embData.push(event.name); 
      });
      this.options = embData
      this.filteredOptions = embData;
    })
  }

  Ipinfo_data = {};
  ipInfo(){
    this.http
    .get<any>('https://ipinfo.io/json?token=7e97766b9929ba')
    .subscribe((response: any) => {
      this.Ipinfo_data  = response;
    })
  }

  clearSearchForm(){
    this.formGroup.reset(this.initialValues);
    this.gotResults = false;
    this.noArtist = false;
    this.blankArtistCount = 0;
    this.ArtistTeamList = [];
    this.artistContentList = [];
    this.noResults = false;
    if(this.clickedCard){
      document.getElementById('search_results_card').innerHTML = " ";
    }
    this.clickedCard  = false;
    document.getElementById('search_results_table').innerHTML = " ";
    this.showChiRule = false;
    this.showGenRule = false;
    this.showHours = false;
    this.tableResults = {};
    this.cardResults = {};
  }

  async onSubmit() {

    if(!this.formGroup.valid){
      this.gotResults = false;
    }
    else{
    this.keyword = this.formGroup.get('keyword')?.value;
    this.distance = this.formGroup.get('distance')?.value;
    this.category = this.formGroup.get('category')?.value;
    this.autodetect = this.formGroup.get('autodetect')?.value;
    this.location = this.formGroup.get('location')?.value;
    this.noArtist = false;
    this.blankArtistCount = 0;
    this.ArtistTeamList = [];
    this.artistContentList = [];
    this.clickedCard  = false;
    this.showChiRule = false;
    this.showGenRule = false;
    this.showHours = false;
    if(this.clickedCard){
      document.getElementById('search_results_card').innerHTML = " ";
    }
    if(this.formGroup.get('autodetect')?.value){
    let myLoc = this.Ipinfo_data['loc'].split(",",2);
    this.LATITUDE = myLoc[0];
    this.LONGITUDE = myLoc[1];
    }else{
      const GOOGLE_API_KEY = 'AIzaSyAdXOZy0rIALTyVT2j98tRclvKwX1o-sB0';
      let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${this.location}&key=${GOOGLE_API_KEY}`;

      let GeolocationAPIres = await fetch(url, {method: 'GET'});
      let geolocationRes = await GeolocationAPIres.json();
      if(geolocationRes["results"].length == 0){
        this.gotResults = false;
        this.noResults = true;
        return;
      }
      this.LATITUDE = geolocationRes["results"][0]["geometry"]["location"]["lat"];
      this.LONGITUDE = geolocationRes["results"][0]["geometry"]["location"]["lng"];
    }

    this.http
     .get<any>(`https://event-app-8.wl.r.appspot.com/eventsearch?keyword=${this.keyword}&distance=${this.distance}&category=${this.category}&latitude=${this.LATITUDE}&longitude=${this.LONGITUDE}`)
      .subscribe(
        response => {
          this.submitService.setTableData(response);
          if(response['_embedded']){
            this.tableResults = response;
            this.row_data = this.tableResults['_embedded']['events'];
            if(this.tableResults['_embedded']['events'].length==0 || this.tableResults['error']){
              this.gotResults = false;
              this.noResults = true;
            }
            else{
              this.gotResults = true;
              this.noResults = false;
            }
          }else{
              this.gotResults = false;
              this.noResults = true;
          }
        }
      );
    }
}

categories;
coordinates_lat;
coordinates_long;
name = "";
url_first = "";
marker;
showProgressBarSearchingEvents = false 
showProgressBarLoadingDetails = false 
ArtistTeamList:any = []
artistContentList:any = []
center: google.maps.LatLngLiteral;
validGenres = {'subGenre':'','genre':'','segment':'','subType':'','type':''};
favoriteEvents:any = {}
n_status = '';
n_color = 'orange';
noArtist = false;
blankArtistCount = 0;



async getEventDetails(eventData){
  if(!this.gotResults){
    this.clickedCard = false;
  }
  else if(this.gotResults)
  {
  this.gotResults = false;
  this.artistContentList=[];
  await this.http
    .get<any>(`https://event-app-8.wl.r.appspot.com/eventdetails?id=${eventData.id}`)
      .subscribe((response: any) => {
        const eventDetailsResponse = response;
        let artistTeam='';
        let genre='';
        if(eventDetailsResponse._embedded && eventDetailsResponse._embedded?.attractions){
          eventDetailsResponse._embedded?.attractions.map((attraction,index)=>{
            if(attraction.classifications[0].segment.name=='Music'){
              this.ArtistTeamList.push(attraction.name);
            }
            artistTeam += index==0? attraction.name : ' | ' + attraction.name;       
          })
        }
        if(this.ArtistTeamList.length==0){
          this.noArtist=true;
        }
        if(eventDetailsResponse.classifications){
          Object.entries(eventDetailsResponse.classifications[0]).map(([key,value])=>{
            if(Object.keys(this.validGenres).includes(key)){
                this.validGenres[key]=value['name'];
            }
          });
          Object.values(this.validGenres).map((cat,index)=>{
            if(cat.toLowerCase()!=='undefined' && !genre.includes(cat)){
              genre += genre=='' ? cat : ' | ' + cat;
              this.categories?.push(cat);
            }
          });
        }
        let pr=null;
        if(eventDetailsResponse.hasOwnProperty('priceRanges')){
          pr=eventDetailsResponse.priceRanges[0]?.min + ' - '+eventDetailsResponse.priceRanges[0]?.max+' '+eventDetailsResponse.priceRanges[0]?.currency;
        }
        this.cardResults = {
          name: eventDetailsResponse.name,
          date: eventDetailsResponse.dates?.start?.localDate || null,
          artist: artistTeam || null,
          venue: eventDetailsResponse._embedded?.venues[0]?.name || null,
          genres: genre || null,
          priceRange: pr,
          ticketStatus: eventDetailsResponse.dates?.status?.code || null,
          buyTicketAt: eventDetailsResponse.url || null,
          seatmap: eventDetailsResponse.seatmap?.staticUrl || null,
          id: eventDetailsResponse.id,
        }
        this.formatStatus(this.cardResults.ticketStatus);
        this.getSpotifyDetails();
        this.getVenueDetails();
        this.clickedCard = true;     
        });
}
}

changeState(){
  this.clickedCard = false;
  this.gotResults = true;
  this.ArtistTeamList = [];
  this.noArtist = false;
  this.showChiRule = false;
  this.showGenRule = false;
  this.showHours = false;
  this.blankArtistCount = 0;
  this.artistContentList = [];
}

getVenueDetails(){
  this.http
    .get<any>(`https://event-app-8.wl.r.appspot.com/venuedetails?name=${this.cardResults.venue}`)
      .subscribe((response: any) => {
        const venueDetails = response._embedded.venues[0];
        this.venueResults = {
          name: venueDetails.name,
          address: venueDetails.address?.line1 + ', ' + venueDetails.city.name + ', ' + venueDetails.state.name,
          phoneNumber: venueDetails.boxOfficeInfo?.phoneNumberDetail || null,
          openHours: venueDetails.boxOfficeInfo?.openHoursDetail || null,
          generalRule: venueDetails.generalInfo?.generalRule || null,
          childRule: venueDetails.generalInfo?.childRule || null,
        };
        if(venueDetails?.location?.latitude && venueDetails?.location?.longitude){
          this.center = {lat: parseFloat(venueDetails.location.latitude), lng: parseFloat(venueDetails.location.longitude)};
          this.marker = {
            position: {lat: parseFloat(venueDetails.location.latitude), lng: parseFloat(venueDetails.location.longitude)}
          }
        }
      });
}

formatStatus(status) {
  if (status) {
      switch (status) {
          case 'onsale':
              this.n_color = 'green';
              this.n_status = 'On Sale';
              break;
          case 'offsale':
              this.n_color = 'red';
              this.n_status = 'Off Sale';
              break;
          case 'cancelled':
              this.n_color = 'black';
              this.n_status = 'Cancelled';
              break;
          case 'rescheduled':
              this.n_status = 'Rescheduled';
              break;
          case 'postponed':
              this.n_status = 'Postponed';
              break;
          default:
              break;
      }
  }

}

getSpotifyDetails(){
  var searchVenueDetailsBackendUrl = "https://event-app-8.wl.r.appspot.com/artistdetails?";
  if(this.ArtistTeamList.length > 0){
    this.ArtistTeamList.map((artist)=>{
      this.http
        .get<any>(`${searchVenueDetailsBackendUrl}artist=${artist}`)
          .subscribe((response: any) => {
            if(response?.name){
              this.artistContentList.push({
                Name: response.name,
                Followers: response.followers.total,
                Popularity: response.popularity,
                CheckAt: response.external_urls.spotify,
                image: response.images[0].url,
                albums: response.albums.items,
              });
            }
            else{
              this.blankArtistCount++;
            }
          });
    })
  }
}

getOverlayStyle() {
  const transform =  'translateY(100%) translateX(0%)';
  return {
    top: '50%',
    bottom: 'auto',
    left: '50%',
    transform,
    fontSize: '16px',
  };
}

isEventFavorite(){
  if(localStorage.getItem('Favorites')){
  this.favoriteEvents = JSON.parse(localStorage.getItem('Favorites'));
  return Object.keys(this.favoriteEvents).includes(this.cardResults['id']);
  }
  return false;
}

addToFavorite(){
  const eventId = this.cardResults.id;
  if(!this.isEventFavorite()){
    this.favoriteEvents[eventId]={
      date: this.cardResults.date,
      name: this.cardResults.name,
      category: this.cardResults.genres,
      venue: this.cardResults.venue,
      id: eventId,
    };
    alert("Event added to Favorites!");
  }
  else{
    delete this.favoriteEvents[eventId];
    alert("Removed from Favorites!");
  }
  localStorage.setItem('Favorites', JSON.stringify(this.favoriteEvents))    
}

}
