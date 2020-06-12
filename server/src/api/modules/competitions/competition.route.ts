import { Router } from 'express';
import * as controller from './competition.controller';

const api = Router();

api.get('/:id', controller.viewCompetition);
api.post('/', controller.createCompetition);
api.put('/:id', controller.editCompetition);
api.delete('/:id', controller.deleteCompetition);
api.get('/', controller.listCompetitions);
api.post('/:id/add', controller.addParticipants);
api.post('/:id/remove', controller.removeParticipants);
api.post('/:id/update-all', controller.updateAllParticipants);

export { api };