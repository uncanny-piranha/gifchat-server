var Gif = require('./gifModel.js');

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
            //do something(send back random gif?)
          }
        } else {
        //else, hit giffy api
          //if results sent back, send back random url from results, store results in mongo
          //else do something(send back random gif?) and store the (empty) results in mongo
        }
      })
      .fail(function (error) {
        next(error);
      })
  }
};
