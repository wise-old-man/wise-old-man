import { Router } from 'express';
import * as controller from '@controllers/names';
import * as validator from '../modules/names/name.validator';

const api = Router();

api.get('/', validator.index, controller.index);
api.post('/', validator.submit, controller.submit);
api.get('/:id', validator.details, controller.details);
api.post('/:id/approve', validator.approve, controller.approve);
api.post('/:id/deny', validator.deny, controller.deny);

export default api;
