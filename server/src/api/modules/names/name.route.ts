import { Router } from 'express';
import * as controller from './name.controller';
import * as validator from './name.validator';

const api = Router();

api.get('/', controller.index);
api.post('/', validator.submit, controller.submit);
api.post('/:id/refresh', validator.refresh, controller.refresh);
api.post('/:id/resolve', controller.resolve);

export default api;
