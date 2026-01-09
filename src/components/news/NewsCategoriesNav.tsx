
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Badge } from '@/ui';
import { NewsCategory } from '@/types/news';
import { motion } from 'framer-motion';
import { ScrollArea, ScrollBar } from '@/ui';

interface NewsCategoriesNavProps {
  categories: NewsCategory[];
}

export const NewsCategoriesNav = ({ categories }: NewsCategoriesNavProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category');

  const handleCategoryClick = (slug: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (slug) {
      newParams.set('category', slug);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  return (
    <div className="w-full">
      <ScrollArea className="w-full whitespace-nowrap">
        <motion.div 
          className="flex gap-2 pb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Button
            variant={!currentCategory ? "default" : "ghost"}
            size="sm"
            onClick={() => handleCategoryClick(null)}
            className="flex-shrink-0"
          >
            Toutes les actualités
          </Button>
          
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant={currentCategory === category.slug ? "default" : "ghost"}
                size="sm"
                onClick={() => handleCategoryClick(category.slug)}
                className="flex-shrink-0 relative"
                style={{ 
                  borderColor: currentCategory === category.slug ? category.color : undefined 
                }}
              >
                <div 
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </Button>
            </motion.div>
          ))}
        </motion.div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
