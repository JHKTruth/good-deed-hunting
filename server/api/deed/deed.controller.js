/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /deeds/page/:lastDeedTime   ->  index
 * POST    /deeds              ->  create
 * GET     /deeds/:id          ->  show
 * PUT     /deeds/:id          ->  update
 * DELETE  /deeds/:id          ->  destroy
 */

'use strict';

var _ = require('lodash'),
    Deed = require('./deed.model');

// Get list of deeds
exports.index = function(req, res) {
  var lastDeedTime = new Date(parseFloat(req.params.lastDeedTime, 10));

  //since skip is a rather performance hit, consider using datetime of the last created deed to fetch
  Deed
    .find({"deedTime": {"$lte": lastDeedTime}})
    .populate("_users", "name")
    .sort({"deedTime": -1})
    .limit(40).exec(function (err, deeds) {
      if(err) { return handleError(res, err); }
      return res.json(200, deeds);
  });
};

// Get a single deed
exports.show = function(req, res) {
  Deed
    .findById(req.params.id)
    .populate("_users", "name").exec(function (err, deed) {
      if(err) { return handleError(res, err); }
      if(!deed) { return res.send(404); }
      return res.json(deed);
  });
};

// Creates a new deed in the DB.
exports.create = function(req, res) {
  Deed.create(req.body, function(err, deed) {
    if(err) { return handleError(res, err); }
    return res.json(201, deed);
  });
};

// Updates an existing deed in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }

  Deed.findById(req.params.id, function (err, deed) {
    if (err) { return handleError(res, err); }
    if(!deed) { return res.send(404); }
    var updated = _.merge(deed, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, deed);
    });
  });
};

// Increment/Decrement a plus in the DB.
exports.updatePlus = function(req, res) {
  console.info("In update pluse ", req.params.id);

  Deed.update({"_id": req.params.id}, {"$inc": {"deedPluses": parseInt(req.params.updatePlus, 10)}});

  return res.json(200);
};

// Deletes a deed from the DB.
exports.destroy = function(req, res) {
  Deed.findById(req.params.id, function (err, deed) {
    if(err) { return handleError(res, err); }
    if(!deed) { return res.send(404); }
    deed.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}