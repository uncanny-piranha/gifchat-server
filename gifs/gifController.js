var Gif = require('./gifModel.js');
var Q = require('q');
var request = require('request');

module.exports = {
  retrieveGif: function(req, res, next){
    var keyword = req.body.keyword;
    //check database for keyword
    var findKey = Q.nbind(Gif.findOne, Gif);
    findKey({keyword: keyword})
      .then(function (gif) {
        //if found, send back random url from array
        if (gif) {
          if (gif.urls.length > 0) {
            var randIndex = Math.floor(Math.random()*gif.urls.length);
            res.json({url: gif.urls[randIndex]});
          } else {
            //SENDS BACK SAME GIF EACH TIME NONE IS FOUND. MIGHT WANT TO RANDOMIZE THIS
            res.json({url: 'http://i.imgur.com/PVSpM9X.gif'});
          }
        } else {
        //else, hit giffy api
          request.get({url: 'http://api.giphy.com/v1/gifs/search?q='+keyword+'&api_key=dc6zaTOxFJmzC&limit=100', json: true}, function (err, httpRes, body) {
            if (err) {
              return console.log('Error fetching data from giphy: ' + err);
            }
            //if results sent back, send back random url from results
            if (body.data.length > 0) {
              var randIndex = Math.floor(Math.random()*body.data.length);
              res.json({url: body.data[randIndex].images.original.url});
            } else {
              //SENDS BACK SAME GIF EACH TIME NONE IS FOUND. MIGHT WANT TO RANDOMIZE THIS
              res.json({url: 'http://i.imgur.com/PVSpM9X.gif'});
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
