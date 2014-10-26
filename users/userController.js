var User = require('./userModel.js');
var Q    = require('q');
var jwt  = require('jwt-simple');

module.exports = {
  //check database for username. if found, check if password matches. return a token and the username
  login: function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    var findUser = Q.nbind(User.findOne, User);
    findUser({username: username})
      .then(function (user) {
        if (!user) {
          next({status: 404, message: 'Incorrect username'});
        } else {
          return user.comparePasswords(password)
            .then(function (foundUser) {
              if (foundUser) {
                var token = jwt.encode(user, 'secret');
                res.json({token: token, username: username});
              } else {
                return next({status: 401, message: 'Incorrect password'});
              }
            });
        }
      })
      .fail(function (error) {
        next(error);
      });
  },

  //check database for username. if none exists, create a new user with the given password
  signup: function (req, res, next) {
    var username = req.body.username;
    var password  = req.body.password;
    var create, newUser;

    // check to see if user already exists
    var findOne = Q.nbind(User.findOne, User);
    findOne({username: username})
      .then(function(user) {
        if (user) {
          next({status: 409, message: 'User already exists!'});
        } else {
          // make a new user if not one
          create = Q.nbind(User.create, User);
          newUser = {
            username: username,
            password: password
          };
          return create(newUser);
        }
      })
      .then(function (user) {
        // create token to send back for auth
        var token = jwt.encode(user, 'secret');
        res.json({token: token, username: username});
      })
      .fail(function (error) {
        next(error);
      });
  },

  checkAuth: function (req, res, next) {
    // checking to see if the user is authenticated
    // grab the token in the header if any
    // then decode the token, which will end up being the user object
    // check to see if that user exists in the database
    var token = req.headers['x-access-token'];
    if (!token) {
      next({status: 404, message: 'No token'});
    } else {
      var user = jwt.decode(token, 'secret');
      var findUser = Q.nbind(User.findOne, User);
      findUser({username: user.username})
        .then(function (foundUser) {
          if (foundUser) {
            res.send(200);
          } else {
            res.send(401);
          }
        })
        .fail(function (error) {
          next(error);
        });
    }
  }
};
