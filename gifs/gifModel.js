var mongoose = require('mongoose');

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
