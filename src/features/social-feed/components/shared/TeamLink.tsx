import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { useTeamNavigation } from '../../hooks/useTeamNavigation';

interface TeamLinkProps {
  teamName: string;
  teamId?: string;  // UUID - takes priority if provided
  teamSlug?: string; // Optional slug for SEO-friendly URL
  sportSlug?: string; // Optional sport slug for SEO-friendly URL
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Unified team link component
 * Provides consistent styling and navigation for team names
 * Uses SEO-friendly URLs when possible
 */
export const TeamLink = memo(function TeamLink({ 
  teamName, 
  teamId,
  teamSlug,
  sportSlug,
  children, 
  className,
  onClick
}: TeamLinkProps) {
  const { navigateToTeam, navigateToTeamById } = useTeamNavigation();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (teamId) {
      // Use SEO-friendly navigation with available data
      navigateToTeam({
        id: teamId,
        slug: teamSlug,
        name: teamName,
        sport_slug: sportSlug
      });
    }
  };

  return (
    <span 
      className={cn(
        "hover:text-primary cursor-pointer transition-colors",
        className
      )}
      onClick={handleClick}
    >
      {children || teamName}
    </span>
  );
});