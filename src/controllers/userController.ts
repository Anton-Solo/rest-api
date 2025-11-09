import { IncomingMessage, ServerResponse } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import { User } from '../types/user.js';
import { isValidUUID, validateCreateUserData, validateUpdateUserData } from '../utils/validation.js';
import { sendJSON, sendError } from '../utils/response.js';
import { parseBody } from '../utils/request.js';

export async function getAllUsers(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const users = await db.getAllUsers();
    sendJSON(res, 200, users);
  } catch (error) {
    sendError(res, 500, 'Internal server error');
  }
}

export async function getUserById(req: IncomingMessage, res: ServerResponse, userId: string): Promise<void> {
  try {
    if (!isValidUUID(userId)) {
      sendError(res, 400, 'Invalid userId (must be a valid UUID)');
      return;
    }

    const user = await db.getUserById(userId);
    
    if (!user) {
      sendError(res, 404, 'User not found');
      return;
    }

    sendJSON(res, 200, user);
  } catch (error) {
    sendError(res, 500, 'Internal server error');
  }
}

export async function createUser(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const body = await parseBody(req);
    
    const validation = validateCreateUserData(body);
    if (!validation.valid) {
      sendError(res, 400, validation.error || 'Invalid request body');
      return;
    }

    const newUser: User = {
      id: uuidv4(),
      username: body.username,
      age: body.age,
      hobbies: body.hobbies,
    };

    await db.createUser(newUser);
    sendJSON(res, 201, newUser);
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid JSON') {
      sendError(res, 400, 'Invalid JSON in request body');
    } else {
      sendError(res, 500, 'Internal server error');
    }
  }
}

export async function updateUser(req: IncomingMessage, res: ServerResponse, userId: string): Promise<void> {
  try {
    if (!isValidUUID(userId)) {
      sendError(res, 400, 'Invalid userId (must be a valid UUID)');
      return;
    }

    const existingUser = await db.getUserById(userId);
    if (!existingUser) {
      sendError(res, 404, 'User not found');
      return;
    }

    const body = await parseBody(req);
    
    const validation = validateUpdateUserData(body);
    if (!validation.valid) {
      sendError(res, 400, validation.error || 'Invalid request body');
      return;
    }

    const updatedUser: User = {
      id: userId,
      username: body.username ?? existingUser.username,
      age: body.age ?? existingUser.age,
      hobbies: body.hobbies ?? existingUser.hobbies,
    };

    await db.updateUser(userId, updatedUser);
    sendJSON(res, 200, updatedUser);
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid JSON') {
      sendError(res, 400, 'Invalid JSON in request body');
    } else {
      sendError(res, 500, 'Internal server error');
    }
  }
}

export async function deleteUser(req: IncomingMessage, res: ServerResponse, userId: string): Promise<void> {
  try {
    if (!isValidUUID(userId)) {
      sendError(res, 400, 'Invalid userId (must be a valid UUID)');
      return;
    }

    const deleted = await db.deleteUser(userId);
    
    if (!deleted) {
      sendError(res, 404, 'User not found');
      return;
    }

    res.statusCode = 204;
    res.end();
  } catch (error) {
    sendError(res, 500, 'Internal server error');
  }
}

