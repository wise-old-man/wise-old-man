import { NextFunction, Request, Response } from 'express';
import { ForbiddenError } from '../errors';
import * as nameService from '../services/internal/name.service';
import * as pagination from '../util/pagination';
import * as adminGuard from '../guards/admin.guard';
import { extractNumber, extractString } from '../util/http';

// GET /names
async function index(req: Request, res: Response, next: NextFunction) {
  try {
    const username = extractString(req.query, { key: 'username' });
    const status = extractNumber(req.query, { key: 'status' });
    const limit = extractNumber(req.query, { key: 'limit' });
    const offset = extractNumber(req.query, { key: 'offset' });

    const paginationConfig = pagination.getPaginationConfig(limit, offset);
    const results = await nameService.getList(username, status, paginationConfig);

    res.json(results);
  } catch (e) {
    next(e);
  }
}

// POST /names
async function submit(req: Request, res: Response, next: NextFunction) {
  try {
    const oldName = extractString(req.body, { key: 'oldName', required: true });
    const newName = extractString(req.body, { key: 'newName', required: true });

    const result = await nameService.submit(oldName, newName);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

// POST /names/bulk
async function bulkSubmit(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await nameService.bulkSubmit(req.body);
    res.status(201).json({ message: result });
  } catch (e) {
    next(e);
  }
}

// GET /names/:id
async function details(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });

    const nameChangeDetails = await nameService.getDetails(id);
    res.json(nameChangeDetails);
  } catch (e) {
    next(e);
  }
}

// POST /names/history/bulk
async function bulkHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await nameService.bulkHistory(req.body);
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}

// POST /names/:id/approve
// REQUIRES ADMIN PASSWORD
async function approve(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });
    const adminPassword = extractString(req.body, { key: 'adminPassword', required: true });

    if (!adminGuard.checkAdminPermissions(adminPassword)) {
      throw new ForbiddenError('Incorrect admin password.');
    }

    const result = await nameService.approve(id);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

// POST /names/:id/deny
// REQUIRES ADMIN PASSWORD
async function deny(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });
    const adminPassword = extractString(req.body, { key: 'adminPassword', required: true });

    if (!adminGuard.checkAdminPermissions(adminPassword)) {
      throw new ForbiddenError('Incorrect admin password.');
    }

    const result = await nameService.deny(id);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export { index, submit, bulkSubmit, bulkHistory, details, approve, deny };
