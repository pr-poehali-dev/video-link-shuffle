import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { videoService } from '@/lib/videoService';
import { adminService } from '@/lib/adminService';
import { Video, VideoQueue, UserSession } from '@/types/video';

const Index = () => {
  const [language, setLanguage] = useState('ru');
  const [videoUrl, setVideoUrl] = useState('');
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [showVideos, setShowVideos] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(0);
  const [watchProgress, setWatchProgress] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [videoQueue, setVideoQueue] = useState<VideoQueue | null>(null);
  const [availableVideos, setAvailableVideos] = useState<Video[]>([]);
  const [currentPlayerUrl, setCurrentPlayerUrl] = useState('');
  const [hasReposted, setHasReposted] = useState(false);

  const languages = {
    ru: 'Русский',
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    zh: '中文',
    ja: '日本語',
    ko: '한국어',
    pt: 'Português',
    it: 'Italiano'
  };

  const translations = {
    ru: {
      logo: 'PodLet',
      subtitle: '100 просмотров на видео',
      description: 'Продвижение коротких роликов в VK Instagram YouTube TikTok и др.',
      howItWorks: 'Бесплатно и просто, как этот сайт!',
      placeholder: 'Вставь ссылку на свой ролик',
      button: 'Поехали!',
      watchFirst: 'Теперь посмотри три ролика других авторов',
      watchNote: 'Сделай на каждом из 3-х видео ниже минимум 15 сек. просмотра и ещё, обязательно репост каждого видео в наш группу',
      telegramLink: 'podlet_ru',
      yourVideoAppears: 'Твоё видео тоже появится тут, после выполнения условий!',
      goButton: 'Полетели!'
    },
    en: {
      logo: 'PodLet',
      subtitle: '100 views per video',
      description: 'Promote short videos on VK Instagram YouTube TikTok etc.',
      howItWorks: 'Free and simple, like this site!',
      placeholder: 'Paste your video link',
      button: 'Let\'s go!',
      watchFirst: 'Now watch three videos from other authors',
      watchNote: 'Watch each of the 3 videos below for at least 15 seconds and repost each video to our group',
      telegramLink: 'podlet_en',
      yourVideoAppears: 'Your video will also appear here after meeting the conditions!',
      goButton: 'Let\'s fly!'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.ru;

  // Инициализация при загрузке
  useEffect(() => {
    const session = videoService.getOrCreateSession();
    setUserSession(session);
    setLanguage(session.language);
    
    // Загружаем доступные видео
    const videos = videoService.getVideosForViewing();
    setAvailableVideos(videos);
    
    // Регистрируем активность пользователя
    adminService.updateUserActivity(session.id, {
      sessionId: session.id,
      lastActivity: new Date()
    });
  }, []);

  const handleUrlChange = (value: string) => {
    setVideoUrl(value);
    setIsButtonActive(value.length > 0 && isValidVideoUrl(value));
  };

  const isValidVideoUrl = (url: string): boolean => {
    if (!url || url.length < 10) return false;
    
    const patterns = [
      /youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\//,
      /tiktok\.com\/.*\/video\/|vm\.tiktok\.com\//,
      /instagram\.com\/p\/|instagram\.com\/reel\//,
      /vk\.com\/video|vk\.com\/clip|vk\.ru\/video|vk\.ru\/clip|vkvideo\.ru\/clip/,
      /twitch\.tv\/videos\/|clips\.twitch\.tv\//,
      /rutube\.ru\/video\//,
      /zen\.yandex\.ru\/media\//
    ];
    return patterns.some(pattern => pattern.test(url));
  };

  const handleSubmit = async () => {
    if (!userSession) return;
    
    if (videoUrl && !showCaptcha) {
      setShowCaptcha(true);
    } else if (showCaptcha && !captchaVerified) {
      // Добавляем видео пользователя в базу
      videoService.addVideo(videoUrl);
      
      // Создаем очередь для просмотра
      const queue = videoService.createVideoQueue(userSession.id);
      setVideoQueue(queue);
      
      setCaptchaVerified(true);
      setShowVideos(true);
      
      // Обновляем сессию
      const updatedSession = { ...userSession, videoUrl };
      videoService.updateSession(updatedSession);
      setUserSession(updatedSession);
      
      // Регистрируем добавление видео
      adminService.updateUserActivity(userSession.id, {
        videoUrl,
        lastActivity: new Date()
      });
    }
  };

  const openPlayer = (index: number) => {
    if (!availableVideos[index]) return;
    
    const video = availableVideos[index];
    const playerUrl = videoService.getVideoPlayerUrl(video.url);
    
    setCurrentVideo(index);
    setCurrentPlayerUrl(playerUrl);
    setIsPlayerOpen(true);
    setWatchProgress(0);
    setCanSkip(false);
    setHasReposted(false);
    
    // Симуляция прогресса просмотра
    const interval = setInterval(() => {
      setWatchProgress(prev => {
        if (prev >= 100) {
          setCanSkip(true);
          clearInterval(interval);
          return 100;
        }
        return prev + 6.67; // 15 секунд = 100%
      });
    }, 1000);
  };

  const handleRepost = () => {
    const video = availableVideos[currentVideo];
    if (!video) return;
    
    // Открываем конкретную группу Telegram
    const telegramUrl = `https://t.me/podlet_ru`;
    window.open(telegramUrl, '_blank');
    setHasReposted(true);
  };

  const handleNextVideo = () => {
    if (!userSession || !videoQueue) return;
    
    const currentVideoData = availableVideos[currentVideo];
    if (currentVideoData) {
      // Увеличиваем счетчик просмотров
      const user = adminService.getUserActivity(userSession.id);
      const maxViews = user?.isPremium ? 1000 : 100;
      
      if (currentVideoData.views < maxViews) {
        videoService.incrementView(currentVideoData.id);
        
        // Обновляем статистику пользователя
        adminService.updateUserActivity(userSession.id, {
          videosWatched: (user?.videosWatched || 0) + 1,
          videosShared: hasReposted ? (user?.videosShared || 0) + 1 : (user?.videosShared || 0)
        });
      }
      
      // Обновляем очередь пользователя
      const updatedQueue = {
        ...videoQueue,
        watchedVideos: [...videoQueue.watchedVideos, currentVideoData.id],
        completedWatches: canSkip && hasReposted ? 
          [...videoQueue.completedWatches, currentVideoData.id] : 
          videoQueue.completedWatches
      };
      videoService.updateUserQueue(userSession.id, updatedQueue);
      setVideoQueue(updatedQueue);
    }
    
    setIsPlayerOpen(false);
    
    // Проверяем, посмотрел ли пользователь все 3 видео
    if (videoQueue && videoQueue.completedWatches.length >= 2) {
      // Пользователь выполнил условия, его видео появится в каталоге
      setTimeout(() => {
        alert('Поздравляем! Вы выполнили все условия. Ваше видео скоро появится в каталоге.');
      }, 1000);
    }
  };

  // Обновляем язык в сессии при изменении
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (userSession) {
      const updatedSession = { ...userSession, language: newLanguage };
      videoService.updateSession(updatedSession);
      setUserSession(updatedSession);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="flex justify-center items-center p-6 md:max-w-[585px] md:mx-auto">
        <div className="flex items-center space-x-3">
          <img 
            src="https://cdn.poehali.dev/files/184752ef-65b4-48a2-8f29-7f318c1dc91a.png" 
            alt="PodLet Logo"
            className="h-16 md:h-20 w-auto rounded-md"
          />
        </div>
        
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-32 border-2 border-gray-200 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(languages).map(([code, name]) => (
              <SelectItem key={code} value={code}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-12">
        <div className="max-w-[585px] mx-auto space-y-6">
          {/* Description */}
          <div className="text-center space-y-3 animate-fade-in">
            <h2 className="text-lg text-gray-700">{t.description}</h2>
          </div>

          {/* How it works */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="how-it-works" className="border border-gray-200 rounded-xl px-4">
              <AccordionTrigger className="text-left text-gray-600 hover:text-blue-600">
                {t.howItWorks}
              </AccordionTrigger>
              <AccordionContent className="text-gray-500 pb-4">
                Система взаимного продвижения: ты смотришь видео других пользователей, а они смотрят твои. Каждое видео получает 100 просмотров и исчезает из каталога.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* URL Input */}
          <div className="space-y-4">
            <div className="relative">
              <Input
                type="url"
                placeholder={t.placeholder}
                value={videoUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="h-14 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-500"
              />
              <Icon name="Link" className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!isButtonActive || showVideos}
              className={`w-full h-12 text-base rounded-xl font-semibold transition-all duration-300 ${
                isButtonActive && !showVideos
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {showCaptcha && !captchaVerified ? t.goButton : t.button}
            </Button>
          </div>

          {/* Captcha */}
          {showCaptcha && !captchaVerified && (
            <Card className="animate-scale-in border-2 border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Icon name="Check" size={24} className="text-white" />
                </div>
                <p className="text-gray-600">Капча пройдена! Нажмите кнопку еще раз.</p>
              </CardContent>
            </Card>
          )}

          {/* Video Catalog */}
          {showVideos && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{t.watchFirst}</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('/premium', '_blank')}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 text-xs"
                  >
                    <Icon name="Crown" size={14} className="mr-1" />
                    Premium (1000)
                  </Button>
                </div>
                <p className="text-sm text-gray-600">{t.watchNote}</p>
                <p className="text-xs text-blue-600">t.me/{t.telegramLink}</p>
                <p className="text-sm text-gray-500 italic">{t.yourVideoAppears}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {availableVideos.map((video, index) => (
                  <Card 
                    key={video.id} 
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-gray-200 hover:border-blue-300"
                    onClick={() => openPlayer(index)}
                  >
                    <CardContent className="p-0">
                      <div className="relative rounded-t-lg overflow-hidden">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                          <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                            <Icon name="Play" size={20} className="text-gray-800 ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {video.views}/{userSession && adminService.getUserActivity(userSession.id)?.isPremium ? '1000' : '100'}
                        </div>
                        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          {video.platform.toUpperCase()}
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-gray-800 text-sm">{video.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.max(0, (userSession && adminService.getUserActivity(userSession.id)?.isPremium ? 1000 : 100) - video.views)} просмотров до удаления
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Video Player Modal */}
      <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center">
              Видео {currentVideo + 1} из {availableVideos.length}
              {availableVideos[currentVideo] && (
                <span className="block text-sm font-normal text-gray-500 mt-1">
                  {availableVideos[currentVideo].platform.toUpperCase()}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
              {currentPlayerUrl ? (
                <iframe
                  src={currentPlayerUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video Player"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-center">
                  <div>
                    <Icon name="Play" size={48} className="mx-auto mb-2" />
                    <p>Загрузка видео...</p>
                    <p className="text-sm text-gray-300 mt-2">
                      Обход геоблокировок активен
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Минимальный просмотр: 15 секунд</span>
                <span>{Math.round(watchProgress)}%</span>
              </div>
              <Progress value={watchProgress} className="h-2" />
              <p className="text-xs text-gray-500 text-center">
                {canSkip ? 
                  'Минимальное время просмотрено! Сделайте репост для продолжения.' : 
                  `Ещё ${15 - Math.round(watchProgress * 15 / 100)} секунд для разблокировки репоста`
                }
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                disabled={!canSkip || hasReposted}
                onClick={handleRepost}
                className="flex items-center justify-center space-x-2 w-full"
              >
                <Icon name="Share" size={16} />
                <span>
                  {hasReposted ? '✅ Репост сделан' : 'Репост в Telegram'}
                </span>
              </Button>
              
              <Button 
                disabled={!canSkip || !hasReposted}
                onClick={handleNextVideo}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white w-full"
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;