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

    //open up firebase connections
    var fromUserRef = new Firebase('https://sizzling-fire-1984.firebaseio.com/usernames/'+fromUser+'/messages/'+toUser);
    var toUserRef = new Firebase('https://sizzling-fire-1984.firebaseio.com/usernames/'+toUser+'/messages/'+fromUser);

    //check database for keyword
    var findKey = Q.nbind(Gif.findOne, Gif);
    findKey({keyword: keyword})
      .then(function (gif) {
        //if found, send back random url from array to firebase
        if (gif) {
          if (gif.urls.length > 0) {
            var randIndex = Math.floor(Math.random()*gif.urls.length);
            fromUserRef.push({'username': fromUser, 'text': gif.urls[randIndex]});
            toUserRef.push({'username': fromUser, 'text': gif.urls[randIndex]});
            res.send(200);
          } else {
            //SENDS BACK SAME GIF EACH TIME NONE IS FOUND. MIGHT WANT TO RANDOMIZE THIS
            fromUserRef.push({'username': fromUser, 'text': 'http://i.imgur.com/PVSpM9X.gif'});
            toUserRef.push({'username': fromUser, 'text': 'http://i.imgur.com/PVSpM9X.gif'});
            res.send(200);
          }
        } else {
        //else, hit giffy api
          request.get({url: 'http://api.giphy.com/v1/gifs/search?q='+keyword+'&api_key=dc6zaTOxFJmzC&limit=100', json: true}, function (err, httpRes, body) {
            if (err) {
              return console.log('Error fetching data from giphy: ' + err);
            }
            //if results sent back, send back random url from results to firebase
            if (body.data.length > 0) {
              var randIndex = Math.floor(Math.random()*body.data.length);
              fromUserRef.push({'username': fromUser, 'text': body.data[randIndex].images.original.url});
              toUserRef.push({'username': fromUser, 'text': body.data[randIndex].images.original.url});
              res.send(200);
            } else {
              //SENDS BACK SAME GIF EACH TIME NONE IS FOUND. MIGHT WANT TO RANDOMIZE THIS
              fromUserRef.push({'username': fromUser, 'text': 'http://i.imgur.com/PVSpM9X.gif'});
              toUserRef.push({'username': fromUser, 'text': 'http://i.imgur.com/PVSpM9X.gif'});
              res.send(200);
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
  }
};
