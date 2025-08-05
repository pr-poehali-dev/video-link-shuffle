import { NewsArticle } from '@/types/news';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface NewsCardProps {
  article: NewsArticle;
  onClick?: () => void;
}

const NewsCard = ({ article, onClick }: NewsCardProps) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 group overflow-hidden"
      onClick={onClick}
    >
      {article.imageUrl && (
        <div className="relative overflow-hidden h-48">
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {article.trending && (
            <Badge className="absolute top-3 left-3 bg-red-500 text-white">
              <Icon name="TrendingUp" size={14} className="mr-1" />
              Тренд
            </Badge>
          )}
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            {article.category}
          </Badge>
          <div className="flex items-center text-xs text-muted-foreground">
            <Icon name="Eye" size={12} className="mr-1" />
            {formatViews(article.views)}
          </div>
        </div>
        
        <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
          {article.title}
        </h3>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
          {article.summary}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center">
            <Icon name="Globe" size={12} className="mr-1" />
            {article.source}
          </div>
          <div className="flex items-center">
            <Icon name="Clock" size={12} className="mr-1" />
            {formatDate(article.publishedAt)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsCard;