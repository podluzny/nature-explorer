import type { IRealtimeService } from '../services/interfaces';
import type { LeaderboardEntry } from '../types';
import { mockDbService } from './mockDb';

export const mockRealtimeService: IRealtimeService = {
  subscribeToLeaderboard(
    groupId: string,
    callback: (entries: LeaderboardEntry[]) => void
  ): () => void {
    let active = true;

    // Initial load
    mockDbService.getLeaderboard(groupId).then(callback);

    // Refresh every 5 seconds to simulate realtime
    const interval = setInterval(async () => {
      if (!active) return;
      const entries = await mockDbService.getLeaderboard(groupId);
      callback(entries);
    }, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  },
};
