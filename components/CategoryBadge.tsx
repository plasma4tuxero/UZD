import React from 'react';
import { Category, Language } from '../types';
import { Sparkles, ShoppingBag, Film, Utensils, HelpCircle, Folder } from 'lucide-react';
import { translations } from '../utils/translations';

interface Props {
  category: string;
  customLabel?: string; // If item is in a custom folder
  size?: 'sm' | 'md';
  lang?: Language;
}

const CategoryBadge: React.FC<Props> = ({ category, customLabel, size = 'sm', lang = 'en' }) => {
  const config = {
    [Category.TRICKS]: { 
      color: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/50', 
      icon: Sparkles 
    },
    [Category.SHOPPING]: { 
      color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/50', 
      icon: ShoppingBag 
    },
    [Category.MOVIES]: { 
      color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/50', 
      icon: Film 
    },
    [Category.FOODIE]: { 
      color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/50', 
      icon: Utensils 
    },
    [Category.UNCATEGORIZED]: { 
      color: 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700', 
      icon: HelpCircle 
    },
  };

  const customConfig = {
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/50',
    icon: Folder
  };

  const catKey = category as Category;
  const selectedConfig = customLabel ? customConfig : (config[catKey] || config[Category.UNCATEGORIZED]);
  const { color, icon: Icon } = selectedConfig;
  
  const label = customLabel || translations[lang].badges[catKey] || translations[lang].badges[Category.UNCATEGORIZED];
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md ${color} ${sizeClasses} font-medium transition-all`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {label}
    </span>
  );
};

export default CategoryBadge;