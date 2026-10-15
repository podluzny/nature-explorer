import { useState, useEffect, useCallback } from 'react';
import type { Achievement } from '../types';
import { dbService } from '../services';

export function useAchievements(userId: string | undefined, questId?: string) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const data = await dbService.getAchievements(userId, questId);
      setAchievements(data);
    } finally {
      setIsLoading(false);
    }
  }, [userId, questId]);

  useEffect(() => {
    load();
  }, [load]);

  const markAchievement = useCallback(
    async (objectId: string, groupId?: string) => {
      if (!userId) return;
      const already = await dbService.hasAchievement(userId, objectId);
      if (already) return;
      await dbService.addAchievement({ userId, objectId, groupId });
      await load();
    },
    [userId, load]
  );

  const hasAchievement = useCallback(
    (objectId: string) => achievements.some((a) => a.objectId === objectId),
    [achievements]
  );

  return { achievements, isLoading, markAchievement, hasAchievement, reload: load };
}
