import express from 'express';
import * as controller from './record.controller';

const api = express.Router();

api.get('/', controller.get);
api.get('/leaderboard', controller.leaderboard);

export default api;