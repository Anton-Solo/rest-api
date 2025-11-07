import { User } from '../types/user.js';

class InMemoryDatabase {
  private users: Map<string, User> = new Map();

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: string, user: User): Promise<User | undefined> {
    if (!this.users.has(id)) {
      return undefined;
    }
    this.users.set(id, user);
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  clear(): void {
    this.users.clear();
  }
}

export const db = new InMemoryDatabase();

