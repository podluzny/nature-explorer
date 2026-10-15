import type {
  UserProfile,
  Quest,
  NatureObject,
  Group,
  GroupMember,
  Achievement,
  LeaderboardEntry,
} from '../types';

// ─── Auth ─────────────────────────────────────────────────────
export interface IAuthService {
  getCurrentUser(): Promise<UserProfile | null>;
  signIn(roleOrCredential: string): Promise<UserProfile>;
  signOut(): Promise<void>;
  onAuthStateChange(callback: (user: UserProfile | null) => void): () => void;
}

// ─── Database ─────────────────────────────────────────────────
export interface IDbService {
  // Quests
  getQuests(): Promise<Quest[]>;
  getQuestById(id: string): Promise<Quest | null>;
  createQuest(quest: Omit<Quest, 'id'>): Promise<Quest>;
  updateQuest(id: string, data: Partial<Quest>): Promise<Quest>;
  deleteQuest(id: string): Promise<void>;

  // Objects
  getObjectsByQuest(questId: string): Promise<NatureObject[]>;
  getObjectById(id: string): Promise<NatureObject | null>;
  createObject(obj: Omit<NatureObject, 'id' | 'photos'>): Promise<NatureObject>;
  updateObject(id: string, data: Partial<NatureObject>): Promise<NatureObject>;
  deleteObject(id: string): Promise<void>;

  // Groups
  getGroupsByTeacher(teacherId: string): Promise<Group[]>;
  getGroupByInviteCode(code: string): Promise<Group | null>;
  createGroup(group: Omit<Group, 'id' | 'inviteCode'>): Promise<Group>;
  deleteGroup(id: string): Promise<void>;

  // Group members
  getGroupMembers(groupId: string): Promise<GroupMember[]>;
  joinGroup(groupId: string, userId: string): Promise<void>;
  leaveGroup(groupId: string, userId: string): Promise<void>;

  // Achievements
  getAchievements(userId: string, questId?: string): Promise<Achievement[]>;
  getGroupAchievements(groupId: string): Promise<Achievement[]>;
  addAchievement(achievement: Omit<Achievement, 'id' | 'achievedAt'>): Promise<Achievement>;
  hasAchievement(userId: string, objectId: string): Promise<boolean>;

  // Leaderboard
  getLeaderboard(groupId: string): Promise<LeaderboardEntry[]>;

  // Users (admin)
  getAllUsers(): Promise<UserProfile[]>;
  updateUserRole(userId: string, role: UserProfile['role']): Promise<void>;
  deleteUser(userId: string): Promise<void>;
}

// ─── Storage ──────────────────────────────────────────────────
export interface IStorageService {
  uploadPhoto(objectId: string, file: File, order: number): Promise<string>;
  deletePhoto(url: string): Promise<void>;
  getPhotoUrl(path: string): string;
}

// ─── Realtime ─────────────────────────────────────────────────
export interface IRealtimeService {
  subscribeToLeaderboard(
    groupId: string,
    callback: (entries: LeaderboardEntry[]) => void
  ): () => void;
}
