'use strict';

var User = require('./user.model'),
    passport = require('passport'),
    config = require('../../config/environment'),
    jwt = require('jsonwebtoken');

var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User
    .find({}, '-salt -hashedPassword')
    .populate("_deedIds", "title")
    .populate("_guilds", "name").exec(function (err, users) {
      if(err) return res.send(500, err);
      res.json(200, users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);

  newUser.provider = 'local';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    res.json({ token: token });
  });
};

/*
 * Brief info regarding user [meaning don't fetch private info]
 */
exports.showBrief = function (req, res, next) {
  var userId = req.params.id;

  User
    .findById(userId, {"_deedIds": 1, "_guilds": 1, "name": 1, "email": 1, "achievements": 1, "lvl": 1, "gears": 1, "avatar": 1})
    .populate("_deedIds", "title")
    .populate("_guilds", "name").exec(function (err, user) {
      if (err) return next(err);
      if (!user) return res.send(401);
      res.json(user);
  });
};

exports.findUsers = function(req, res, next) {
  User
    .find({"_id": {"$in": req.params.ids}})
    .populate("_deedIds", "title")
    .populate("_guilds", "name").exec(function (err, users) {
      if (err) return next(err);
      if (!users) return res.send(401);
      res.json(200, users);
  });
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.send(500, err);
    return res.send(204);
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id,
      oldPass = String(req.body.oldPassword),
      newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

/**
 * Updates geolocation given address
 */
exports.updateGeolocation = function(req, res, next) {
  var userId = req.user._id,
      lat = req.address.lat,
      lng = req.params.lng,
      location;

  User.findById(userId, function (err, user) {
    if(err || !user) return res.send(400);
    
    location = user.address.location;

    location.lat = lat;
    location.lng = lng;
    user.save(function(err) {
      if (err) return validationError(res, err);
        res.send(200);
    });
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  
  User
    .findOne({
      _id: userId
    }, '-salt -hashedPassword')
    .populate("_deedIds", "title")
    .populate("_guilds", "name").exec(function(err, user) { // don't ever give out the password or salt
      if (err) return next(err);
      if (!user) return res.json(401);
      res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
