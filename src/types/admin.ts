export interface AdminStats {
  totalUsers: number;
  totalVideos: number;
  totalViews: number;
  activeUsersToday: number;
  videosAddedToday: number;
  premiumUsers: number;
  totalRevenue: number;
}

export interface UserActivity {
  id: string;
  sessionId: string;
  videoUrl?: string;
  videosWatched: number;
  videosShared: number;
  joinDate: Date;
  lastActivity: Date;
  isPremium: boolean;
  plan: 'free' | 'premium';
  status: 'active' | 'completed' | 'blocked';
}

export interface VideoStats {
  id: string;
  url: string;
  title: string;
  platform: string;
  views: number;
  maxViews: number;
  createdAt: Date;
  userId: string;
  isPremium: boolean;
  status: 'active' | 'completed' | 'moderation';
}

export interface PaymentRecord {
  id: string;
  userId: string;
  amount: number;
  plan: 'premium';
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: 'card' | 'sbp';
  cardNumber?: string;
  createdAt: Date;
  completedAt?: Date;
}