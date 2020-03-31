const express = require('express');
const controller = require('./player.controller');

const api = express.Router();

api.get('/', controller.get);
api.get('/search', controller.search);
api.post('/track', controller.track);
api.post('/import', controller.importPlayer);

module.exports = api;
