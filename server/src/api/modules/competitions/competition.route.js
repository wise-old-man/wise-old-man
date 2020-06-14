const express = require('express');
const controller = require('./competition.controller');

const api = express.Router();

api.get('/', controller.index);
api.post('/', controller.create);
api.get('/:id', controller.details);
api.put('/:id', controller.edit);
api.delete('/:id', controller.remove);
api.post('/:id/add-participants', controller.addParticipants);
api.post('/:id/remove-participants', controller.removeParticipants);
api.post('/:id/update-all', controller.updateAllParticipants);

module.exports = api;
