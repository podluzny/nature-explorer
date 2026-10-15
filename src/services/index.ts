import { mockAuthService } from '../mocks/mockAuth';
import { mockDbService } from '../mocks/mockDb';
import { mockStorageService } from '../mocks/mockStorage';
import { mockRealtimeService } from '../mocks/mockRealtime';

import type { IAuthService, IDbService, IStorageService, IRealtimeService } from './interfaces';

const useMocks = process.env.EXPO_PUBLIC_USE_MOCKS !== 'false';

// When USE_MOCKS=false, swap these imports for real Supabase implementations
export const authService: IAuthService = useMocks
  ? mockAuthService
  : mockAuthService; // TODO: replace with supabaseAuthService

export const dbService: IDbService = useMocks
  ? mockDbService
  : mockDbService; // TODO: replace with supabaseDbService

export const storageService: IStorageService = useMocks
  ? mockStorageService
  : mockStorageService; // TODO: replace with supabaseStorageService

export const realtimeService: IRealtimeService = useMocks
  ? mockRealtimeService
  : mockRealtimeService; // TODO: replace with supabaseRealtimeService
