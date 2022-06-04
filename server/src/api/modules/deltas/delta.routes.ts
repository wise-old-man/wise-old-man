import { Router } from 'express';
import { setupController } from '../../util/routing';
import * as controller from './delta.controller';

const api = Router();

api.get('/leaderboard', setupController(controller.leaderboard));

export default api;
