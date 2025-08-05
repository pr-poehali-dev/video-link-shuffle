import { AdBanner as AdBannerType } from '@/types/news';
import { Card, CardContent } from '@/components/ui/card';

interface AdBannerProps {
  banner: AdBannerType;
}

const AdBanner = ({ banner }: AdBannerProps) => {
  if (!banner.active) return null;

  const handleClick = () => {
    if (banner.url) {
      window.open(banner.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card 
      className={`bg-gradient-to-r from-blue-50 to-indigo-50 border-dashed border-2 border-blue-200 ${
        banner.url ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-4 text-center">
        <div className="flex flex-col items-center space-y-2">
          {banner.imageUrl && (
            <img 
              src={banner.imageUrl} 
              alt={banner.title}
              className="max-h-20 object-contain"
            />
          )}
          <h3 className="font-medium text-blue-700">{banner.title}</h3>
          <p className="text-sm text-blue-600">{banner.content}</p>
          <p className="text-xs text-muted-foreground">Реклама</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdBanner;