/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var guild = require('./guild.model');

exports.register = function(socket) {
  guild.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  guild.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('guild:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('guild:remove', doc);
}