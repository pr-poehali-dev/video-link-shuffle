import { LucideIcon, icons } from 'lucide-react';

interface IconProps {
  name: keyof typeof icons;
  size?: number;
  className?: string;
  fallback?: keyof typeof icons;
}

const Icon = ({ name, size = 24, className = '', fallback = 'CircleAlert' }: IconProps) => {
  const IconComponent = icons[name] as LucideIcon || icons[fallback] as LucideIcon;
  
  return <IconComponent size={size} className={className} />;
};

export default Icon;