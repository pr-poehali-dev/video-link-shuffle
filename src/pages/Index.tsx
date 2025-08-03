import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import BannerSlot from '@/components/BannerSlot';
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
      description: 'Продвижение коротких роликов в VK Instagram YouTube TikTok Twitch и др.',
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
      description: 'Promote short videos on VK Instagram YouTube TikTok Twitch etc.',
      howItWorks: 'Free and simple, like this site!',
      placeholder: 'Paste your video link',
      button: 'Let\'s go!',
      watchFirst: 'Now watch three videos from other authors',
      watchNote: 'Watch each of the 3 videos below for at least 15 seconds and repost each video to our group',
      telegramLink: 'podlet_en',
      yourVideoAppears: 'Your video will also appear here after meeting the conditions!',
      goButton: 'Let\'s fly!'
    },
    es: {
      logo: 'PodLet',
      subtitle: '100 visualizaciones por video',
      description: 'Promociona videos cortos en VK Instagram YouTube TikTok Twitch etc.',
      howItWorks: '¡Gratis y simple, como este sitio!',
      placeholder: 'Pega el enlace de tu video',
      button: '¡Vamos!',
      watchFirst: 'Ahora mira tres videos de otros autores',
      watchNote: 'Mira cada uno de los 3 videos a continuación durante al menos 15 segundos y comparte cada video en nuestro grupo',
      telegramLink: 'podlet_es',
      yourVideoAppears: '¡Tu video también aparecerá aquí después de cumplir las condiciones!',
      goButton: '¡Volemos!'
    },
    fr: {
      logo: 'PodLet',
      subtitle: '100 vues par vidéo',
      description: 'Promouvez des vidéos courtes sur VK Instagram YouTube TikTok Twitch etc.',
      howItWorks: 'Gratuit et simple, comme ce site !',
      placeholder: 'Collez le lien de votre vidéo',
      button: 'Allons-y !',
      watchFirst: 'Maintenant regardez trois vidéos d\'autres auteurs',
      watchNote: 'Regardez chacune des 3 vidéos ci-dessous pendant au moins 15 secondes et partagez chaque vidéo dans notre groupe',
      telegramLink: 'podlet_fr',
      yourVideoAppears: 'Votre vidéo apparaîtra aussi ici après avoir rempli les conditions !',
      goButton: 'Envolons-nous !'
    },
    de: {
      logo: 'PodLet',
      subtitle: '100 Aufrufe pro Video',
      description: 'Bewirb kurze Videos auf VK Instagram YouTube TikTok Twitch usw.',
      howItWorks: 'Kostenlos und einfach, wie diese Seite!',
      placeholder: 'Fügen Sie Ihren Video-Link ein',
      button: 'Los geht\'s!',
      watchFirst: 'Schauen Sie sich jetzt drei Videos anderer Autoren an',
      watchNote: 'Schauen Sie sich jedes der 3 Videos unten mindestens 15 Sekunden lang an und teilen Sie jedes Video in unserer Gruppe',
      telegramLink: 'podlet_de',
      yourVideoAppears: 'Ihr Video wird auch hier erscheinen, nachdem Sie die Bedingungen erfüllt haben!',
      goButton: 'Fliegen wir!'
    },
    zh: {
      logo: 'PodLet',
      subtitle: '每个视频100次观看',
      description: '在VK Instagram YouTube TikTok Twitch等平台推广短视频',
      howItWorks: '免费且简单，就像这个网站！',
      placeholder: '粘贴您的视频链接',
      button: '开始！',
      watchFirst: '现在观看其他作者的三个视频',
      watchNote: '观看下面3个视频中的每一个至少15秒，并在我们的群组中分享每个视频',
      telegramLink: 'podlet_zh',
      yourVideoAppears: '满足条件后，您的视频也会出现在这里！',
      goButton: '飞吧！'
    },
    ja: {
      logo: 'PodLet',
      subtitle: '動画あたり100回再生',
      description: 'VK Instagram YouTube TikTok Twitchなどで短い動画を宣伝',
      howItWorks: 'このサイトのように無料で簡単！',
      placeholder: '動画リンクを貼り付けてください',
      button: '行こう！',
      watchFirst: '他の作者の3つの動画を見てください',
      watchNote: '下の3つの動画をそれぞれ最低15秒間視聴し、各動画を私たちのグループで共有してください',
      telegramLink: 'podlet_ja',
      yourVideoAppears: '条件を満たした後、あなたの動画もここに表示されます！',
      goButton: '飛ぼう！'
    },
    ko: {
      logo: 'PodLet',
      subtitle: '비디오당 100회 조회',
      description: 'VK Instagram YouTube TikTok Twitch 등에서 짧은 비디오 홍보',
      howItWorks: '이 사이트처럼 무료이고 간단합니다!',
      placeholder: '비디오 링크를 붙여넣으세요',
      button: '가자!',
      watchFirst: '이제 다른 작가들의 세 개의 비디오를 시청하세요',
      watchNote: '아래 3개 비디오를 각각 최소 15초 동안 시청하고 각 비디오를 우리 그룹에 공유하세요',
      telegramLink: 'podlet_ko',
      yourVideoAppears: '조건을 충족한 후 귀하의 비디오도 여기에 나타납니다!',
      goButton: '날아가자!'
    },
    pt: {
      logo: 'PodLet',
      subtitle: '100 visualizações por vídeo',
      description: 'Promova vídeos curtos no VK Instagram YouTube TikTok Twitch etc.',
      howItWorks: 'Grátis e simples, como este site!',
      placeholder: 'Cole o link do seu vídeo',
      button: 'Vamos!',
      watchFirst: 'Agora assista três vídeos de outros autores',
      watchNote: 'Assista cada um dos 3 vídeos abaixo por pelo menos 15 segundos e compartilhe cada vídeo em nosso grupo',
      telegramLink: 'podlet_pt',
      yourVideoAppears: 'Seu vídeo também aparecerá aqui após cumprir as condições!',
      goButton: 'Vamos voar!'
    },
    it: {
      logo: 'PodLet',
      subtitle: '100 visualizzazioni per video',
      description: 'Promuovi video brevi su VK Instagram YouTube TikTok Twitch ecc.',
      howItWorks: 'Gratuito e semplice, come questo sito!',
      placeholder: 'Incolla il link del tuo video',
      button: 'Andiamo!',
      watchFirst: 'Ora guarda tre video di altri autori',
      watchNote: 'Guarda ognuno dei 3 video qui sotto per almeno 15 secondi e condividi ogni video nel nostro gruppo',
      telegramLink: 'podlet_it',
      yourVideoAppears: 'Anche il tuo video apparirà qui dopo aver soddisfatto le condizioni!',
      goButton: 'Voliamo!'
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
      <header className="p-6">
        <div className="max-w-[585px] mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="https://cdn.poehali.dev/files/184752ef-65b4-48a2-8f29-7f318c1dc91a.png" 
              alt="PodLet Logo"
              className="h-16 md:h-20 w-auto rounded-md"
            />
          </div>
          
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
                {t.howItWorks}
              </AccordionTrigger>
              <AccordionContent className="text-primary pb-4">
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
                className={`h-14 text-lg rounded-xl border-2 transition-colors ${
                  videoUrl && !isValidVideoUrl(videoUrl) 
                    ? 'border-primary focus:border-primary' 
                    : 'border-primary focus:border-primary'
                }`}
              />
              <Icon name="Link" className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary" size={20} />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!isButtonActive || showVideos}
              className={`w-full h-12 text-base rounded-xl font-semibold transition-all duration-300 ${
                isButtonActive && !showVideos
                  ? 'bg-primary hover:bg-primary/90 text-primary shadow-lg hover:shadow-xl transform hover:scale-105' 
                  : 'bg-primary/30 text-primary/50 cursor-not-allowed'
              }`}
            >
              {showCaptcha && !captchaVerified ? t.goButton : t.button}
            </Button>
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
              <div className="text-center space-y-2">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-primary">{t.watchFirst}</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('/premium', '_blank')}
                    className="bg-primary text-primary border-0 text-xs"
                  >
                    <Icon name="Crown" size={14} className="mr-1" />
                    Premium (1000)
                  </Button>
                </div>
                <p className="text-sm text-primary">{t.watchNote}</p>
                <p className="text-xs text-primary">t.me/{t.telegramLink}</p>
                <p className="text-sm text-primary italic">{t.yourVideoAppears}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {availableVideos.map((video, index) => (
                  <Card 
                    key={video.id} 
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-primary hover:border-primary"
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
                          <div className="w-12 h-12 bg-primary bg-opacity-90 rounded-full flex items-center justify-center">
                            <Icon name="Play" size={20} className="text-primary ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-primary bg-opacity-70 text-primary text-xs px-2 py-1 rounded">
                          {video.views}/{userSession && adminService.getUserActivity(userSession.id)?.isPremium ? '1000' : '100'}
                        </div>
                        <div className="absolute top-2 left-2 bg-primary text-primary text-xs px-2 py-1 rounded">
                          {video.platform.toUpperCase()}
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-primary text-sm">{video.title}</h4>
                        <p className="text-xs text-primary mt-1">
                          {Math.max(0, (userSession && adminService.getUserActivity(userSession.id)?.isPremium ? 1000 : 100) - video.views)} просмотров до удаления
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Banner */}
          <BannerSlot position="bottom" className="flex justify-center mt-8" />
        </div>
      </main>

      {/* Video Player Modal */}
      <Dialog open={isPlayerOpen} onOpenChange={setIsPlayerOpen}>
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
                className="bg-primary text-primary w-full"
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