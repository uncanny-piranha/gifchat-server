var mongoose = require('mongoose');
var Q        = require('q');

var GifSchema = new mongoose.Schema({

});

module.exports = mongoose.model('gifs', GifSchema);
