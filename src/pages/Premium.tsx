import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { adminService } from '@/lib/adminService';

const Premium = () => {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'sbp'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Симуляция обработки платежа
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Получаем или создаем сессию пользователя
    let userSession = JSON.parse(localStorage.getItem('podlet_session') || '{}');
    if (!userSession.id) {
      userSession = {
        id: Date.now().toString(),
        language: 'ru',
        createdAt: new Date(),
        isPremium: false
      };
      localStorage.setItem('podlet_session', JSON.stringify(userSession));
    }
    
    const payment = adminService.createPayment(userSession.id, 'premium');
    
    // В реальности здесь будет интеграция с платежной системой
    if (paymentMethod === 'card' && cardNumber === '2204320326268200') {
      // Тестовая карта - автоподтверждение
      adminService.confirmPayment(payment.id);
      
      // Обновляем сессию пользователя
      userSession.isPremium = true;
      userSession.plan = 'premium';
      localStorage.setItem('podlet_session', JSON.stringify(userSession));
      
      alert('Оплата прошла успешно! Теперь ваши видео будут собирать до 1000 просмотров.');
      
      // Перезагружаем страницу чтобы обновить интерфейс
      setTimeout(() => window.location.reload(), 1000);
    } else if (paymentMethod === 'sbp') {
      alert('Переведите 299 ₽ по номеру телефона +7 (999) 123-45-67 с комментарием: ' + payment.id);
    } else {
      alert('Оплата отправлена на обработку. Премиум-статус активируется в течение 5 минут.');
    }
    
    setIsProcessing(false);
    setIsPaymentOpen(false);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-primary">Премиум тариф PodLet</h1>
          <p className="text-primary">Получите в 10 раз больше просмотров для своих видео</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Бесплатный тариф */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Бесплатный</span>
                <Badge className="bg-primary text-primary">Free</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">0 ₽</div>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Icon name="Check" size={16} className="text-primary mr-2" />
                  До 100 просмотров на видео
                </li>
                <li className="flex items-center">
                  <Icon name="Check" size={16} className="text-primary mr-2" />
                  Все популярные платформы
                </li>
                <li className="flex items-center">
                  <Icon name="Check" size={16} className="text-primary mr-2" />
                  Обход геоблокировок
                </li>
                <li className="flex items-center">
                  <Icon name="X" size={16} className="text-primary mr-2" />
                  Приоритетная обработка
                </li>
              </ul>
              <Button variant="outline" disabled className="w-full">
                Текущий тариф
              </Button>
            </CardContent>
          </Card>

          {/* Премиум тариф */}
          <Card className="border-2 border-primary relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-primary px-4 py-1 rounded-full text-sm">
                Рекомендуем
              </span>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Премиум</span>
                <Badge className="bg-primary text-primary">Premium</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">299 ₽</div>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Icon name="Check" size={16} className="text-primary mr-2" />
                  До 1000 просмотров на видео
                </li>
                <li className="flex items-center">
                  <Icon name="Check" size={16} className="text-primary mr-2" />
                  Все популярные платформы
                </li>
                <li className="flex items-center">
                  <Icon name="Check" size={16} className="text-primary mr-2" />
                  Обход геоблокировок
                </li>
                <li className="flex items-center">
                  <Icon name="Check" size={16} className="text-primary mr-2" />
                  Приоритетная обработка
                </li>
                <li className="flex items-center">
                  <Icon name="Check" size={16} className="text-primary mr-2" />
                  Техподдержка 24/7
                </li>
              </ul>
              <Button 
                onClick={() => setIsPaymentOpen(true)}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Купить премиум
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Преимущества */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Почему стоит выбрать премиум?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="TrendingUp" size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold mb-2">В 10 раз больше просмотров</h3>
                <p className="text-sm text-primary">
                  Ваши видео будут набирать до 1000 просмотров вместо 100
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="Zap" size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Приоритетная обработка</h3>
                <p className="text-sm text-primary">
                  Ваши видео появляются в каталоге в первую очередь
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="Headphones" size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Поддержка 24/7</h3>
                <p className="text-sm text-primary">
                  Решаем любые вопросы в течение нескольких минут
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Часто задаваемые вопросы</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-1">Как происходит оплата?</h4>
              <p className="text-sm text-primary">
                Принимаем банковские карты и переводы по СБП. Оплата проходит мгновенно.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-1">Когда активируется премиум?</h4>
              <p className="text-sm text-primary">
                Сразу после успешной оплаты. Все ваши новые видео будут набирать до 1000 просмотров.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-1">Можно ли вернуть деньги?</h4>
              <p className="text-sm text-primary">
                Да, в течение 7 дней после покупки, если не использовали премиум-функции.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Модальное окно оплаты */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Оплата премиум тарифа</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">299 ₽</div>
              <p className="text-sm text-primary">Единоразовый платеж</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Способ оплаты</label>
                <div className="flex gap-2 mt-1">
                  <Button
                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPaymentMethod('card')}
                    className="flex-1"
                  >
                    <Icon name="CreditCard" size={16} className="mr-1" />
                    Карта
                  </Button>
                  <Button
                    variant={paymentMethod === 'sbp' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPaymentMethod('sbp')}
                    className="flex-1"
                  >
                    <Icon name="Smartphone" size={16} className="mr-1" />
                    СБП
                  </Button>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <div>
                  <label className="text-sm font-medium">Номер карты</label>
                  <Input
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                  />
                  <p className="text-xs text-primary mt-1">
                    Для теста используйте: 2204 3203 2626 8200
                  </p>
                </div>
              )}

              {paymentMethod === 'sbp' && (
                <Alert>
                  <AlertDescription>
                    После нажатия "Оплатить" вы получите номер телефона для перевода через СБП
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Button 
              onClick={handlePayment}
              disabled={isProcessing || (paymentMethod === 'card' && !cardNumber)}
              className="w-full"
            >
              {isProcessing ? 'Обработка...' : 'Оплатить 299 ₽'}
            </Button>

            <p className="text-xs text-primary text-center">
              Нажимая "Оплатить", вы соглашаетесь с условиями использования
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Premium;