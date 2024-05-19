const express = require('express');
const cors = require('cors');
const querystring = require('querystring');
const path = require('path');
const randomstring = require('randomstring');
const axios = require('axios');
const app = express();
const outerAPI = require('./outerAPI');
const geohash = require('ngeohash');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));


const PORT = process.env.PORT || 8080;

function ignoreFavicon(req, res, next) {
    if (req.originalUrl.includes('favicon.ico')) {
        res.status(204).end()
    }
    next();
}

app.use(ignoreFavicon);
app.use(cors());

app.get('/',function (req, res) {
    res.redirect('/search')
});

app.get('/autocomplete', async function(req,res){
    let keyword = String(req.query.keyword);
    let autoRes = await outerAPI.getAutocompleteDataApi(keyword);
    return res.send(autoRes);
});

app.get('/eventsearch', async function(req,res){
    let keyword = String(req.query.keyword);
    let radius = parseFloat(req.query.distance);
    let segmentId;
    if(String(req.query.category) == 'default'){
        segmentId=''
    }
    else{
        segmentId=String(req.query.category)
    }
    let latitude = String(req.query.latitude);
    let longitude = String(req.query.longitude);
    const geoPoint = geohash.encode(latitude,longitude);
    let origRes = await outerAPI.getTableDataApi(keyword,radius,segmentId,geoPoint);
    return res.send(origRes);
})

app.get('/formdetails_Coord', async function(req,res){
    let keyword = String(req.query.keyword);
    let distance = parseFloat(req.query.distance);
    distance = parseInt(distance*1609.34);
    let category = String(req.query.category);
    let latitude = parseFloat(req.query.latitude);
    let longitude = parseFloat(req.query.longitude);
    let origRes = await outerAPI.getTableDataApi(keyword,distance,category,latitude,longitude);
    return res.send(origRes);
})

app.get('/eventdetails', async function(req,res){
    let id = String(req.query.id);
    let cardRes = await outerAPI.getEventCardDataApi(id);
    return res.send(cardRes);
})

app.get('/venuedetails', async function(req,res){
    let name = String(req.query.name);
    let cardRes = await outerAPI.getVenueCardDataApi(name);
    return res.send(cardRes);
})

app.get('/artistdetails', async function(req,res){
    let artist = String(req.query.artist);
    await outerAPI.getArtistDataApi(artist,res);
})

app.use(express.static(path.join(__dirname, 'Public')));
app.use('/search',express.static(path.join(__dirname, 'Public')));
app.use('/favorites',express.static(path.join(__dirname, 'Public')));

app.listen(PORT, function (){
    console.log("Server running on localhost:" + PORT);
})
