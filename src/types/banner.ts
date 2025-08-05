export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  position: 'top' | 'middle' | 'bottom' | 'sidebar';
  isActive: boolean;
  width?: number;
  height?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BannerPosition {
  id: string;
  name: string;
  description: string;
  maxWidth: number;
  maxHeight: number;
  recommended: string;
}