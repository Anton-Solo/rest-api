import http from 'node:http';
import { handleRequest } from './router.js';

export function createServer(): http.Server {
  return http.createServer(handleRequest);
}

