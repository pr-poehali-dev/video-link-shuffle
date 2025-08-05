import { useState } from 'react';
import { AdBanner } from '@/types/news';
import { mockBanners } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const Admin = () => {
  const [banners, setBanners] = useState<AdBanner[]>(mockBanners);
  const [editingBanner, setEditingBanner] = useState<AdBanner | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const newBanner: Omit<AdBanner, 'id'> = {
    title: '',
    content: '',
    imageUrl: '',
    url: '',
    position: 'top',
    active: true,
    priority: 1,
  };

  const [formData, setFormData] = useState(newBanner);

  const handleInputChange = (field: keyof AdBanner, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.title || !formData.content) {
      toast({
        title: "Ошибка",
        description: "Заполните обязательные поля",
        variant: "destructive",
      });
      return;
    }

    if (editingBanner) {
      setBanners(prev => prev.map(banner => 
        banner.id === editingBanner.id 
          ? { ...formData, id: editingBanner.id }
          : banner
      ));
      toast({
        title: "Успешно",
        description: "Баннер обновлен",
      });
    } else {
      const newId = (banners.length + 1).toString();
      setBanners(prev => [...prev, { ...formData, id: newId }]);
      toast({
        title: "Успешно",
        description: "Баннер создан",
      });
    }

    handleCancel();
  };

  const handleEdit = (banner: AdBanner) => {
    setEditingBanner(banner);
    setFormData(banner);
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    setBanners(prev => prev.filter(banner => banner.id !== id));
    toast({
      title: "Успешно",
      description: "Баннер удален",
    });
  };

  const handleCancel = () => {
    setEditingBanner(null);
    setIsCreating(false);
    setFormData(newBanner);
  };

  const toggleBannerActive = (id: string) => {
    setBanners(prev => prev.map(banner => 
      banner.id === id 
        ? { ...banner, active: !banner.active }
        : banner
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Админ-панель
              </h1>
              <p className="text-gray-600">
                Управление рекламными баннерами и объявлениями
              </p>
            </div>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              На главную
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Активные баннеры
              </h2>
              <Button onClick={() => setIsCreating(true)}>
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить баннер
              </Button>
            </div>

            <div className="space-y-4">
              {banners.map((banner) => (
                <Card key={banner.id} className={`${!banner.active ? 'opacity-60' : ''}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{banner.title}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={banner.active ? "default" : "secondary"}>
                            {banner.active ? 'Активен' : 'Неактивен'}
                          </Badge>
                          <Badge variant="outline">
                            {banner.position}
                          </Badge>
                          <Badge variant="outline">
                            Приоритет: {banner.priority}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleBannerActive(banner.id)}
                        >
                          <Icon name={banner.active ? "EyeOff" : "Eye"} size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(banner)}
                        >
                          <Icon name="Edit" size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(banner.id)}
                        >
                          <Icon name="Trash" size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-2">{banner.content}</p>
                    {banner.url && (
                      <p className="text-sm text-blue-600">
                        <Icon name="Link" size={14} className="inline mr-1" />
                        {banner.url}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {isCreating && (
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>
                    {editingBanner ? 'Редактировать баннер' : 'Новый баннер'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Заголовок *
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Заголовок баннера"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Содержание *
                    </label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      placeholder="Текст объявления"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      URL изображения
                    </label>
                    <Input
                      value={formData.imageUrl || ''}
                      onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Ссылка
                    </label>
                    <Input
                      value={formData.url || ''}
                      onChange={(e) => handleInputChange('url', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Позиция
                    </label>
                    <Select 
                      value={formData.position} 
                      onValueChange={(value) => handleInputChange('position', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Верх страницы</SelectItem>
                        <SelectItem value="middle">Середина</SelectItem>
                        <SelectItem value="bottom">Низ страницы</SelectItem>
                        <SelectItem value="sidebar">Боковая панель</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Приоритет
                    </label>
                    <Input
                      type="number"
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', parseInt(e.target.value) || 1)}
                      min="1"
                      max="10"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.active}
                      onCheckedChange={(checked) => handleInputChange('active', checked)}
                    />
                    <label className="text-sm font-medium">
                      Активен
                    </label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} className="flex-1">
                      <Icon name="Save" size={16} className="mr-2" />
                      Сохранить
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      Отмена
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;