import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

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

  const handleUrlChange = (value: string) => {
    setVideoUrl(value);
    setIsButtonActive(value.length > 0);
  };

  const handleSubmit = () => {
    if (videoUrl && !showCaptcha) {
      setShowCaptcha(true);
    } else if (showCaptcha && !captchaVerified) {
      setCaptchaVerified(true);
      setShowVideos(true);
    }
  };

  const openPlayer = (index: number) => {
    setCurrentVideo(index);
    setIsPlayerOpen(true);
    setWatchProgress(0);
    setCanSkip(false);
    
    // Simulate video progress
    const interval = setInterval(() => {
      setWatchProgress(prev => {
        if (prev >= 100) {
          setCanSkip(true);
          clearInterval(interval);
          return 100;
        }
        return prev + 6.67; // 15 seconds = 100%
      });
    }, 1000);
  };

  const mockVideos = [
    { id: 1, title: 'Красивый закат', views: '15 сек', thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop' },
    { id: 2, title: 'Городские огни', views: '15 сек', thumbnail: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=300&h=200&fit=crop' },
    { id: 3, title: 'Морские волны', views: '15 сек', thumbnail: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=300&h=200&fit=crop' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Icon name="Play" size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t.logo}
            </h1>
            <p className="text-sm text-gray-500">{t.subtitle}</p>
          </div>
        </div>
        
        <Select value={language} onValueChange={setLanguage}>
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
      <main className="container mx-auto px-6 pb-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Description */}
          <div className="text-center space-y-4 animate-fade-in">
            <h2 className="text-xl text-gray-700">{t.description}</h2>
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
              disabled={!isButtonActive}
              className={`w-full h-14 text-lg rounded-xl font-semibold transition-all duration-300 ${
                isButtonActive 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg animate-pulse-blue' 
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
                <h3 className="text-xl font-semibold text-gray-800">{t.watchFirst}</h3>
                <p className="text-sm text-gray-600">{t.watchNote}</p>
                <p className="text-xs text-blue-600">t.me/{t.telegramLink}</p>
                <p className="text-sm text-gray-500 italic">{t.yourVideoAppears}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mockVideos.map((video, index) => (
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
                          {video.views}
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-gray-800 text-sm">{video.title}</h4>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Видео {currentVideo + 1} из 3</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
              <div className="text-white text-center">
                <Icon name="Play" size={48} className="mx-auto mb-2" />
                <p>Здесь воспроизводится видео</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Минимальный просмотр: 15 секунд</span>
                <span>{Math.round(watchProgress)}%</span>
              </div>
              <Progress value={watchProgress} className="h-2" />
            </div>

            <div className="flex justify-between items-center">
              <Button variant="outline" className="flex items-center space-x-2">
                <Icon name="Share" size={16} />
                <span>Репост в Telegram</span>
              </Button>
              
              <Button 
                disabled={!canSkip}
                onClick={() => setIsPlayerOpen(false)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
              >
                {canSkip ? 'Следующее видео' : `Ещё ${15 - Math.round(watchProgress * 15 / 100)} сек`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;