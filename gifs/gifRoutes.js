var gifController = require('./gifController.js');


module.exports = function (app) {
  // app === userRouter injected from app.js

  app.post('/gifs', gifController);
  app.get('/gifs', gifController);
};
