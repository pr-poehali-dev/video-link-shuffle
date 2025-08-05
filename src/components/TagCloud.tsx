import { NewsTag } from '@/types/news';
import { Badge } from '@/components/ui/badge';

interface TagCloudProps {
  tags: NewsTag[];
  selectedTag?: string;
  onTagClick: (tagName: string) => void;
}

const TagCloud = ({ tags, selectedTag, onTagClick }: TagCloudProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {tags.map((tag) => (
        <Badge
          key={tag.id}
          variant={selectedTag === tag.name ? "default" : "secondary"}
          className={`cursor-pointer hover:opacity-80 transition-all px-3 py-1 ${
            selectedTag === tag.name ? 'ring-2 ring-primary' : ''
          }`}
          style={{ 
            backgroundColor: selectedTag === tag.name ? tag.color : undefined,
            borderColor: tag.color,
            color: selectedTag === tag.name ? 'white' : tag.color
          }}
          onClick={() => onTagClick(tag.name)}
        >
          {tag.name} ({tag.count})
        </Badge>
      ))}
    </div>
  );
};

export default TagCloud;