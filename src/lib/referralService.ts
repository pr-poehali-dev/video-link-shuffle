import { ReferralCode, ReferralUsage, ReferralStats } from '@/types/referral';

class ReferralService {
  private referralCodes: ReferralCode[] = [];
  private referralUsages: ReferralUsage[] = [];
  private storageKey = 'podlet_referrals';
  private usagesKey = 'podlet_referral_usages';

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    try {
      const codes = localStorage.getItem(this.storageKey);
      const usages = localStorage.getItem(this.usagesKey);
      
      if (codes) {
        this.referralCodes = JSON.parse(codes).map((code: any) => ({
          ...code,
          createdAt: new Date(code.createdAt)
        }));
      }
      
      if (usages) {
        this.referralUsages = JSON.parse(usages).map((usage: any) => ({
          ...usage,
          createdAt: new Date(usage.createdAt)
        }));
      }
    } catch (error) {
      console.error('Error loading referral data:', error);
    }
  }

  private saveData(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.referralCodes));
      localStorage.setItem(this.usagesKey, JSON.stringify(this.referralUsages));
    } catch (error) {
      console.error('Error saving referral data:', error);
    }
  }

  generateReferralCode(userId: string): ReferralCode {
    const code = this.generateUniqueCode();
    const referralCode: ReferralCode = {
      id: Date.now().toString(),
      code,
      userId,
      createdAt: new Date(),
      usageCount: 0,
      maxUses: 50, // Максимум 50 использований
      isActive: true,
      bonus: 10 // 10 дополнительных просмотров за каждого приглашенного
    };

    this.referralCodes.push(referralCode);
    this.saveData();
    return referralCode;
  }

  private generateUniqueCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code;
    
    do {
      code = 'REF';
      for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.referralCodes.some(ref => ref.code === code));
    
    return code;
  }

  validateReferralCode(code: string): ReferralCode | null {
    const referralCode = this.referralCodes.find(ref => 
      ref.code === code && 
      ref.isActive && 
      (!ref.maxUses || ref.usageCount < ref.maxUses)
    );
    
    return referralCode || null;
  }

  useReferralCode(code: string, newUserId: string): boolean {
    const referralCode = this.validateReferralCode(code);
    if (!referralCode || referralCode.userId === newUserId) {
      return false;
    }

    // Проверяем, не использовал ли уже этот пользователь реферальный код
    const existingUsage = this.referralUsages.find(usage => usage.referredUserId === newUserId);
    if (existingUsage) {
      return false;
    }

    // Создаем запись об использовании
    const usage: ReferralUsage = {
      id: Date.now().toString(),
      referralCode: code,
      referredUserId: newUserId,
      referrerUserId: referralCode.userId,
      createdAt: new Date(),
      bonusAwarded: referralCode.bonus,
      status: 'completed'
    };

    this.referralUsages.push(usage);
    
    // Увеличиваем счетчик использований
    referralCode.usageCount++;
    
    this.saveData();
    return true;
  }

  getUserReferralCode(userId: string): ReferralCode | null {
    return this.referralCodes.find(ref => ref.userId === userId) || null;
  }

  getReferralStats(userId: string): ReferralStats {
    const userCode = this.getUserReferralCode(userId);
    const userUsages = this.referralUsages.filter(usage => usage.referrerUserId === userId);
    
    return {
      totalReferrals: userUsages.length,
      totalBonus: userUsages.reduce((sum, usage) => sum + usage.bonusAwarded, 0),
      activeReferrals: userUsages.filter(usage => usage.status === 'completed').length,
      pendingBonus: userUsages.filter(usage => usage.status === 'pending').reduce((sum, usage) => sum + usage.bonusAwarded, 0)
    };
  }

  getReferralBonus(userId: string): number {
    const stats = this.getReferralStats(userId);
    return stats.totalBonus;
  }

  createReferralLink(code: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}?ref=${code}`;
  }

  getAllReferralCodes(): ReferralCode[] {
    return this.referralCodes;
  }

  getAllUsages(): ReferralUsage[] {
    return this.referralUsages;
  }
}

export const referralService = new ReferralService();