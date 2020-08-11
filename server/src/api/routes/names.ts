import { Router } from 'express';
import * as controller from 'api/controllers/name.controller';
import * as validations from 'api/validations/names';

const api = Router();

api.get('/', validations.index, controller.index);
api.post('/', validations.submit, controller.submit);
api.get('/:id', validations.details, controller.details);
api.post('/:id/approve', validations.approve, controller.approve);
api.post('/:id/deny', validations.deny, controller.deny);

export default api;
