import { useState, useEffect } from 'react';
import { NewsArticle, NewsTag } from '@/types/news';
import { mockNews, mockTags, mockBanners } from '@/lib/mockData';
import NewsCard from '@/components/NewsCard';
import SearchBar from '@/components/SearchBar';
import TagCloud from '@/components/TagCloud';
import AdBanner from '@/components/AdBanner';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [articles, setArticles] = useState<NewsArticle[]>(mockNews);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>(mockNews);
  const [tags] = useState<NewsTag[]>(mockTags);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const updateData = () => {
    setIsLoading(true);
    setTimeout(() => {
      const updatedArticles = articles.map(article => ({
        ...article,
        views: article.views + Math.floor(Math.random() * 100),
        publishedAt: Math.random() > 0.7 ? new Date() : article.publishedAt,
      }));
      setArticles(updatedArticles);
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    const interval = setInterval(updateData, 30000);
    return () => clearInterval(interval);
  }, [articles]);

  useEffect(() => {
    let filtered = articles;

    if (searchQuery) {
      filtered = filtered.filter(
        article =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.summary.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedTag) {
      filtered = filtered.filter(article => article.category === selectedTag);
    }

    setFilteredArticles(filtered);
  }, [articles, searchQuery, selectedTag]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedTag('');
  };

  const handleTagClick = (tagName: string) => {
    setSelectedTag(selectedTag === tagName ? '' : tagName);
    setSearchQuery('');
  };

  const handleArticleClick = (article: NewsArticle) => {
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  const topBanner = mockBanners.find(b => b.position === 'top' && b.active);
  const sidebarBanner = mockBanners.find(b => b.position === 'sidebar' && b.active);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex justify-center mb-8">
            <img 
              src="https://cdn.poehali.dev/files/9ad7404a-82bb-43ea-ab53-440125603703.svg" 
              alt="NewsHub Logo"
              className="h-20 w-auto"
            />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            NewsHub
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Все новости в одном месте • Актуальная информация 24/7
          </p>
          
          {topBanner && (
            <div className="mb-8">
              <AdBanner banner={topBanner} />
            </div>
          )}
          
          <SearchBar onSearch={handleSearch} />
        </header>

        <div className="flex gap-8">
          <main className="flex-1">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Популярные теги
                </h2>
                <Button
                  onClick={updateData}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Icon name={isLoading ? "Loader2" : "RefreshCw"} size={16} className={isLoading ? "animate-spin" : ""} />
                  Обновить
                </Button>
              </div>
              <TagCloud
                tags={tags}
                selectedTag={selectedTag}
                onTagClick={handleTagClick}
              />
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {selectedTag ? `Новости: ${selectedTag}` : 'Последние новости'}
                </h2>
                <p className="text-sm text-gray-500">
                  {filteredArticles.length} {filteredArticles.length === 1 ? 'новость' : 'новостей'}
                </p>
              </div>
              {searchQuery && (
                <p className="text-sm text-blue-600 mt-2">
                  Результаты поиска для: "{searchQuery}"
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  onClick={() => handleArticleClick(article)}
                />
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-12">
                <Icon name="Search" size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-500 mb-2">
                  Новости не найдены
                </h3>
                <p className="text-gray-400">
                  Попробуйте изменить параметры поиска или выбрать другую категорию
                </p>
              </div>
            )}
          </main>

          {sidebarBanner && (
            <aside className="w-80 hidden lg:block">
              <div className="sticky top-8">
                <AdBanner banner={sidebarBanner} />
                <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border">
                  <h3 className="font-semibold mb-3">Статистика</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Всего новостей:</span>
                      <span className="font-medium">{articles.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Трендовых:</span>
                      <span className="font-medium">{articles.filter(a => a.trending).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Источников:</span>
                      <span className="font-medium">{new Set(articles.map(a => a.source)).size}</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;