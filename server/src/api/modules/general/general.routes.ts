import { Router } from 'express';
import { setupController } from '../../util/routing';
import * as controller from './general.controller';

const api = Router();

api.post('/api-key', setupController(controller.createApiKey));
api.get('/stats', setupController(controller.stats));

export default api;
