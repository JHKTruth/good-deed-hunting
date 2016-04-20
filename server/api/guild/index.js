'use strict';

var express = require('express'),
    controller = require('./guild.controller'),
    auth = require('../../auth/auth.service'),
    router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', controller.update);
router.put('/:id/addMember/:userId/:guildId', auth.isAuthenticated(), controller.addMember);
router.put('/:id/removeMember/:userId/:guildId', auth.isAuthenticated(), controller.removeMember);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;