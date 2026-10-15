import type { IAuthService } from '../services/interfaces';
import type { UserProfile } from '../types';
import { MOCK_USERS } from './mockData';

let currentUser: UserProfile | null = null;
const listeners: Set<(user: UserProfile | null) => void> = new Set();

function notify() {
  listeners.forEach((cb) => cb(currentUser));
}

export const mockAuthService: IAuthService = {
  async getCurrentUser() {
    return currentUser;
  },

  async signIn(roleOrId: string) {
    // roleOrId can be a role name ('admin','teacher','student') or user id
    const user =
      MOCK_USERS.find((u) => u.id === roleOrId) ||
      MOCK_USERS.find((u) => u.role === roleOrId) ||
      MOCK_USERS[3]; // fallback to first student
    currentUser = user ?? null;
    notify();
    if (!currentUser) throw new Error('User not found');
    return currentUser;
  },

  async signOut() {
    currentUser = null;
    notify();
  },

  onAuthStateChange(callback) {
    listeners.add(callback);
    // Immediately call with current state
    callback(currentUser);
    return () => {
      listeners.delete(callback);
    };
  },
};
