var mongoose = require('mongoose');
var Q        = require('q');

var GifSchema = new mongoose.Schema({
  keyword: {
    type: String,
    required: true,
    unique: true
  },
  urls: {
    type: [String],
    required: true
  }
});

module.exports = mongoose.model('gifs', GifSchema);
