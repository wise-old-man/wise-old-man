import { Router } from 'express';
import * as controller from './competition.controller';

const api = Router();

api.get('/', controller.index);
api.get('/:id', controller.details);
api.get('/:id/csv', controller.detailsCSV);

api.post('/', controller.create);
api.put('/:id', controller.edit);
api.delete('/:id', controller.remove);

api.put('/:id/reset-code', controller.resetVerificationCode);
api.post('/:id/add-participants', controller.addParticipants);
api.post('/:id/remove-participants', controller.removeParticipants);
api.post('/:id/add-teams', controller.addTeams);
api.post('/:id/remove-teams', controller.removeTeams);
api.post('/:id/update-all', controller.updateAllParticipants);

export default api;
