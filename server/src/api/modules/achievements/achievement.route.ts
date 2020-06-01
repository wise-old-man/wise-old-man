import express from 'express';
import * as controller from './achievement.controller';

const api = express.Router();

api.get('/', controller.get);

export default api;