import { AdminStats, UserActivity, VideoStats, PaymentRecord } from '@/types/admin';
import { videoService } from './videoService';

class AdminService {
  private adminKey = 'podlet_admin_access';
  private statsKey = 'podlet_admin_stats';
  private usersKey = 'podlet_users_activity';
  private paymentsKey = 'podlet_payments';

  // Проверка доступа к админке (простая защита)
  checkAdminAccess(password: string): boolean {
    return password === 'podlet2024admin'; // В продакшене использовать хеш
  }

  // Получить общую статистику
  getAdminStats(): AdminStats {
    const videos = videoService.getVideos();
    const users = this.getAllUsers();
    const payments = this.getAllPayments();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeUsersToday = users.filter(user => 
      new Date(user.lastActivity) >= today
    ).length;
    
    const videosAddedToday = videos.filter(video => 
      new Date(video.createdAt) >= today
    ).length;
    
    const premiumUsers = users.filter(user => user.isPremium).length;
    
    const totalRevenue = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const totalViews = videos.reduce((sum, video) => sum + video.views, 0);

    return {
      totalUsers: users.length,
      totalVideos: videos.length,
      totalViews,
      activeUsersToday,
      videosAddedToday,
      premiumUsers,
      totalRevenue
    };
  }

  // Получить всех пользователей
  getAllUsers(): UserActivity[] {
    const stored = localStorage.getItem(this.usersKey);
    return stored ? JSON.parse(stored) : [];
  }

  // Получить активность пользователя
  getUserActivity(sessionId: string): UserActivity | null {
    const users = this.getAllUsers();
    return users.find(user => user.sessionId === sessionId) || null;
  }

  // Обновить активность пользователя
  updateUserActivity(sessionId: string, data: Partial<UserActivity>): void {
    const users = this.getAllUsers();
    const existingIndex = users.findIndex(user => user.sessionId === sessionId);
    
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...data, lastActivity: new Date() };
    } else {
      const newUser: UserActivity = {
        id: Date.now().toString(),
        sessionId,
        videosWatched: 0,
        videosShared: 0,
        joinDate: new Date(),
        lastActivity: new Date(),
        isPremium: false,
        plan: 'free',
        status: 'active',
        ...data
      };
      users.push(newUser);
    }
    
    localStorage.setItem(this.usersKey, JSON.stringify(users));
  }

  // Получить статистику по видео с расширенной информацией
  getVideoStats(): VideoStats[] {
    const videos = videoService.getVideos();
    const users = this.getAllUsers();
    
    return videos.map(video => {
      const user = users.find(u => u.videoUrl === video.url);
      return {
        id: video.id,
        url: video.url,
        title: video.title,
        platform: video.platform,
        views: video.views,
        maxViews: user?.isPremium ? 1000 : 100,
        createdAt: video.createdAt,
        userId: user?.sessionId || 'unknown',
        isPremium: user?.isPremium || false,
        status: video.views >= (user?.isPremium ? 1000 : 100) ? 'completed' : 'active'
      };
    });
  }

  // Заблокировать пользователя
  blockUser(sessionId: string): void {
    this.updateUserActivity(sessionId, { status: 'blocked' });
  }

  // Разблокировать пользователя
  unblockUser(sessionId: string): void {
    this.updateUserActivity(sessionId, { status: 'active' });
  }

  // Удалить видео (админская функция)
  deleteVideo(videoId: string): void {
    const videos = videoService.getVideos();
    const filteredVideos = videos.filter(v => v.id !== videoId);
    localStorage.setItem('podlet_videos', JSON.stringify(filteredVideos));
  }

  // Система платежей
  createPayment(sessionId: string, plan: 'premium'): PaymentRecord {
    const payment: PaymentRecord = {
      id: Date.now().toString(),
      userId: sessionId,
      amount: plan === 'premium' ? 299 : 0, // 299 рублей за премиум
      plan,
      status: 'pending',
      paymentMethod: 'card',
      createdAt: new Date()
    };
    
    const payments = this.getAllPayments();
    payments.push(payment);
    localStorage.setItem(this.paymentsKey, JSON.stringify(payments));
    
    return payment;
  }

  // Подтвердить оплату
  confirmPayment(paymentId: string): void {
    const payments = this.getAllPayments();
    const paymentIndex = payments.findIndex(p => p.id === paymentId);
    
    if (paymentIndex >= 0) {
      payments[paymentIndex].status = 'completed';
      payments[paymentIndex].completedAt = new Date();
      localStorage.setItem(this.paymentsKey, JSON.stringify(payments));
      
      // Обновляем статус пользователя на премиум
      const payment = payments[paymentIndex];
      this.updateUserActivity(payment.userId, { 
        isPremium: true, 
        plan: 'premium' 
      });
    }
  }

  // Получить все платежи
  getAllPayments(): PaymentRecord[] {
    const stored = localStorage.getItem(this.paymentsKey);
    return stored ? JSON.parse(stored) : [];
  }

  // Получить платежи пользователя
  getUserPayments(sessionId: string): PaymentRecord[] {
    const payments = this.getAllPayments();
    return payments.filter(p => p.userId === sessionId);
  }

  // Очистить старые данные (старше 30 дней)
  cleanupOldData(): void {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Очистка старых пользователей
    const users = this.getAllUsers();
    const activeUsers = users.filter(user => 
      new Date(user.lastActivity) > thirtyDaysAgo || user.isPremium
    );
    localStorage.setItem(this.usersKey, JSON.stringify(activeUsers));
    
    // Очистка старых платежей
    const payments = this.getAllPayments();
    const recentPayments = payments.filter(payment => 
      new Date(payment.createdAt) > thirtyDaysAgo
    );
    localStorage.setItem(this.paymentsKey, JSON.stringify(recentPayments));
  }

  // Экспорт данных
  exportData(): string {
    const data = {
      stats: this.getAdminStats(),
      users: this.getAllUsers(),
      videos: this.getVideoStats(),
      payments: this.getAllPayments(),
      exportDate: new Date()
    };
    
    return JSON.stringify(data, null, 2);
  }
}

export const adminService = new AdminService();