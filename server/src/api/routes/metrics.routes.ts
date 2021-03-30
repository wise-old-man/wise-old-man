import { Router } from 'express';
import * as controller from '../controllers/metrics.controller';

const api = Router();

api.get('/', controller.index);

export default api;
