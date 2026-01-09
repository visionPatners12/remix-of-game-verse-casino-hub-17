import React, { forwardRef } from 'react';
import { Input, Button } from '@/ui';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'minimal';
  autoFocus?: boolean;
  disabled?: boolean;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(({
  value,
  onChange,
  onSearch,
  onClear,
  placeholder = "Search users, posts, topics...",
  className,
  size = 'md',
  variant = 'default',
  autoFocus = false,
  disabled = false
}, ref) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  const sizeClasses = {
    sm: 'h-9 text-sm',
    md: 'h-12 text-base',
    lg: 'h-14 text-lg'
  };

  const variantClasses = {
    default: 'bg-card/50 border-border/50 focus:border-primary/50',
    filled: 'bg-muted border-transparent focus:border-primary',
    minimal: 'bg-transparent border-border focus:border-primary'
  };

  const iconSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className={cn("relative", className)}>
      <Search className={cn(
        "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground",
        iconSize[size]
      )} />
      <Input
        ref={ref}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        autoFocus={autoFocus}
        disabled={disabled}
        className={cn(
          "pl-10 pr-10",
          sizeClasses[size],
          variantClasses[variant]
        )}
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={disabled}
          className={cn(
            "absolute right-2 top-1/2 transform -translate-y-1/2 p-0 hover:bg-muted/50",
            size === 'sm' ? 'h-6 w-6' : size === 'lg' ? 'h-10 w-10' : 'h-8 w-8'
          )}
        >
          <X className={cn(iconSize[size])} />
        </Button>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';