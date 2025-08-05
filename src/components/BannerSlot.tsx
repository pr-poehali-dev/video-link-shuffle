import { useEffect, useState } from 'react';
import { bannerService } from '@/lib/bannerService';
import { Banner } from '@/types/banner';

interface BannerSlotProps {
  position: 'top' | 'middle' | 'bottom' | 'sidebar';
  className?: string;
}

const BannerSlot = ({ position, className = '' }: BannerSlotProps) => {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    const activeBanners = bannerService.getBannersByPosition(position);
    setBanners(activeBanners);
  }, [position]);

  if (banners.length === 0) {
    return null;
  }

  // Показываем первый активный баннер для позиции
  const banner = banners[0];

  const handleClick = () => {
    if (banner.linkUrl) {
      window.open(banner.linkUrl, '_blank');
    }
  };

  return (
    <div className={`banner-slot banner-${position} ${className}`}>
      <div 
        className={`banner-container ${banner.linkUrl ? 'cursor-pointer' : ''}`}
        onClick={handleClick}
      >
        <img
          src={banner.imageUrl}
          alt={banner.title}
          className="w-full h-auto rounded-lg shadow-sm hover:shadow-md transition-shadow"
          style={{
            maxWidth: getBannerMaxWidth(position),
            maxHeight: getBannerMaxHeight(position)
          }}
        />
      </div>
    </div>
  );
};

const getBannerMaxWidth = (position: string): number => {
  switch (position) {
    case 'top':
    case 'bottom':
      return 728;
    case 'middle':
      return 300;
    case 'sidebar':
      return 160;
    default:
      return 300;
  }
};

const getBannerMaxHeight = (position: string): number => {
  switch (position) {
    case 'top':
    case 'bottom':
      return 90;
    case 'middle':
      return 250;
    case 'sidebar':
      return 600;
    default:
      return 250;
  }
};

export default BannerSlot;