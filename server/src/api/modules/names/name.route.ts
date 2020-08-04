import { Router } from 'express';
import * as controller from './name.controller';
import * as validator from './name.validator';

const api = Router();

api.get('/', validator.index, controller.index);
api.post('/', validator.submit, controller.submit);
api.get('/:id', validator.details, controller.details);
api.post('/:id/approve', controller.approve);
api.post('/:id/deny', validator.deny, controller.deny);

export default api;
