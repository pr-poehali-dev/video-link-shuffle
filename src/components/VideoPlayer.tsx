import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { Video } from '@/types/video';

interface VideoPlayerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentVideo: number;
  availableVideos: Video[];
  watchProgress: number;
  canSkip: boolean;
  children: React.ReactNode;
}

const VideoPlayer = ({ 
  isOpen, 
  onOpenChange, 
  currentVideo, 
  availableVideos, 
  watchProgress, 
  canSkip,
  children 
}: VideoPlayerProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center">
            Видео {currentVideo + 1} из {availableVideos.length}
            {availableVideos[currentVideo] && (
              <span className="block text-sm font-normal text-primary mt-1">
                {availableVideos[currentVideo].platform.toUpperCase()}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="aspect-video bg-white border border-primary rounded-lg overflow-hidden">
            <div className="w-full h-full flex items-center justify-center text-primary text-center">
              <div>
                <Icon name="ExternalLink" size={48} className="mx-auto mb-2" />
                <p className="font-semibold">Видео открыто в новой вкладке</p>
                <p className="text-sm text-primary mt-2">
                  Просмотр засчитается на платформе
                </p>
                <p className="text-xs text-primary mt-1">
                  Посмотрите минимум 15 секунд
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-primary">
              <span>Минимальный просмотр: 15 секунд</span>
              <span>{Math.round(watchProgress)}%</span>
            </div>
            <Progress value={watchProgress} className="h-2" />
            <p className="text-xs text-primary text-center">
              {canSkip ? 
                'Минимальное время просмотрено! Сделайте репост для продолжения.' : 
                `Ещё ${15 - Math.round(watchProgress * 15 / 100)} секунд для разблокировки репоста`
              }
            </p>
          </div>

          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayer;