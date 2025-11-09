import cluster from 'node:cluster';
import { User } from '../types/user.js';

class SharedDatabase {
  private users: Map<string, User> = new Map();

  constructor() {
    if (cluster.isPrimary) {
      this.setupPrimaryHandlers();
    }
  }

  private setupPrimaryHandlers(): void {
    cluster.on('message', (worker, message: any) => {
      if (!message.type || !message.id) return;

      let result: any;
      let error: string | undefined;

      try {
        switch (message.type) {
          case 'db:getAll':
            result = Array.from(this.users.values());
            break;

          case 'db:getById':
            result = this.users.get(message.userId);
            break;

          case 'db:create':
            this.users.set(message.user.id, message.user);
            result = message.user;
            break;

          case 'db:update':
            if (this.users.has(message.userId)) {
              this.users.set(message.userId, message.user);
              result = message.user;
            } else {
              result = undefined;
            }
            break;

          case 'db:delete':
            result = this.users.delete(message.userId);
            break;

          case 'db:clear':
            this.users.clear();
            result = true;
            break;

          default:
            error = 'Unknown operation';
        }
      } catch (err) {
        error = err instanceof Error ? err.message : 'Unknown error';
      }

      worker.send({
        type: 'db:response',
        id: message.id,
        result,
        error,
      });
    });
  }

  private sendMessage(type: string, data: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!process.send) {
        reject(new Error('Not a worker process'));
        return;
      }

      const id = `${Date.now()}-${Math.random()}`;
      
      const timeout = setTimeout(() => {
        reject(new Error('Database operation timeout'));
      }, 5000);

      const handler = (message: any) => {
        if (message.type === 'db:response' && message.id === id) {
          clearTimeout(timeout);
          process.off('message', handler);
          
          if (message.error) {
            reject(new Error(message.error));
          } else {
            resolve(message.result);
          }
        }
      };

      process.on('message', handler);
      process.send({ type, id, ...data });
    });
  }

  async getAllUsers(): Promise<User[]> {
    if (cluster.isPrimary) {
      return Array.from(this.users.values());
    }
    return this.sendMessage('db:getAll');
  }

  async getUserById(id: string): Promise<User | undefined> {
    if (cluster.isPrimary) {
      return this.users.get(id);
    }
    return this.sendMessage('db:getById', { userId: id });
  }

  async createUser(user: User): Promise<User> {
    if (cluster.isPrimary) {
      this.users.set(user.id, user);
      return user;
    }
    return this.sendMessage('db:create', { user });
  }

  async updateUser(id: string, user: User): Promise<User | undefined> {
    if (cluster.isPrimary) {
      if (!this.users.has(id)) {
        return undefined;
      }
      this.users.set(id, user);
      return user;
    }
    return this.sendMessage('db:update', { userId: id, user });
  }

  async deleteUser(id: string): Promise<boolean> {
    if (cluster.isPrimary) {
      return this.users.delete(id);
    }
    return this.sendMessage('db:delete', { userId: id });
  }

  clear(): void {
    if (cluster.isPrimary) {
      this.users.clear();
    } else {
      this.sendMessage('db:clear').catch(() => {});
    }
  }
}

export const sharedDb = new SharedDatabase();

