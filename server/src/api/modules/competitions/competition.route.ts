import { Router } from 'express';
import * as controller from './competition.controller';

const competitionRoutes = Router();

competitionRoutes.get('/', controller.index);
competitionRoutes.post('/', controller.create);
competitionRoutes.get('/:id', controller.details);
competitionRoutes.put('/:id', controller.edit);
competitionRoutes.delete('/:id', controller.remove);
competitionRoutes.post('/:id/add-participants', controller.addParticipants);
competitionRoutes.post('/:id/remove-participants', controller.removeParticipants);
competitionRoutes.post('/:id/update-all', controller.updateAllParticipants);

export { competitionRoutes };
