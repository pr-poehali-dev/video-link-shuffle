import { Video, VideoQueue, UserSession } from '@/types/video';

// Симуляция базы данных в localStorage
class VideoService {
  private storageKey = 'podlet_videos';
  private queueKey = 'podlet_queue';
  private sessionKey = 'podlet_session';

  // Получить все видео
  getVideos(): Video[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : this.getDefaultVideos();
  }

  // Добавить новое видео
  addVideo(url: string, title: string = ''): Video {
    const videos = this.getVideos();
    const video: Video = {
      id: Date.now().toString(),
      url,
      title: title || this.extractTitleFromUrl(url),
      thumbnail: this.generateThumbnail(url),
      duration: 60, // Примерная длительность
      views: 0,
      platform: this.detectPlatform(url),
      createdAt: new Date(),
    };
    
    videos.push(video);
    localStorage.setItem(this.storageKey, JSON.stringify(videos));
    return video;
  }

  // Получить видео для просмотра (исключая те, что уже посмотрел пользователь)
  getVideosForViewing(excludeIds: string[] = []): Video[] {
    const videos = this.getVideos();
    return videos
      .filter(video => !excludeIds.includes(video.id) && video.views < 100)
      .sort(() => Math.random() - 0.5) // Случайное перемешивание
      .slice(0, 3);
  }

  // Увеличить счетчик просмотров
  incrementView(videoId: string): void {
    const videos = this.getVideos();
    const video = videos.find(v => v.id === videoId);
    if (video) {
      video.views++;
      // Удалить видео если достигло 100 просмотров
      if (video.views >= 100) {
        const filteredVideos = videos.filter(v => v.id !== videoId);
        localStorage.setItem(this.storageKey, JSON.stringify(filteredVideos));
      } else {
        localStorage.setItem(this.storageKey, JSON.stringify(videos));
      }
    }
  }

  // Создать очередь видео для пользователя
  createVideoQueue(userId: string): VideoQueue {
    const videos = this.getVideosForViewing();
    const queue: VideoQueue = {
      id: Date.now().toString(),
      videos,
      currentIndex: 0,
      watchedVideos: [],
      completedWatches: []
    };
    
    localStorage.setItem(`${this.queueKey}_${userId}`, JSON.stringify(queue));
    return queue;
  }

  // Получить очередь видео пользователя
  getUserQueue(userId: string): VideoQueue | null {
    const stored = localStorage.getItem(`${this.queueKey}_${userId}`);
    return stored ? JSON.parse(stored) : null;
  }

  // Обновить очередь пользователя
  updateUserQueue(userId: string, queue: VideoQueue): void {
    localStorage.setItem(`${this.queueKey}_${userId}`, JSON.stringify(queue));
  }

  // Создать или получить сессию пользователя
  getOrCreateSession(): UserSession {
    let session = localStorage.getItem(this.sessionKey);
    if (session) {
      return JSON.parse(session);
    }
    
    const newSession: UserSession = {
      id: Date.now().toString(),
      createdAt: new Date(),
      language: 'ru'
    };
    
    localStorage.setItem(this.sessionKey, JSON.stringify(newSession));
    return newSession;
  }

  // Обновить сессию
  updateSession(session: UserSession): void {
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
  }

  // Получить видео для плеера с обходом геоблокировок
  getVideoPlayerUrl(url: string): string {
    const platform = this.detectPlatform(url);
    
    // ВАЖНО: Открываем оригинальные ссылки для засчитывания просмотров в соцсетях
    // Просто возвращаем оригинальную ссылку, чтобы пользователь попал на платформу
    return url;
    
    // Старый код с прокси оставляем как комментарий:
    /*
    switch (platform) {
      case 'youtube':
        return this.getYouTubeProxyUrl(url);
      case 'tiktok':
        return this.getTikTokEmbedUrl(url);
      case 'instagram':
        // Instagram через embed API
        return this.getInstagramEmbedUrl(url);
      case 'vk':
        // VK через embed
        return this.getVKEmbedUrl(url);
      default:
        return url;
    }
    */
  }

  private detectPlatform(url: string): Video['platform'] {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('tiktok.com')) return 'tiktok';
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('vk.com') || url.includes('vkvideo.ru')) return 'vk';
    if (url.includes('twitch.tv')) return 'twitch';
    return 'other';
  }

  private extractTitleFromUrl(url: string): string {
    const platform = this.detectPlatform(url);
    switch (platform) {
      case 'youtube':
        return 'YouTube видео';
      case 'tiktok':
        return 'TikTok ролик';
      case 'instagram':
        return 'Instagram Stories/Reels';
      case 'vk':
        return 'VK Клип';
      case 'twitch':
        return 'Twitch клип';
      default:
        return 'Короткое видео';
    }
  }

  private generateThumbnail(url: string): string {
    // Генерируем placeholder изображения на основе URL
    const platform = this.detectPlatform(url);
    const placeholders = {
      youtube: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=200&fit=crop',
      tiktok: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=300&h=200&fit=crop',
      instagram: 'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=300&h=200&fit=crop',
      vk: 'https://images.unsplash.com/photo-1611162619853-f9b99a65b845?w=300&h=200&fit=crop',
      twitch: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop',
      other: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=300&h=200&fit=crop'
    };
    return placeholders[platform];
  }

  private getYouTubeProxyUrl(url: string): string {
    // Извлекаем video ID из YouTube URL
    const videoId = this.extractYouTubeId(url);
    if (!videoId) return url;
    
    // Используем Invidious или другой прокси
    return `https://invidious.io.lol/embed/${videoId}`;
  }

  private getTikTokEmbedUrl(url: string): string {
    // TikTok embed URL для обхода геоблокировок
    const videoId = url.split('/').pop()?.split('?')[0];
    return `https://www.tiktok.com/embed/v2/${videoId}`;
  }

  private getInstagramEmbedUrl(url: string): string {
    // Instagram embed через официальный API
    return `https://www.instagram.com/p/${this.extractInstagramId(url)}/embed/`;
  }

  private getVKEmbedUrl(url: string): string {
    // VK embed для обхода ограничений
    return url.replace('vk.com', 'vkvideo.ru').replace('/video', '/embed');
  }

  private extractYouTubeId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  private extractInstagramId(url: string): string {
    const regex = /instagram\.com\/p\/([^\/]+)/;
    const match = url.match(regex);
    return match ? match[1] : '';
  }

  private getDefaultVideos(): Video[] {
    return [
      {
        id: '1',
        url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Красивый закат на море',
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
        duration: 45,
        views: 23,
        platform: 'youtube',
        createdAt: new Date()
      },
      {
        id: '2',
        url: 'https://tiktok.com/@user/video/123456789',
        title: 'Городские огни ночью',
        thumbnail: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=300&h=200&fit=crop',
        duration: 30,
        views: 67,
        platform: 'tiktok',
        createdAt: new Date()
      },
      {
        id: '3',
        url: 'https://instagram.com/p/ABC123DEF/',
        title: 'Морские волны',
        thumbnail: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=300&h=200&fit=crop',
        duration: 60,
        views: 89,
        platform: 'instagram',
        createdAt: new Date()
      }
    ];
  }
}

export const videoService = new VideoService();