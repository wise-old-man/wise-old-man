const express = require('express');
const controller = require('./delta.controller');

const api = express.Router();

api.get('/leaderboard', controller.leaderboard);

module.exports = api;
