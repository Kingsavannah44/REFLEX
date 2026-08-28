import db from '../config/database';
import type { User, PublicUser, UserRole } from '../types';

const TABLE = 'users';

function toPublicUser(user: User): PublicUser {
  const { password_hash: _pw, ...rest } = user;
  return rest;
}

export const UserRepository = {
  async findByPhone(phone: string): Promise<User | undefined> {
    return db<User>(TABLE).where({ phone }).first();
  },

  async findById(id: string): Promise<User | undefined> {
    return db<User>(TABLE).where({ id }).first();
  },

  async findPublicById(id: string): Promise<PublicUser | undefined> {
    const user = await db<User>(TABLE).where({ id }).first();
    return user ? toPublicUser(user) : undefined;
  },

  async findActiveByRole(role: UserRole): Promise<PublicUser[]> {
    const users = await db<User>(TABLE).where({ role, is_active: true }).orderBy('name');
    return users.map(toPublicUser);
  },
};
