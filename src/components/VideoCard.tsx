import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { adminService } from '@/lib/adminService';
import { Video, UserSession } from '@/types/video';

interface VideoCardProps {
  video: Video;
  userSession: UserSession | null;
  onClick: () => void;
}

const VideoCard = ({ video, userSession, onClick }: VideoCardProps) => {
  const maxViews = userSession && adminService.getUserActivity(userSession.id)?.isPremium ? 1000 : 100;
  const remainingViews = Math.max(0, maxViews - video.views);

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-primary hover:border-primary min-w-[280px] flex-shrink-0"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative rounded-t-lg overflow-hidden">
          <img 
            src={video.thumbnail} 
            alt={video.title}
            className="w-full h-32 object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center mx-[113px] my-9 py-0 rounded-full px-[27px] bg-blue-500">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-500">
              <Icon name="Play" size={20} className="text-primary-foreground ml-0.5" />
            </div>
          </div>
          <div className="absolute bottom-2 right-2 text-primary-foreground text-xs px-2 py-1 rounded bg-blue-500">
            {video.views}/{maxViews}
          </div>
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
            {video.platform.toUpperCase()}
          </div>
        </div>
        <div className="p-3">
          <h4 className="font-medium text-sm text-[#6694fb]">{video.title}</h4>
          <p className="text-xs mt-1 text-[#6694fb]">
            {remainingViews} просмотров до удаления
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoCard;