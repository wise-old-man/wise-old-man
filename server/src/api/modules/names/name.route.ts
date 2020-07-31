import { Router } from 'express';
import * as controller from './name.controller';

const api = Router();

api.get('/', controller.index);
api.post('/', controller.submit);
api.post('/:id/refresh', controller.refresh);
api.post('/:id/resolve', controller.resolve);

export default api;
