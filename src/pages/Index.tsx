import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Icon from '@/components/ui/icon';
import BannerSlot from '@/components/BannerSlot';
import VideoCard from '@/components/VideoCard';
import VideoPlayer from '@/components/VideoPlayer';
import VideoControls from '@/components/VideoControls';
import VideoList from '@/components/VideoList';
import confetti from 'canvas-confetti';
import { videoService } from '@/lib/videoService';
import { adminService } from '@/lib/adminService';
import { Video, VideoQueue, UserSession } from '@/types/video';
import SEOHead from '@/components/SEOHead';
import { getTranslation, Language, languages } from '@/lib/translations';

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
  const [watchedVideoIds, setWatchedVideoIds] = useState<string[]>([]);
  const [allVideosCompleted, setAllVideosCompleted] = useState(false);

  // Translation helper function using imported translations
  const t = {
    title: getTranslation(language as Language, 'title'),
    subtitle: getTranslation(language as Language, 'subtitle'),
    description: getTranslation(language as Language, 'description'),
    placeholderTitle: getTranslation(language as Language, 'placeholderTitle'),
    placeholderDescription: getTranslation(language as Language, 'placeholderDescription'),
    urlPlaceholder: getTranslation(language as Language, 'urlPlaceholder'),
    button: getTranslation(language as Language, 'button'),
    goButton: getTranslation(language as Language, 'goButton'),
    telegramLink: getTranslation(language as Language, 'telegramLink'),
    watchFirst: getTranslation(language as Language, 'watchFirst'),
    watchNote: getTranslation(language as Language, 'watchNote'),
    yourVideoAppears: getTranslation(language as Language, 'yourVideoAppears')
  };

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
    
    // Исключаем фото и статьи
    const excludePatterns = [
      /instagram\.com\/p\/.*\.(jpg|jpeg|png|gif)/, // Instagram фото
      /vk\.com\/photo/, // VK фото
      /vk\.ru\/photo/, // VK фото
      /youtube\.com\/channel\//,  // YouTube каналы
      /youtube\.com\/user\//,     // YouTube пользователи
      /tiktok\.com\/@[^/]+$/,     // TikTok профили
      /zen\.yandex\.ru\/(?!media\/video)/, // Яндекс.Дзен статьи
    ];
    
    if (excludePatterns.some(pattern => pattern.test(url))) {
      return false;
    }
    
    // Разрешаем только видео-контент
    const videoPatterns = [
      /youtube\.com\/watch\?v=[a-zA-Z0-9_-]+/,
      /youtu\.be\/[a-zA-Z0-9_-]+/,
      /youtube\.com\/shorts\/[a-zA-Z0-9_-]+/,
      /tiktok\.com\/@[^/]+\/video\/\d+/,
      /vm\.tiktok\.com\/[a-zA-Z0-9]+/,
      /instagram\.com\/reel\/[a-zA-Z0-9_-]+/,
      /vk\.com\/video-?\d+_\d+/,
      /vk\.com\/clip-?\d+_\d+/,
      /vk\.ru\/video-?\d+_\d+/,
      /vk\.ru\/clip-?\d+_\d+/,
      /vkvideo\.ru\/clip-?\d+_\d+/,
      /twitch\.tv\/videos\/\d+/,
      /clips\.twitch\.tv\/[a-zA-Z0-9_-]+/,
      /twitch\.tv\/[^/]+\/clip\/[a-zA-Z0-9_-]+/,
      /rutube\.ru\/video\/[a-zA-Z0-9_-]+/,
      /rutube\.ru\/shorts\/[a-zA-Z0-9_-]+/,
      /zen\.yandex\.ru\/media\/video\//
    ];
    
    return videoPatterns.some(pattern => pattern.test(url));
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
    
    // ВАЖНО: Открываем оригинальную ссылку в новой вкладке для засчитывания просмотров
    window.open(video.url, '_blank');
    
    // Затем открываем модальное окно для отслеживания прогресса
    setCurrentVideo(index);
    setCurrentPlayerUrl(video.url);
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

  const handleRepost = async () => {
    const video = availableVideos[currentVideo];
    if (!video) return;
    
    // Формируем сообщение для репоста
    const repostMessage = `🎥 Крутое видео! Смотрите:\n\n${video.url}\n\n#podlet #видео`;
    
    // Кодируем сообщение для URL
    const encodedMessage = encodeURIComponent(repostMessage);
    
    // Прямая ссылка на группу podlet_ru с готовым текстом для отправки
    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(video.url)}&text=${encodeURIComponent('🎥 Крутое видео! Смотрите:')}`;  
    
    // Открываем интерфейс отправки с автоматическим переходом в группу
    window.open(telegramShareUrl, '_blank');
    
    // Через небольшую задержку открываем группу
    setTimeout(() => {
      window.open('https://t.me/podlet_ru', '_blank');
    }, 1000);
    setHasReposted(true);
  };

  const triggerConfetti = () => {
    // Конфетти слева
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0, y: 0.6 },
      colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
    });
    
    // Конфетти справа
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 1, y: 0.6 },
      colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
    });
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
      
      // Добавляем видео в список просмотренных для скрытия
      setWatchedVideoIds(prev => [...prev, currentVideoData.id]);
      
      // Запускаем конфетти при исчезновении видео
      triggerConfetti();
      
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
    
    // Проверяем, остались ли еще видео для просмотра
    const remainingVideos = availableVideos.filter(video => !watchedVideoIds.includes(video.id) && video.id !== currentVideoData?.id);
    
    if (remainingVideos.length === 0) {
      // Все видео просмотрены
      setAllVideosCompleted(true);
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
    // Принудительно обновляем страницу для применения новых переводов
    window.location.reload();
  };

  const resetToAddMore = () => {
    // Сброс состояния для добавления нового видео
    setVideoUrl('');
    setShowVideos(false);
    setShowCaptcha(false);
    setCaptchaVerified(false);
    setWatchedVideoIds([]);
    setAllVideosCompleted(false);
    setIsButtonActive(false);
    // Обновляем доступные видео
    const videos = videoService.getVideosForViewing();
    setAvailableVideos(videos);
  };

  return (
    <>
      <SEOHead language={language as Language} page="home" />
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="p-6 px-[19px]">
          <div className="max-w-[585px] mx-auto flex justify-between items-center">
            <div className="flex items-center">
              <a href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
                <img 
                  src="https://cdn.poehali.dev/files/9ad7404a-82bb-43ea-ab53-440125603703.svg" 
                  alt="PodLet Logo"
                  className="h-16 md:h-20 w-auto"
                />
              </a>
            </div>
            
            <div className="flex items-center gap-4 py-0 rounded-none mx-0 my-0 px-0">
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-32 border-2 border-primary rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(languages).map(([code, name]) => (
                    <SelectItem key={code} value={code}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        {/* Top Banner */}
        <BannerSlot position="top" className="container mx-auto px-4 py-2" />

        {/* Main Content */}
        <main className="container mx-auto px-4 pb-12">
          <div className="max-w-[585px] mx-auto space-y-6">
            {/* Description */}
            <div className="text-center space-y-3 animate-fade-in">
              <h2 className="text-lg text-primary">{t.description}</h2>
            </div>

            {/* How it works */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="how-it-works" className="border border-primary rounded-xl px-4">
                <AccordionTrigger className="text-left text-primary hover:text-primary">
                  {t.placeholderTitle}
                </AccordionTrigger>
                <AccordionContent className="text-primary pb-4">
                  {t.placeholderDescription}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* URL Input */}
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="url"
                  placeholder={t.urlPlaceholder}
                  value={videoUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className={`h-14 text-lg rounded-xl border-2 transition-colors ${
                    videoUrl && !isValidVideoUrl(videoUrl) 
                      ? 'border-primary focus:border-primary' 
                      : 'border-primary focus:border-primary'
                  }`}
                />
                <Icon name="Link" className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary" size={20} />
              </div>

              {!showVideos && (
                <Button
                  onClick={handleSubmit}
                  disabled={!isButtonActive}
                  className={`w-full h-12 text-base rounded-xl font-semibold transition-all duration-300 ${
                    isButtonActive
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transform hover:scale-105' 
                      : 'bg-background border border-primary text-primary cursor-not-allowed'
                  }`}
                >
                  {showCaptcha && !captchaVerified ? t.goButton : t.button}
                </Button>
              )}
            </div>

            {/* Middle Banner */}
            <BannerSlot position="middle" className="flex justify-center" />

            {/* Captcha */}
            {showCaptcha && !captchaVerified && (
              <Card className="animate-scale-in border-2 border-primary">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Icon name="Check" size={24} className="text-primary" />
                  </div>
                  <p className="text-primary">Капча пройдена! Нажмите кнопку еще раз.</p>
                </CardContent>
              </Card>
            )}

            {/* Video Catalog */}
            {showVideos && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-left space-y-3 max-w-[585px]">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = `/premium?lang=${language}`}
                    className="w-full bg-primary text-white border-0 text-xs h-10"
                  >
                    <Icon name="Crown" size={14} className="mr-1" />
                    Premium (1000)
                  </Button>
                  <h3 className="text-lg font-semibold text-blue-600 text-center">{t.watchFirst}</h3>
                  <p className="text-sm text-blue-600">{t.watchNote}</p>
                  <a 
                    href={`https://t.me/${t.telegramLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 underline cursor-pointer transition-colors block"
                  >
                    t.me/{t.telegramLink}
                  </a>
                  <p className="text-sm text-blue-600 italic font-semibold text-left">{t.yourVideoAppears}</p>
                </div>

                {/* Блок успешного завершения всех видео */}
                {allVideosCompleted ? (
                  <div className="text-center space-y-4 animate-fade-in">
                    <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Icon name="CheckCircle" size={32} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-green-600">Поздравляем!</h3>
                    <p className="text-primary">Вы просмотрели все видео и сделали репосты!</p>
                    <p className="text-sm text-primary">Ваше видео добавлено в каталог и скоро получит просмотры.</p>
                    <Button 
                      onClick={resetToAddMore}
                      className="bg-primary text-primary-foreground px-6 py-2 rounded-xl"
                    >
                      Добавить ещё
                    </Button>
                  </div>
                ) : (
                  <VideoList
                    availableVideos={availableVideos}
                    watchedVideoIds={watchedVideoIds}
                    userSession={userSession}
                    onVideoClick={openPlayer}
                  />
                )}
              </div>
            )}

            {/* Bottom Banner */}
            <BannerSlot position="bottom" className="flex justify-center mt-8" />
          </div>
        </main>

        {/* Video Player Modal */}
        <VideoPlayer
          isOpen={isPlayerOpen}
          onOpenChange={setIsPlayerOpen}
          currentVideo={currentVideo}
          availableVideos={availableVideos}
          watchProgress={watchProgress}
          canSkip={canSkip}
        >
          <VideoControls
            canSkip={canSkip}
            hasReposted={hasReposted}
            watchProgress={watchProgress}
            currentVideo={currentVideo}
            availableVideos={availableVideos}
            onRepost={handleRepost}
            onNextVideo={handleNextVideo}
          />
        </VideoPlayer>
      </div>
    </>
  );
};

export default Index;