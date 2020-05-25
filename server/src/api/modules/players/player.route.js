const express = require('express');
const controller = require('./player.controller');

const api = express.Router();

api.get('/', controller.get);
api.get('/search', controller.search);
api.post('/track', controller.track);
api.post('/import', controller.importPlayer);
api.post('/assert-type', controller.assertType);
api.post('/assert-name', controller.assertName);

module.exports = api;
