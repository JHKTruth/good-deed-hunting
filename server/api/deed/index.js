'use strict';

var express = require('express'),
    controller = require('./deed.controller'),
    auth = require('../../auth/auth.service'),
    router = express.Router();

router.get('/page/:lastDeedTime', controller.index);
router.get('/:id', controller.show);
router.post('/', auth.hasRole('admin'), controller.create);
router.put('/:id', auth.hasRole('admin'), controller.update);
router.put('/:id/updatePlus/:updatePlus', auth.isAuthenticated(), controller.updatePlus);
router.patch('/:id', auth.hasRole('admin'), controller.update);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;