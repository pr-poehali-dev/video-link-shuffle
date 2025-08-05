import { useEffect } from 'react';
import { getTranslation, Language } from '@/lib/translations';

interface SEOHeadProps {
  language: Language;
  page?: 'home' | 'premium' | 'stats' | 'admin';
}

const SEOHead = ({ language, page = 'home' }: SEOHeadProps) => {
  useEffect(() => {
    const title = getTranslation(language, 'seoTitle');
    const description = getTranslation(language, 'seoDescription');
    
    // Обновляем title
    document.title = title;
    
    // Обновляем description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
    
    // Обновляем og:title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title);
    }
    
    // Обновляем og:description
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', description);
    }
    
    // Обновляем twitter:title
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', title);
    }
    
    // Обновляем twitter:description
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', description);
    }
    
    // Обновляем lang атрибут
    document.documentElement.lang = language;
    
  }, [language, page]);

  return null;
};

export default SEOHead;