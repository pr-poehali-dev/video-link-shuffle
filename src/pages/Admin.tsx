import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { adminService } from '@/lib/adminService';
import { bannerService } from '@/lib/bannerService';
import { AdminStats, UserActivity, VideoStats, PaymentRecord } from '@/types/admin';
import { Banner, BannerPosition } from '@/types/banner';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserActivity[]>([]);
  const [videos, setVideos] = useState<VideoStats[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [positions, setPositions] = useState<BannerPosition[]>([]);
  const [loading, setLoading] = useState(false);
  const [newBanner, setNewBanner] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    position: 'top' as Banner['position'],
    isActive: true
  });

  const handleLogin = () => {
    if (adminService.checkAdminAccess(password)) {
      setIsAuthenticated(true);
      loadData();
    } else {
      alert('Неверный пароль');
    }
  };

  const loadData = () => {
    setLoading(true);
    setStats(adminService.getAdminStats());
    setUsers(adminService.getAllUsers().sort((a, b) => 
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    ));
    setVideos(adminService.getVideoStats().sort((a, b) => b.views - a.views));
    setPayments(adminService.getAllPayments().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
    setBanners(bannerService.getAllBanners());
    setPositions(bannerService.getPositions());
    setLoading(false);
  };

  const handleBlockUser = (sessionId: string) => {
    adminService.blockUser(sessionId);
    loadData();
  };

  const handleUnblockUser = (sessionId: string) => {
    adminService.unblockUser(sessionId);
    loadData();
  };

  const handleDeleteVideo = (videoId: string) => {
    if (confirm('Удалить это видео?')) {
      adminService.deleteVideo(videoId);
      loadData();
    }
  };

  const handleConfirmPayment = (paymentId: string) => {
    adminService.confirmPayment(paymentId);
    loadData();
  };

  const exportData = () => {
    const data = adminService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `podlet-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleAddBanner = () => {
    if (!newBanner.title || !newBanner.imageUrl) return;
    bannerService.addBanner(newBanner);
    setNewBanner({
      title: '',
      imageUrl: '',
      linkUrl: '',
      position: 'top',
      isActive: true
    });
    loadData();
  };

  const handleToggleBanner = (id: string) => {
    bannerService.toggleBanner(id);
    loadData();
  };

  const handleDeleteBanner = (id: string) => {
    if (confirm('Удалить баннер?')) {
      bannerService.deleteBanner(id);
      loadData();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setNewBanner(prev => ({ ...prev, imageUrl: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Админ-панель PodLet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Пароль администратора"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full">
              Войти
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Админ-панель PodLet</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportData}>
              <Icon name="Download" size={16} className="mr-2" />
              Экспорт данных
            </Button>
            <Button variant="outline" onClick={loadData}>
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Обновить
            </Button>
            <Button onClick={() => setIsAuthenticated(false)}>
              Выйти
            </Button>
          </div>
        </div>

        {/* Статистика */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Всего пользователей</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-gray-500">
                  Активных сегодня: {stats.activeUsersToday}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Всего видео</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalVideos}</div>
                <p className="text-xs text-gray-500">
                  Добавлено сегодня: {stats.videosAddedToday}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Премиум пользователи</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.premiumUsers}</div>
                <p className="text-xs text-gray-500">
                  Всего просмотров: {stats.totalViews}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Доходы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRevenue} ₽</div>
                <p className="text-xs text-gray-500">
                  За все время
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="videos">Видео</TabsTrigger>
            <TabsTrigger value="payments">Платежи</TabsTrigger>
            <TabsTrigger value="banners">Баннеры</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Активность пользователей</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID сессии</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Тариф</TableHead>
                      <TableHead>Видео посмотрено</TableHead>
                      <TableHead>Репостов</TableHead>
                      <TableHead>Последняя активность</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-xs">
                          {user.sessionId.slice(-8)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            user.status === 'active' ? 'default' :
                            user.status === 'blocked' ? 'destructive' : 'secondary'
                          }>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isPremium ? 'default' : 'outline'}>
                            {user.plan}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.videosWatched}</TableCell>
                        <TableCell>{user.videosShared}</TableCell>
                        <TableCell className="text-xs">
                          {new Date(user.lastActivity).toLocaleString('ru')}
                        </TableCell>
                        <TableCell>
                          {user.status === 'blocked' ? (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUnblockUser(user.sessionId)}
                            >
                              Разблокировать
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleBlockUser(user.sessionId)}
                            >
                              Заблокировать
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos">
            <Card>
              <CardHeader>
                <CardTitle>Статистика видео</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Платформа</TableHead>
                      <TableHead>Просмотры</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {videos.map((video) => (
                      <TableRow key={video.id}>
                        <TableCell className="max-w-xs truncate">
                          {video.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{video.platform}</Badge>
                        </TableCell>
                        <TableCell>
                          {video.views}/{video.maxViews}
                        </TableCell>
                        <TableCell>
                          <Badge variant={video.isPremium ? 'default' : 'secondary'}>
                            {video.isPremium ? 'Premium' : 'Free'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            video.status === 'active' ? 'default' : 'secondary'
                          }>
                            {video.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {new Date(video.createdAt).toLocaleDateString('ru')}
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteVideo(video.id)}
                          >
                            Удалить
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>История платежей</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID пользователя</TableHead>
                      <TableHead>Сумма</TableHead>
                      <TableHead>Тариф</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата создания</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-xs">
                          {payment.userId.slice(-8)}
                        </TableCell>
                        <TableCell>{payment.amount} ₽</TableCell>
                        <TableCell>
                          <Badge>{payment.plan}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            payment.status === 'completed' ? 'default' :
                            payment.status === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {new Date(payment.createdAt).toLocaleString('ru')}
                        </TableCell>
                        <TableCell>
                          {payment.status === 'pending' && (
                            <Button 
                              size="sm"
                              onClick={() => handleConfirmPayment(payment.id)}
                            >
                              Подтвердить
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="banners">
            <div className="space-y-6">
              {/* Добавить баннер */}
              <Card>
                <CardHeader>
                  <CardTitle>Добавить новый баннер</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Название</label>
                      <Input
                        value={newBanner.title}
                        onChange={(e) => setNewBanner(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Название баннера"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Позиция</label>
                      <select 
                        value={newBanner.position} 
                        onChange={(e) => setNewBanner(prev => ({ ...prev, position: e.target.value as Banner['position'] }))}
                        className="w-full p-2 border rounded"
                      >
                        {positions.map(pos => (
                          <option key={pos.id} value={pos.id}>
                            {pos.name} ({pos.recommended})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Изображение</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="mb-2"
                    />
                    <Input
                      value={newBanner.imageUrl}
                      onChange={(e) => setNewBanner(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="Или URL изображения"
                    />
                    {newBanner.imageUrl && (
                      <img src={newBanner.imageUrl} alt="Preview" className="w-32 h-20 object-cover rounded mt-2" />
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Ссылка (необязательно)</label>
                    <Input
                      value={newBanner.linkUrl}
                      onChange={(e) => setNewBanner(prev => ({ ...prev, linkUrl: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  </div>

                  <Button onClick={handleAddBanner} disabled={!newBanner.title || !newBanner.imageUrl}>
                    <Icon name="Plus" size={16} className="mr-2" />
                    Добавить баннер
                  </Button>
                </CardContent>
              </Card>

              {/* Список баннеров */}
              <Card>
                <CardHeader>
                  <CardTitle>Управление баннерами ({banners.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {banners.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      Баннеров пока нет. Добавьте первый!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {banners.map(banner => (
                        <div key={banner.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <img 
                            src={banner.imageUrl} 
                            alt={banner.title}
                            className="w-24 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium">{banner.title}</h3>
                            <div className="text-sm text-gray-500">
                              {positions.find(p => p.id === banner.position)?.name}
                            </div>
                            {banner.linkUrl && (
                              <div className="text-xs text-blue-600 truncate max-w-xs">{banner.linkUrl}</div>
                            )}
                            <div className="text-xs text-gray-400 mt-1">
                              Создан: {new Date(banner.createdAt).toLocaleDateString('ru')}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={banner.isActive ? 'default' : 'secondary'}>
                              {banner.isActive ? 'Активен' : 'Отключен'}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleBanner(banner.id)}
                            >
                              <Icon name={banner.isActive ? 'Eye' : 'EyeOff'} size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteBanner(banner.id)}
                            >
                              <Icon name="Trash2" size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Позиции баннеров */}
              <Card>
                <CardHeader>
                  <CardTitle>Позиции для размещения</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {positions.map(position => (
                      <div key={position.id} className="p-4 border rounded-lg">
                        <h3 className="font-medium">{position.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{position.description}</p>
                        <div className="text-xs text-gray-500 mt-2">
                          Рекомендуемый размер: {position.recommended}
                        </div>
                        <div className="text-xs text-gray-500">
                          Максимум: {position.maxWidth}x{position.maxHeight}px
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          Активных баннеров: {banners.filter(b => b.position === position.id && b.isActive).length}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;