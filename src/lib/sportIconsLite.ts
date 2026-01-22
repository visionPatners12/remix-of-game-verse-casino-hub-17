import { Trophy, Gamepad2, Target, Swords, Circle } from 'lucide-react';
import { ComponentType } from 'react';

/**
 * Minimal sport icon mapping using lucide-react.
 * Uses Trophy as default fallback for all sports.
 * 
 * Note: This is a simplified version after removing react-icons.
 * For gaming-focused app, most sports icons are optional.
 */
export const getSportIcon = (iconName?: string | null): ComponentType<any> => {
  if (!iconName) return Trophy;
  
  // Map common sport icon names to lucide equivalents
  const iconMap: Record<string, ComponentType<any>> = {
    // Sports - all mapped to Trophy since lucide doesn't have specific sport icons
    'FaFutbol': Circle,
    'FaBasketballBall': Circle,
    'GiTennisBall': Circle,
    'FaHockeyPuck': Circle,
    'FaBaseballBall': Circle,
    'FaFootballBall': Circle,
    'GiCricketBat': Circle,
    'FaVolleyballBall': Circle,
    'FaTableTennis': Circle,
    'GiPunch': Swords,
    'GiBoxingGlove': Swords,
    'GiRugbyConversion': Circle,
    // eSports
    'SiCounterstrike': Gamepad2,
    'SiLeagueoflegends': Gamepad2,
    'SiDota2': Gamepad2,
    // Misc
    'FaGavel': Target,
    'FaStar': Trophy,
  };
  
  return iconMap[iconName] || Trophy;
};

/**
 * Sport data interface for components
 */
export interface Sport {
  id: string;
  name: string;
  icon_name: string;
  slug: string;
  icon: ComponentType<any>;
}
