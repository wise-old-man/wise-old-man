import * as nameService from './name.service';

// GET /names
async function index(req, res, next) {
  try {
    // ola
  } catch (e) {
    next(e);
  }
}

// POST /names
async function submit(req, res, next) {
  try {
    const { oldName, newName } = req.body;
    const nameChangeRequest = await nameService.submit(oldName, newName);

    res.status(201).json(nameChangeRequest);
  } catch (e) {
    next(e);
  }
}

// POST /names/:id/refresh
async function refresh(req, res, next) {
  try {
    // ola
  } catch (e) {
    next(e);
  }
}

// POST /names/:id/resolve
async function resolve(req, res, next) {
  try {
    // ola
  } catch (e) {
    next(e);
  }
}

export { index, submit, refresh, resolve };
