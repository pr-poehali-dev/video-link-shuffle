import { Banner, BannerPosition } from '@/types/banner';

class BannerService {
  private banners: Banner[] = [];
  private positions: BannerPosition[] = [
    {
      id: 'top',
      name: 'Верхний баннер',
      description: 'Баннер над главным заголовком',
      maxWidth: 728,
      maxHeight: 90,
      recommended: '728x90 (Leaderboard)'
    },
    {
      id: 'middle',
      name: 'Средний баннер',
      description: 'Между формой и каталогом видео',
      maxWidth: 300,
      maxHeight: 250,
      recommended: '300x250 (Medium Rectangle)'
    },
    {
      id: 'bottom',
      name: 'Нижний баннер',
      description: 'После каталога видео',
      maxWidth: 728,
      maxHeight: 90,
      recommended: '728x90 (Leaderboard)'
    },
    {
      id: 'sidebar',
      name: 'Боковой баннер',
      description: 'Справа от контента (только десктоп)',
      maxWidth: 160,
      maxHeight: 600,
      recommended: '160x600 (Skyscraper)'
    }
  ];

  private storageKey = 'podlet_banners';

  constructor() {
    this.loadBanners();
  }

  private loadBanners(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.banners = JSON.parse(stored).map((banner: any) => ({
          ...banner,
          createdAt: new Date(banner.createdAt),
          updatedAt: new Date(banner.updatedAt)
        }));
      }
    } catch (error) {
      console.error('Error loading banners:', error);
      this.banners = [];
    }
  }

  private saveBanners(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.banners));
    } catch (error) {
      console.error('Error saving banners:', error);
    }
  }

  getAllBanners(): Banner[] {
    return this.banners;
  }

  getActiveBanners(): Banner[] {
    return this.banners.filter(banner => banner.isActive);
  }

  getBannersByPosition(position: string): Banner[] {
    return this.banners.filter(banner => banner.position === position && banner.isActive);
  }

  getPositions(): BannerPosition[] {
    return this.positions;
  }

  addBanner(bannerData: Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>): Banner {
    const banner: Banner = {
      ...bannerData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.banners.push(banner);
    this.saveBanners();
    return banner;
  }

  updateBanner(id: string, updates: Partial<Banner>): Banner | null {
    const index = this.banners.findIndex(banner => banner.id === id);
    if (index === -1) return null;

    this.banners[index] = {
      ...this.banners[index],
      ...updates,
      updatedAt: new Date()
    };

    this.saveBanners();
    return this.banners[index];
  }

  deleteBanner(id: string): boolean {
    const index = this.banners.findIndex(banner => banner.id === id);
    if (index === -1) return false;

    this.banners.splice(index, 1);
    this.saveBanners();
    return true;
  }

  toggleBanner(id: string): Banner | null {
    const banner = this.banners.find(b => b.id === id);
    if (!banner) return null;

    return this.updateBanner(id, { isActive: !banner.isActive });
  }
}

export const bannerService = new BannerService();