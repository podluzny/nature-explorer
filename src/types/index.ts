export type UserRole = 'admin' | 'teacher' | 'student';

export interface UserProfile {
  id: string;
  role: UserRole;
  displayName: string;
  avatarUrl?: string;
  email: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  objectCount?: number;
}

export interface NatureObjectPhoto {
  id: string;
  objectId: string;
  url: string;
  order: number;
}

export interface NatureObject {
  id: string;
  questId: string;
  title: string;
  category: string;
  shortDescription: string;
  richDescription: string;
  videoUrl?: string;
  externalLinks?: { label: string; url: string }[];
  lat: number;
  lng: number;
  radiusMeters: number;
  photos: NatureObjectPhoto[];
}

export interface Group {
  id: string;
  questId: string;
  teacherId: string;
  name: string;
  inviteCode: string;
  activeUntil?: string;
}

export interface GroupMember {
  groupId: string;
  userId: string;
  user?: UserProfile;
}

export interface Achievement {
  id: string;
  userId: string;
  objectId: string;
  groupId?: string;
  achievedAt: string;
  object?: NatureObject;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  count: number;
  lastAchievedAt?: string;
}
