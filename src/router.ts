import { IncomingMessage, ServerResponse } from 'http';
import { parseUrl } from './utils/request.js';
import { sendError } from './utils/response.js';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from './controllers/userController.js';

export async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const { pathname, userId } = parseUrl(req.url);
  const method = req.method;

  try {
    if (pathname === '/api/users' && method === 'GET') {
      await getAllUsers(req, res);
      return;
    }

    if (pathname === '/api/users/:id' && method === 'GET' && userId) {
      await getUserById(req, res, userId);
      return;
    }

    if (pathname === '/api/users' && method === 'POST') {
      await createUser(req, res);
      return;
    }

    if (pathname === '/api/users/:id' && method === 'PUT' && userId) {
      await updateUser(req, res, userId);
      return;
    }

    if (pathname === '/api/users/:id' && method === 'DELETE' && userId) {
      await deleteUser(req, res, userId);
      return;
    }

    sendError(res, 404, 'Endpoint not found');
  } catch (error) {
    console.error('Unhandled error:', error);
    sendError(res, 500, 'Internal server error');
  }
}

