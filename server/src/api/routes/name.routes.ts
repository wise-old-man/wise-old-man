import { Router } from 'express';
import * as controller from '../controllers/name.controller';

const api = Router();

api.get('/', controller.index);
api.post('/', controller.submit);
api.post('/bulk', controller.bulkSubmit);
api.get('/:id', controller.details);
api.post('/:id/approve', controller.approve);
api.post('/:id/deny', controller.deny);

export default api;
