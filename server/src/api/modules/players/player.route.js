const express = require('express');
const controller = require('./player.controller');

const api = express.Router();

api.get('/search', controller.search);
api.post('/track', controller.track);
api.post('/import', controller.importPlayer);
api.post('/assert-type', controller.assertType);
api.post('/assert-name', controller.assertName);

api.get('/username/:username', controller.details);

api.get('/:id', controller.details);
api.get('/:id/achievements', controller.achievements);
api.get('/:id/competitions', controller.competitions);
api.get('/:id/gained', controller.gained);

module.exports = api;
