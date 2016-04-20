/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var deed = require('./deed.model');

exports.register = function(socket) {
  deed.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  deed.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('deed:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('deed:remove', doc);
}