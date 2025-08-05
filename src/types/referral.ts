export interface ReferralCode {
  id: string;
  code: string;
  userId: string;
  createdAt: Date;
  usageCount: number;
  maxUses?: number;
  isActive: boolean;
  bonus: number; // Бонус в просмотрах
}

export interface ReferralUsage {
  id: string;
  referralCode: string;
  referredUserId: string;
  referrerUserId: string;
  createdAt: Date;
  bonusAwarded: number;
  status: 'pending' | 'completed';
}

export interface ReferralStats {
  totalReferrals: number;
  totalBonus: number;
  activeReferrals: number;
  pendingBonus: number;
}