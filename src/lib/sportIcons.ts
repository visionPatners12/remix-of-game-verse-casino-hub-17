import { Trophy } from 'lucide-react';
import { 
  FaFutbol, 
  FaBasketballBall, 
  FaBaseballBall, 
  FaFootballBall, 
  FaHockeyPuck, 
  FaVolleyballBall, 
  FaTableTennis, 
  FaGavel, 
  FaStar 
} from 'react-icons/fa';
import { 
  GiTennisBall, 
  GiCricketBat, 
  GiPunch, 
  GiBoxingGlove, 
  GiRugbyConversion 
} from 'react-icons/gi';
import { 
  SiCounterstrike, 
  SiLeagueoflegends, 
  SiDota2 
} from 'react-icons/si';
import { ComponentType } from 'react';

/**
 * Centralized sport icon mapping from database icon_name to React icon components
 * Uses Trophy as fallback instead of stars
 */
export const getSportIcon = (iconName?: string | null): ComponentType<any> => {
  if (!iconName) return Trophy;
  
  const iconMap: { [key: string]: ComponentType<any> } = {
    'FaFutbol': FaFutbol,
    'FaBasketballBall': FaBasketballBall,
    'GiTennisBall': GiTennisBall,
    'FaHockeyPuck': FaHockeyPuck,
    'FaBaseballBall': FaBaseballBall,
    'FaFootballBall': FaFootballBall,
    'GiCricketBat': GiCricketBat,
    'FaVolleyballBall': FaVolleyballBall,
    'GiHandball': Trophy,
    'FaTableTennis': FaTableTennis,
    'GiPunch': GiPunch,
    'GiBoxingGlove': GiBoxingGlove,
    'GiRugbyConversion': GiRugbyConversion,
    'SiCounterstrike': SiCounterstrike,
    'SiLeagueoflegends': SiLeagueoflegends,
    'SiDota2': SiDota2,
    'FaGavel': FaGavel,
    'FaStar': FaStar,
  };
  
  return iconMap[iconName] || Trophy;
};
