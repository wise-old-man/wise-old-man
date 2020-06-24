import { Router } from 'express';
import * as controller from './group.controller';

const groupRoutes = Router();

groupRoutes.get('/', controller.index);
groupRoutes.post('/', controller.create);

groupRoutes.get('/:id', controller.details);
groupRoutes.put('/:id', controller.edit);
groupRoutes.delete('/:id', controller.remove);

groupRoutes.put('/:id/change-role', controller.changeRole);
groupRoutes.post('/:id/update-all', controller.updateAll);
groupRoutes.post('/:id/add-members', controller.addMembers);
groupRoutes.post('/:id/remove-members', controller.removeMembers);

groupRoutes.get('/:id/members', controller.listMembers);
groupRoutes.get('/:id/competitions', controller.competitions);
groupRoutes.get('/:id/monthly-top', controller.monthlyTop);
groupRoutes.get('/:id/gained', controller.gained);
groupRoutes.get('/:id/achievements', controller.achievements);
groupRoutes.get('/:id/records', controller.records);
groupRoutes.get('/:id/hiscores', controller.hiscores);
groupRoutes.get('/:id/statistics', controller.statistics);

export { groupRoutes };
