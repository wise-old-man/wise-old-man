import { NextFunction, Request, Response } from 'express';
import * as playerService from '../players/player.service';
import * as nameService from './name.service';

// GET /names
async function index(req: Request, res: Response, next: NextFunction) {
  try {
    // ola
  } catch (e) {
    next(e);
  }
}

// POST /names
async function submit(req: Request, res: Response, next: NextFunction) {
  try {
    const oldName = playerService.standardize(req.body.oldName);
    const newName = playerService.standardize(req.body.newName);

    const nameChangeRequest = await nameService.submit(oldName, newName);

    res.status(201).json(nameChangeRequest);
  } catch (e) {
    next(e);
  }
}

// POST /names/:id/refresh
async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);

    const nameChangeRequest = await nameService.refresh(id);

    res.json(nameChangeRequest);
  } catch (e) {
    next(e);
  }
}

// POST /names/:id/resolve
async function resolve(req: Request, res: Response, next: NextFunction) {
  try {
    // ola
  } catch (e) {
    next(e);
  }
}

export { index, submit, refresh, resolve };
