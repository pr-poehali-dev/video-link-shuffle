export interface Video {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  duration: number;
  views: number;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'vk' | 'twitch' | 'other';
  createdAt: Date;
  userId?: string;
}

export interface VideoQueue {
  id: string;
  videos: Video[];
  currentIndex: number;
  watchedVideos: string[];
  completedWatches: string[];
}

export interface UserSession {
  id: string;
  videoUrl?: string;
  queueId?: string;
  createdAt: Date;
  language: string;
}