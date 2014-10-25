var Gif = require('./gifModel.js');
var Q = require('q');
var request = require('request');
var Firebase = require('firebase');

module.exports = {
  retrieveGif: function(req, res, next){
    var fromUser = req.body.from;
    var toUser = req.body.to;
    //converts spaces to + in keyword
    var keyword = req.body.keyword.split(' ').join('+');
    //url for the firebase database
    var firebaseUrl = 'https://sizzling-fire-1984.firebaseio.com';

    //open up firebase connections
    var fromUserRef = new Firebase(firebaseUrl+'/usernames/'+fromUser+'/messages/'+toUser);
    var toUserRef = new Firebase(firebaseUrl+'/usernames/'+toUser+'/messages/'+fromUser);

    //check database for keyword
    var findKey = Q.nbind(Gif.findOne, Gif);
    findKey({keyword: keyword})
      .then(function (gif) {
        //if found, send back random url from array to firebase
        if (gif) {
          if (gif.urls.length > 0) {
            var randIndex = Math.floor(Math.random()*gif.urls.length);
            pushToFirebase(fromUser, gif.urls[randIndex]);
          } else {
            //SENDS BACK SAME GIF EACH TIME NONE IS FOUND. MIGHT WANT TO RANDOMIZE THIS
            pushToFirebase(fromUser, 'http://i.imgur.com/PVSpM9X.gif');
          }
        } else {
        //else, hit giffy api. search for keyword, use public api key, and ask for first 100 results
          request.get({url: 'http://api.giphy.com/v1/gifs/search?q='+keyword+'&api_key=dc6zaTOxFJmzC&limit=100', json: true}, function (err, httpRes, body) {
            if (err) {
              return console.log('Error fetching data from giphy: ' + err);
            }
            //if results sent back, send back random url from results to firebase
            if (body.data.length > 0) {
              var randIndex = Math.floor(Math.random()*body.data.length);
              pushToFirebase(fromUser, body.data[randIndex].images.original.url);
            } else {
              //SENDS BACK SAME GIF EACH TIME NONE IS FOUND. MIGHT WANT TO RANDOMIZE THIS
              pushToFirebase(fromUser, 'http://i.imgur.com/PVSpM9X.gif');
            }
            //Store results in mongo
            var gifArray = [];
            for(var i = 0; i < body.data.length; i++){
              gifArray.push(body.data[i].images.original.url);
            }
            createGif = Q.nbind(Gif.create, Gif);
            newGif = {
              keyword: keyword,
              urls: gifArray
            };
            return createGif(newGif);
          });
        }
      })
      .fail(function (error) {
        next(error);
      });

    //helper function to push the gif url to the message boards for both users
    var pushToFirebase = function (username, text) {
      fromUserRef.push({'username': username, 'text': text});
      toUserRef.push({'username': username, 'text': text});
      res.send(200);
    }
  }
};
