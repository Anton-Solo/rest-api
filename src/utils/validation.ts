import { validate as uuidValidate } from 'uuid';

export function isValidUUID(id: string): boolean {
  return uuidValidate(id);
}

export function validateCreateUserData(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Request body must be a valid JSON object' };
  }

  if (!data.username || typeof data.username !== 'string') {
    return { valid: false, error: 'Field "username" is required and must be a string' };
  }

  if (data.age === undefined || typeof data.age !== 'number' || !Number.isInteger(data.age)) {
    return { valid: false, error: 'Field "age" is required and must be an integer' };
  }

  if (!Array.isArray(data.hobbies)) {
    return { valid: false, error: 'Field "hobbies" is required and must be an array' };
  }

  if (!data.hobbies.every((hobby: any) => typeof hobby === 'string')) {
    return { valid: false, error: 'All hobbies must be strings' };
  }

  return { valid: true };
}

export function validateUpdateUserData(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Request body must be a valid JSON object' };
  }

  if (data.username !== undefined && typeof data.username !== 'string') {
    return { valid: false, error: 'Field "username" must be a string' };
  }

  if (data.age !== undefined && (typeof data.age !== 'number' || !Number.isInteger(data.age))) {
    return { valid: false, error: 'Field "age" must be an integer' };
  }

  if (data.hobbies !== undefined) {
    if (!Array.isArray(data.hobbies)) {
      return { valid: false, error: 'Field "hobbies" must be an array' };
    }
    if (!data.hobbies.every((hobby: any) => typeof hobby === 'string')) {
      return { valid: false, error: 'All hobbies must be strings' };
    }
  }

  return { valid: true };
}

