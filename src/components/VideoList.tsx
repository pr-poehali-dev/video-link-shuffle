import VideoCard from '@/components/VideoCard';
import { Video, UserSession } from '@/types/video';

interface VideoListProps {
  availableVideos: Video[];
  watchedVideoIds: string[];
  userSession: UserSession | null;
  onVideoClick: (index: number) => void;
}

const VideoList = ({ 
  availableVideos, 
  watchedVideoIds, 
  userSession, 
  onVideoClick 
}: VideoListProps) => {
  const filteredVideos = availableVideos.filter(video => !watchedVideoIds.includes(video.id));

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {filteredVideos.map((video, index) => (
        <VideoCard
          key={video.id}
          video={video}
          userSession={userSession}
          onClick={() => onVideoClick(availableVideos.findIndex(v => v.id === video.id))}
        />
      ))}
    </div>
  );
};

export default VideoList;