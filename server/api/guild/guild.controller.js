/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /guilds              ->  index
 * POST    /guilds              ->  create
 * GET     /guilds/:id          ->  show
 * PUT     /guilds/:id          ->  update
 * DELETE  /guilds/:id          ->  destroy
 */

'use strict';

var _ = require('lodash'),
    Guild = require('./guild.model');

// Get list of guilds
exports.index = function(req, res) {
  Guild
    .find({}, {"_masterUserId": 1, "creationTime": 1, "name": 1, "desc": 1, "memberCount": 1})
    .populate("_masterUserId", "name address.location")
    .exec(function (err, guilds) {
      if(err) { return handleError(res, err); }
      return res.json(200, guilds);
  });
};

// Get a single guild
exports.show = function(req, res) {
  Guild
    .findById(req.params.id)
    .populate("_masterUserId", "name address.location")
    .populate("_memberIds", "name address.location").exec(function (err, guild) {
      if(err) { return handleError(res, err); }
      if(!guild) { return res.send(404); }
      return res.json(guild);
  });
};

// Creates a new guild in the DB.
exports.create = function(req, res) {
  Guild.create(req.body, function(err, guild) {
    if(err) { return handleError(res, err); }
    return res.json(201, guild);
  });
};

// Updates an existing guild in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Guild.findById(req.params.id, function (err, guild) {
    if (err) { return handleError(res, err); }
    if(!guild) { return res.send(404); }
    var updated = _.merge(guild, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, guild);
    });
  });
};

// Adds an user to a guild in the DB.
exports.addMember = function(req, res) {

  Guild.findById(req.params.guildId, function (err, guild) {
    if(guild._masterUserId === req.params.id) {
      Guild.update({"_id": req.params.guildId}, 
                {"$addToSet": {"_memberIds": req.params.userId}, "$inc": {"memberCount": 1}});
    }
  });
};

// Removes an user from a guild in the DB.
exports.removeMember = function(req, res) {
  
  Guild.findById(req.params.guildId, function (err, guild) {
    if(guild._masterUserId === req.params.id) {
      Guild.update({"_id": req.params.guildId}, 
                {"$pull": {"_memberIds": req.params.userId}, "$inc": {"memberCount": -1}});
    }
  });
};

// Deletes a guild from the DB.
exports.destroy = function(req, res) {
  Guild.findById(req.params.id, function (err, guild) {
    if(err) { return handleError(res, err); }
    if(!guild) { return res.send(404); }
    guild.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}