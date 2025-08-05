export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content?: string;
  url: string;
  source: string;
  category: string;
  publishedAt: Date;
  imageUrl?: string;
  views: number;
  trending: boolean;
}

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  type: 'news' | 'social' | 'blog';
  enabled: boolean;
}

export interface NewsTag {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface AdBanner {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  url?: string;
  position: 'top' | 'middle' | 'bottom' | 'sidebar';
  active: boolean;
  priority: number;
}

export interface SearchFilters {
  query: string;
  category?: string;
  source?: string;
  dateFrom?: Date;
  dateTo?: Date;
}