import { NextFunction, Request, Response } from 'express';
import * as nameService from '../services/internal/name.service';
import { extractNumber, extractString } from '../util/http';
import * as pagination from '../util/pagination';

// GET /names
async function index(req: Request, res: Response, next: NextFunction) {
  try {
    const status = extractNumber(req.query, { key: 'status' });
    const limit = extractNumber(req.query, { key: 'limit' });
    const offset = extractNumber(req.query, { key: 'offset' });

    const paginationConfig = pagination.getPaginationConfig(limit, offset);
    const results = await nameService.getList(status, paginationConfig);

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

// POST /names/:id/approve
async function approve(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });
    const adminPassword = extractString(req.body, { key: 'adminPassword', required: true });

    const result = await nameService.approve(id, adminPassword);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

// POST /names/:id/deny
async function deny(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id', required: true });
    const adminPassword = extractString(req.body, { key: 'adminPassword', required: true });

    const result = await nameService.deny(id, adminPassword);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export { index, submit, details, approve, deny };
