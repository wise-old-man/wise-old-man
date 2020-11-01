import { Router } from 'express';
import * as controller from '../controllers/league.controller';

const api = Router();

api.get('/tiers', controller.tiers);

export default api;
