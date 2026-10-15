import type { IDbService } from '../services/interfaces';
import type {
  Quest,
  NatureObject,
  Group,
  GroupMember,
  Achievement,
  LeaderboardEntry,
  UserProfile,
} from '../types';
import {
  MOCK_USERS,
  MOCK_QUESTS,
  MOCK_OBJECTS,
  MOCK_GROUPS,
  MOCK_GROUP_MEMBERS,
  MOCK_ACHIEVEMENTS,
} from './mockData';

// Mutable in-memory copies
const users: UserProfile[] = [...MOCK_USERS];
const quests: Quest[] = [...MOCK_QUESTS];
const objects: NatureObject[] = [...MOCK_OBJECTS];
const groups: Group[] = [...MOCK_GROUPS];
const members: GroupMember[] = [...MOCK_GROUP_MEMBERS];
const achievements: Achievement[] = [...MOCK_ACHIEVEMENTS];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function genInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export const mockDbService: IDbService = {
  // ─── Quests ───────────────────────────────────────────────
  async getQuests() {
    return quests.map((q) => ({
      ...q,
      objectCount: objects.filter((o) => o.questId === q.id).length,
    }));
  },

  async getQuestById(id) {
    return quests.find((q) => q.id === id) ?? null;
  },

  async createQuest(data) {
    const q: Quest = { ...data, id: `quest-${uid()}` };
    quests.push(q);
    return q;
  },

  async updateQuest(id, data) {
    const idx = quests.findIndex((q) => q.id === id);
    if (idx === -1) throw new Error('Quest not found');
    quests[idx] = { ...quests[idx], ...data };
    return quests[idx];
  },

  async deleteQuest(id) {
    const idx = quests.findIndex((q) => q.id === id);
    if (idx !== -1) quests.splice(idx, 1);
  },

  // ─── Objects ──────────────────────────────────────────────
  async getObjectsByQuest(questId) {
    return objects.filter((o) => o.questId === questId);
  },

  async getObjectById(id) {
    return objects.find((o) => o.id === id) ?? null;
  },

  async createObject(data) {
    const obj: NatureObject = { ...data, id: `obj-${uid()}`, photos: [] };
    objects.push(obj);
    return obj;
  },

  async updateObject(id, data) {
    const idx = objects.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error('Object not found');
    objects[idx] = { ...objects[idx], ...data };
    return objects[idx];
  },

  async deleteObject(id) {
    const idx = objects.findIndex((o) => o.id === id);
    if (idx !== -1) objects.splice(idx, 1);
  },

  // ─── Groups ───────────────────────────────────────────────
  async getGroupsByTeacher(teacherId) {
    return groups.filter((g) => g.teacherId === teacherId);
  },

  async getGroupByInviteCode(code) {
    return groups.find((g) => g.inviteCode === code.toUpperCase()) ?? null;
  },

  async createGroup(data) {
    const g: Group = { ...data, id: `group-${uid()}`, inviteCode: genInviteCode() };
    groups.push(g);
    return g;
  },

  async deleteGroup(id) {
    const idx = groups.findIndex((g) => g.id === id);
    if (idx !== -1) groups.splice(idx, 1);
  },

  // ─── Group Members ────────────────────────────────────────
  async getGroupMembers(groupId) {
    return members
      .filter((m) => m.groupId === groupId)
      .map((m) => ({
        ...m,
        user: users.find((u) => u.id === m.userId),
      }));
  },

  async joinGroup(groupId, userId) {
    const exists = members.some((m) => m.groupId === groupId && m.userId === userId);
    if (!exists) members.push({ groupId, userId });
  },

  async leaveGroup(groupId, userId) {
    const idx = members.findIndex((m) => m.groupId === groupId && m.userId === userId);
    if (idx !== -1) members.splice(idx, 1);
  },

  // ─── Achievements ─────────────────────────────────────────
  async getAchievements(userId, questId) {
    let result = achievements.filter((a) => a.userId === userId);
    if (questId) {
      const questObjectIds = objects.filter((o) => o.questId === questId).map((o) => o.id);
      result = result.filter((a) => questObjectIds.includes(a.objectId));
    }
    return result.map((a) => ({
      ...a,
      object: objects.find((o) => o.id === a.objectId),
    }));
  },

  async getGroupAchievements(groupId) {
    return achievements
      .filter((a) => a.groupId === groupId)
      .map((a) => ({
        ...a,
        object: objects.find((o) => o.id === a.objectId),
      }));
  },

  async addAchievement(data) {
    const a: Achievement = {
      ...data,
      id: `ach-${uid()}`,
      achievedAt: new Date().toISOString(),
    };
    achievements.push(a);
    return a;
  },

  async hasAchievement(userId, objectId) {
    return achievements.some((a) => a.userId === userId && a.objectId === objectId);
  },

  // ─── Leaderboard ──────────────────────────────────────────
  async getLeaderboard(groupId) {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return [];

    const questObjectIds = objects.filter((o) => o.questId === group.questId).map((o) => o.id);
    const groupMemberIds = members.filter((m) => m.groupId === groupId).map((m) => m.userId);

    const leaderboard: LeaderboardEntry[] = groupMemberIds.map((userId) => {
      const user = users.find((u) => u.id === userId);
      const userAchs = achievements.filter(
        (a) => a.userId === userId && questObjectIds.includes(a.objectId)
      );
      const lastAch = userAchs.sort(
        (a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime()
      )[0];
      return {
        userId,
        displayName: user?.displayName ?? 'Unknown',
        avatarUrl: user?.avatarUrl,
        count: userAchs.length,
        lastAchievedAt: lastAch?.achievedAt,
      };
    });

    return leaderboard.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      if (a.lastAchievedAt && b.lastAchievedAt) {
        return new Date(a.lastAchievedAt).getTime() - new Date(b.lastAchievedAt).getTime();
      }
      return 0;
    });
  },

  // ─── Users (admin) ────────────────────────────────────────
  async getAllUsers() {
    return [...users];
  },

  async updateUserRole(userId, role) {
    const idx = users.findIndex((u) => u.id === userId);
    if (idx !== -1) users[idx] = { ...users[idx], role };
  },

  async deleteUser(userId) {
    const idx = users.findIndex((u) => u.id === userId);
    if (idx !== -1) users.splice(idx, 1);
  },
};
