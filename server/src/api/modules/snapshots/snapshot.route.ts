import express from 'express';
import get from './snapshot.controller';

const api = express.Router();

api.get('/', get);

module.exports = api;
