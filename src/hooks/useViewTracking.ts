import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

type EntityType = 'user' | 'team' | 'league' | 'player';

const SESSION_KEY = 'viewed_entities';

/**
 * Get viewed entities from sessionStorage
 */
function getViewedEntities(): Set<string> {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

/**
 * Mark entity as viewed in sessionStorage
 */
function markAsViewed(entityType: EntityType, entityId: string): void {
  try {
    const key = `${entityType}:${entityId}`;
    const viewed = getViewedEntities();
    viewed.add(key);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([...viewed]));
  } catch (e) {
    logger.warn('Failed to save viewed entity to sessionStorage', e);
  }
}

/**
 * Check if entity was already viewed this session
 */
function wasViewed(entityType: EntityType, entityId: string): boolean {
  const key = `${entityType}:${entityId}`;
  return getViewedEntities().has(key);
}

/**
 * Hook to track page views and increment view_count
 * Uses sessionStorage to prevent spam (1 view per session per entity)
 */
export function useViewTracking(entityType: EntityType, entityId: string | undefined) {
  const hasTracked = useRef(false);

  useEffect(() => {
    // Guard: no ID, already tracked this render, or already viewed this session
    if (!entityId || hasTracked.current || wasViewed(entityType, entityId)) {
      return;
    }

    hasTracked.current = true;

    const trackView = async () => {
      try {
        const { error } = await supabase.rpc('increment_view_count', {
          p_entity_type: entityType,
          p_entity_id: entityId,
        });

        if (error) {
          logger.error('Failed to track view:', error);
          return;
        }

        // Mark as viewed only after successful tracking
        markAsViewed(entityType, entityId);
        logger.debug(`View tracked for ${entityType}:${entityId}`);
      } catch (e) {
        logger.error('Error tracking view:', e);
      }
    };

    trackView();
  }, [entityType, entityId]);
}
