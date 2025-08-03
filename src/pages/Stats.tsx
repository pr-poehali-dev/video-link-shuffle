import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { videoService } from '@/lib/videoService';
import { referralService } from '@/lib/referralService';
import { adminService } from '@/lib/adminService';
import { Video, UserSession } from '@/types/video';
import { ReferralStats } from '@/types/referral';

const Stats = () => {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [userVideos, setUserVideos] = useState<Video[]>([]);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [referralCode, setReferralCode] = useState<string>('');
  const [totalViews, setTotalViews] = useState(0);

  useEffect(() => {
    const session = videoService.getOrCreateSession();
    setUserSession(session);
    loadStats(session.id);
  }, []);

  const loadStats = (userId: string) => {
    // Загружаем видео пользователя
    const videos = videoService.getAllVideos().filter(video => video.addedBy === userId);
    setUserVideos(videos);
    
    // Считаем общие просмотры
    const views = videos.reduce((sum, video) => sum + video.views, 0);
    setTotalViews(views);
    
    // Загружаем реферальную статистику
    const refStats = referralService.getReferralStats(userId);
    setReferralStats(refStats);
    
    // Получаем или создаем реферальный код
    let userRefCode = referralService.getUserReferralCode(userId);
    if (!userRefCode) {
      userRefCode = referralService.generateReferralCode(userId);
    }
    setReferralCode(userRefCode.code);
  };

  const copyReferralLink = () => {
    const link = referralService.createReferralLink(referralCode);
    navigator.clipboard.writeText(link);
    alert('Реферальная ссылка скопирована!');
  };

  const shareOnTelegram = () => {
    const link = referralService.createReferralLink(referralCode);
    const text = `🚀 Присоединяйся к PodLet и получи бесплатные просмотры на свои видео! Используй мою реферальную ссылку:`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (!userSession) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader" size={32} className="animate-spin mx-auto mb-4" />
          <p>Загрузка статистики...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Моя статистика</h1>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            На главную
          </Button>
        </div>

        {/* Основная статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Мои видео</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{userVideos.length}</div>
              <p className="text-xs text-primary">Всего добавлено</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Просмотры</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalViews}</div>
              <p className="text-xs text-primary">Всего просмотров</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Рефералы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{referralStats?.totalReferrals || 0}</div>
              <p className="text-xs text-primary">Приглашено друзей</p>
            </CardContent>
          </Card>
        </div>

        {/* Мои видео */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Мои видео</CardTitle>
          </CardHeader>
          <CardContent>
            {userVideos.length === 0 ? (
              <div className="text-center text-primary py-8">
                <Icon name="Video" size={48} className="mx-auto mb-4 text-primary" />
                <p>Вы еще не добавили ни одного видео</p>
                <Button className="mt-4" onClick={() => window.location.href = '/'}>
                  Добавить первое видео
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {userVideos.map(video => (
                  <div key={video.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{video.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {video.platform.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-primary">
                          Добавлено: {new Date(video.createdAt).toLocaleDateString('ru')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{video.views}</div>
                      <div className="text-xs text-primary">просмотров</div>
                      <Progress 
                        value={(video.views / 100) * 100} 
                        className="w-20 h-2 mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Реферальная система */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon name="Users" size={20} />
              <span>Реферальная программа</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-background border border-primary rounded-lg">
                <h3 className="font-medium mb-2">Мой реферальный код</h3>
                <div className="flex items-center space-x-2">
                  <code className="bg-white px-3 py-1 rounded border text-lg font-mono">
                    {referralCode}
                  </code>
                  <Button size="sm" onClick={copyReferralLink}>
                    <Icon name="Copy" size={14} />
                  </Button>
                </div>
              </div>
              
              <div className="p-4 bg-background border border-primary rounded-lg">
                <h3 className="font-medium mb-2">Бонусы</h3>
                <div className="text-2xl font-bold text-primary">
                  +{referralStats?.totalBonus || 0}
                </div>
                <div className="text-sm text-primary">дополнительных просмотров</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">Поделиться</h3>
              <div className="flex space-x-2">
                <Button onClick={shareOnTelegram} className="flex-1">
                  <Icon name="Send" size={16} className="mr-2" />
                  Поделиться в Telegram
                </Button>
                <Button variant="outline" onClick={copyReferralLink} className="flex-1">
                  <Icon name="Link" size={16} className="mr-2" />
                  Скопировать ссылку
                </Button>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">Как это работает:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Пригласи друга по своей ссылке</li>
                <li>• Друг добавляет своё первое видео</li>
                <li>• Ты получаешь +10 просмотров на свои видео</li>
                <li>• Друг тоже получает бонус при регистрации</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Stats;