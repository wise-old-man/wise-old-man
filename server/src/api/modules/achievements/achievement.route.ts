import { Router } from 'express';
import * as controller from './achievement.controller';

const api = Router();

api.get('/', controller.get);

export default api;