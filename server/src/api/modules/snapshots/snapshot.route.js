const express = require('express');
const controller = require('./snapshot.controller');

const api = express.Router();

api.get('/', controller.get);

module.exports = api;
