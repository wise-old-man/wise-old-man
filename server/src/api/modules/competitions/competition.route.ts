import { Router } from 'express';
import * as controller from './competition.controller';

const api = Router();

api.get('/', controller.index);
api.post('/', controller.create);
api.get('/:id', controller.details);
api.put('/:id', controller.edit);
api.delete('/:id', controller.remove);
api.post('/:id/add-participants', controller.addParticipants);
api.post('/:id/remove-participants', controller.removeParticipants);
api.post('/:id/update-all', controller.updateAllParticipants);

export default api;
