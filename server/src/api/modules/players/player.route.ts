import express from 'express';
import * as controller from './player.controller';

const api = express.Router();

api.get('/', controller.get);
api.get('/search', controller.search);
api.post('/track', controller.track);
api.post('/import', controller.importPlayer);
api.post('/assert-type', controller.assertType);
api.post('/assert-name', controller.assertName);

export default api;