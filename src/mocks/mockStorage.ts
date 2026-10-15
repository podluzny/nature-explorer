import type { IStorageService } from '../services/interfaces';

let photoCounter = 100;

export const mockStorageService: IStorageService = {
  async uploadPhoto(objectId: string, _file: File, order: number): Promise<string> {
    // Return a picsum URL as a mock upload
    const seed = `${objectId}-${order}-${photoCounter++}`;
    return `https://picsum.photos/seed/${seed}/800/600`;
  },

  async deletePhoto(_url: string): Promise<void> {
    // No-op in mock mode
  },

  getPhotoUrl(path: string): string {
    // If it's already a full URL (picsum mock), return as-is
    if (path.startsWith('http')) return path;
    return `https://picsum.photos/seed/${path}/800/600`;
  },
};
