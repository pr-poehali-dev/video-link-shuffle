import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Video } from '@/types/video';

interface VideoControlsProps {
  canSkip: boolean;
  hasReposted: boolean;
  watchProgress: number;
  currentVideo: number;
  availableVideos: Video[];
  onRepost: () => void;
  onNextVideo: () => void;
}

const VideoControls = ({ 
  canSkip, 
  hasReposted, 
  watchProgress, 
  currentVideo, 
  availableVideos, 
  onRepost, 
  onNextVideo 
}: VideoControlsProps) => {
  return (
    <div className="flex flex-col gap-2">
      <Button 
        variant="outline" 
        disabled={!canSkip || hasReposted}
        onClick={onRepost}
        className="flex items-center justify-center space-x-2 w-full"
      >
        <Icon name="Share" size={16} />
        <span>
          {hasReposted ? 'Репост сделан' : 'Репост в Telegram'}
        </span>
      </Button>
      
      <Button 
        disabled={!canSkip || !hasReposted}
        onClick={onNextVideo}
        className="bg-primary text-primary-foreground w-full hover:bg-primary"
      >
        {!canSkip ? 
          `Ещё ${15 - Math.round(watchProgress * 15 / 100)} сек` : 
          !hasReposted ? 
            'Сначала сделайте репост' : 
            currentVideo < availableVideos.length - 1 ? 
              'Следующее видео' : 
              'Завершить просмотр'
        }
      </Button>
    </div>
  );
};

export default VideoControls;