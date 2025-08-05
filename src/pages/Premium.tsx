import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { adminService } from '@/lib/adminService';
import { getTranslation, Language } from '@/lib/translations';
import SEOHead from '@/components/SEOHead';

const Premium = () => {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [cardNumber, setCardNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState('ru');

  // Читаем язык из URL параметров
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam) {
      setLanguage(langParam);
    }
  }, []);

  // Переводы для Premium страницы
  const t = {
    title: language === 'en' ? 'Premium Subscription PodLet' : 
           language === 'es' ? 'Suscripción Premium PodLet' :
           language === 'fr' ? 'Abonnement Premium PodLet' :
           language === 'de' ? 'Premium-Abonnement PodLet' :
           'Премиум подписка PodLet',
    subtitle: language === 'en' ? 'Get 10x more views with auto-reposts every month' :
             language === 'es' ? 'Consigue 10 veces más visualizaciones con reposteos automáticos cada mes' :
             language === 'fr' ? 'Obtenez 10 fois plus de vues avec des republications automatiques chaque mois' :
             language === 'de' ? 'Erhalten Sie 10x mehr Aufrufe mit automatischen Reposts jeden Monat' :
             'Получите в 10 раз больше просмотров с авторепостами каждый месяц',
    monthly: language === 'en' ? 'Monthly' : 
            language === 'es' ? 'Mensual' :
            language === 'fr' ? 'Mensuel' :
            language === 'de' ? 'Monatlich' :
            'Месячный',
    yearly: language === 'en' ? 'Yearly' :
           language === 'es' ? 'Anual' :
           language === 'fr' ? 'Annuel' :
           language === 'de' ? 'Jährlich' :
           'Годовой',
    popular: language === 'en' ? 'Popular' :
            language === 'es' ? 'Popular' :
            language === 'fr' ? 'Populaire' :
            language === 'de' ? 'Beliebt' :
            'Популярно',
    economy: language === 'en' ? 'Save 33%' :
            language === 'es' ? 'Ahorra 33%' :
            language === 'fr' ? 'Économisez 33%' :
            language === 'de' ? 'Sparen Sie 33%' :
            'Экономия 33%',
    orderSubscription: language === 'en' ? 'Order Subscription' :
                      language === 'es' ? 'Solicitar Suscripción' :
                      language === 'fr' ? 'Commander un Abonnement' :
                      language === 'de' ? 'Abonnement Bestellen' :
                      'Оформить подписку'
  };

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
    
    // Подтверждаем оплату (в реальности здесь будет проверка перевода)
    if (cardNumber.trim()) {
      adminService.confirmPayment(payment.id);
      
      // Обновляем сессию пользователя
      userSession.isPremium = true;
      userSession.plan = selectedPlan;
      userSession.subscriptionDate = new Date();
      userSession.autoRenewal = true;
      localStorage.setItem('podlet_session', JSON.stringify(userSession));
      
      const amount = selectedPlan === 'monthly' ? '299' : '2388';
      const duration = selectedPlan === 'monthly' ? 'месяц' : 'год';
      
      alert(`Подписка оформлена! Переведите ${amount} ₽ на карту 2204 3203 2626 8200. Подписка активируется в течение 5 минут и будет продлеваться каждый ${duration}.`);
      
      // Перезагружаем страницу чтобы обновить интерфейс
      setTimeout(() => window.location.href = '/', 2000);
    } else {
      alert('Ошибка оформления подписки.');
    }
    
    setIsProcessing(false);
    setIsPaymentOpen(false);
  };



  return (
    <>
      <SEOHead language={language as Language} page="premium" />
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-primary">{t.title}</h1>
            <p className="text-primary">{t.subtitle}</p>
          </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Годовая подписка */}
          <Card className="border-2 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-white border text-primary px-4 py-1 rounded-full text-sm">
                {t.economy}
              </span>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t.yearly}</span>
                <Badge className="bg-white border text-primary">12 месяцев</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">199 ₽<span className="text-sm font-normal">/мес</span></div>
              <div className="text-sm text-primary">Оплата сразу за год: 2388 ₽</div>
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
                <li className="flex items-center">
                  <Icon name="Star" size={16} className="text-primary mr-2" />
                  Экономия 1200 ₽ в год
                </li>
              </ul>
              <Button 
                onClick={() => { setSelectedPlan('yearly'); setIsPaymentOpen(true); }}
                className="w-full bg-white border border-primary text-primary hover:bg-primary hover:text-white"
              >
                {t.orderSubscription}
              </Button>
            </CardContent>
          </Card>

          {/* Месячная подписка */}
          <Card className="border-2 border-primary relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-white border text-primary px-4 py-1 rounded-full text-sm">
                {t.popular}
              </span>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t.monthly}</span>
                <Badge className="bg-white border text-primary">1 месяц</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">299 ₽<span className="text-sm font-normal">/мес</span></div>
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
                onClick={() => { setSelectedPlan('monthly'); setIsPaymentOpen(true); }}
                className="w-full bg-white border border-primary text-primary hover:bg-primary hover:text-white"
              >
                {t.orderSubscription}
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
                <div className="w-12 h-12 bg-white border border-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="TrendingUp" size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold mb-2">В 10 раз больше просмотров</h3>
                <p className="text-sm text-primary">
                  Ваши видео будут набирать до 1000 просмотров вместо 100
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-white border border-primary rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="Zap" size={24} className="text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Приоритетная обработка</h3>
                <p className="text-sm text-primary">
                  Ваши видео появляются в каталоге в первую очередь
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-white border border-primary rounded-full flex items-center justify-center mx-auto mb-3">
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
                Переведите указанную сумму на номер карты. Подписка активируется автоматически.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-1">Как работает автопродление?</h4>
              <p className="text-sm text-primary">
                Подписка продлевается автоматически каждый месяц. Можно отменить в любой момент.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-1">Можно ли отменить подписку?</h4>
              <p className="text-sm text-primary">
                Да, можно отменить автопродление в любой момент через личный кабинет.
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
              <div className="text-2xl font-bold mb-1">
                {selectedPlan === 'monthly' ? '299 ₽' : '2388 ₽'}
              </div>
              <p className="text-sm text-primary">
                {selectedPlan === 'monthly' ? 'Месячная подписка' : 'Годовая подписка (199 ₽/мес)'}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Номер карты для перевода</label>
                <div className="p-3 bg-background border border-primary rounded-lg mt-2">
                  <div className="text-lg font-mono font-bold text-primary mb-1">
                    2204 3203 2626 8200
                  </div>
                  <div className="text-sm text-primary">
                    Переведите {selectedPlan === 'monthly' ? '299' : '2388'} ₽ на эту карту
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Подтверждение оплаты</label>
                <Input
                  placeholder="Введите любое слово для подтверждения"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
                <p className="text-xs text-primary mt-1">
                  После перевода подписка активируется в течение 5 минут
                </p>
              </div>


            </div>

            <Button 
              onClick={handlePayment}
              disabled={isProcessing || !cardNumber}
              className="w-full"
            >
              {isProcessing ? 'Обработка...' : `Подтвердить оплату ${selectedPlan === 'monthly' ? '299' : '2388'} ₽`}
            </Button>

            <p className="text-xs text-primary text-center">
              Подписка будет продлеваться автоматически. Можно отменить в любой момент.
            </p>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
};

export default Premium;