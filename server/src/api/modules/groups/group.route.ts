import { Router } from 'express';
import * as controller from './group.controller';

const api = Router();

api.get('/', controller.listGroups);
api.get('/:id', controller.viewGroup);
api.get('/:id/monthly-top', controller.monthlyTop);
api.get('/:id/leaderboard', controller.leaderboard);
api.get('/:id/members', controller.listMembers);
api.post('/', controller.createGroup);
api.put('/:id', controller.editGroup);
api.delete('/:id', controller.deleteGroup);
api.post('/:id/add', controller.addMembers);
api.post('/:id/remove', controller.removeMembers);
api.put('/:id/roles', controller.changeRole);
api.post('/:id/update-all', controller.updateAllMembers);

export { api };