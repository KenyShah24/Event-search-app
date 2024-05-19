const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports.getTableDataApi = getTableDataApi;
module.exports.getAutocompleteDataApi = getAutocompleteDataApi;
module.exports.getEventCardDataApi = getEventCardDataApi;
module.exports.getVenueCardDataApi = getVenueCardDataApi;
module.exports.getArtistDataApi = getArtistDataApi;

//API Keys
const APIKEY = 'NBNfDAaxy4AizPCWSW6I659YcWYxg0s8';
const SUGGEST_API_URL = 'https://app.ticketmaster.com/discovery/v2/suggest.json?'
const EVENTS_API_URL = 'https://app.ticketmaster.com/discovery/v2/events.json?'
const EVENT_DETAILS_API_URL = 'https://app.ticketmaster.com/discovery/v2/events/'
const VENUE_DETAILS_URL = 'https://app.ticketmaster.com/discovery/v2/venues?'
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.SECRET_CODE;


//search results
async function getTableDataApi(keyword,radius,segmentId,geoPoint) {
  const params = {
    apikey: APIKEY,
    keyword,
    segmentId,
    radius,
    geoPoint,
    sort: 'date,asc',
  };
  const queryParams = new URLSearchParams(params);
  const response = await fetch(EVENTS_API_URL+queryParams.toString(), {method: 'GET'});
  const resData = await response.json();
  return resData;
}

async function getAutocompleteDataApi(keyword) {
  const params = {
    apikey: APIKEY,
    keyword,
  };
  const queryParams = new URLSearchParams(params);
  const response = await fetch(SUGGEST_API_URL+queryParams.toString(), {method: 'GET'});
  const resData = await response.json();
  return resData;
}

//Event Card Details
async function getEventCardDataApi(id) {
  const params = {
    apikey: APIKEY,
  };
  const queryParams = new URLSearchParams(params);
  const response = await fetch(EVENT_DETAILS_API_URL+id+'?'+queryParams.toString(), {method: 'GET'});
  const resData = await response.json();
  return resData;
}

//Venue Card Details
async function getVenueCardDataApi(name) {
  const params = {
    apikey: APIKEY,
    keyword: name,
  };
  const queryParams = new URLSearchParams(params);
  const response = await fetch(VENUE_DETAILS_URL+queryParams.toString(), {method: 'GET'});
  const resData = await response.json();
  return resData;
}

//get artist details from spotify api
async function getArtistDataApi(artist,res) {
  const BreakError = {};
  var spotifyApi = new SpotifyWebApi({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET
  });

  spotifyApi.clientCredentialsGrant().then(
    function(data) {
      var spotifyApi = new SpotifyWebApi({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET
      });
      spotifyApi.setAccessToken(data.body['access_token']);

      // Set the credentials when making the request
      var spotifyApi = new SpotifyWebApi({
        accessToken: data.body['access_token']
      });

      spotifyApi.searchArtists(artist).then(
          function(data) {
            var matchedArtist={};
          res.header("Access-Control-Allow-Origin","*");
          try {
            data.body.artists.items.forEach((item)=>{
              if(item.name.toLowerCase()===artist.toLowerCase()){
                matchedArtist=item;
                throw BreakError;
              }
            })
          } catch (err) {
            if (err !== BreakError) throw err;
          }
          if(Object.keys(matchedArtist)?.length!==0 && matchedArtist?.id){
            spotifyApi.getArtistAlbums(matchedArtist.id,{ limit: 3})
            .then(function(data) {
              if(data){
                matchedArtist['albums']=data.body;
                res.send(JSON.stringify(matchedArtist));
              }
            }, function(err) {
              matchedArtist['albums']=[];
              res.send(JSON.stringify(matchedArtist));
            });
          }else{
            res.send({msg: 'No results'});
          }
        },
        function(err) {
          console.log('Something went wrong!', err);
        }
      );


    },
    function(err) {
      console.log('Something went wrong!', err);
    }
  );
}


