import { useQuery } from '@tanstack/react-query';
import { sportsDataClient } from '@/integrations/supabase/client';
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

// Direct mapping from database icon_name to React icon components
const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    'FaFutbol': FaFutbol,
    'FaBasketballBall': FaBasketballBall,
    'GiTennisBall': GiTennisBall,
    'FaHockeyPuck': FaHockeyPuck,
    'FaBaseballBall': FaBaseballBall,
    'FaFootballBall': FaFootballBall,
    'GiCricketBat': GiCricketBat,
    'FaVolleyballBall': FaVolleyballBall,
    'GiHandball': Trophy, // Using Trophy as fallback for missing icon
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
  
  return iconMap[iconName] || Trophy; // Fallback to Trophy
};

export interface Sport {
  id: string;
  name: string;
  icon_name: string;
  slug: string;
  icon: React.ComponentType<any>;
}

export const useSports = () => {
  return useQuery({
    queryKey: ['sports'],
    queryFn: async (): Promise<Sport[]> => {
      const { data, error } = await sportsDataClient
        .from('sport')
        .select('id, name, icon_name, slug')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching sports:', error);
        throw error;
      }

      // Convert to Sport format with mapped icons
      return (data || []).map(sport => ({
        id: sport.id,
        name: sport.name,
        icon_name: sport.icon_name || '',
        slug: sport.slug || '',
        icon: getIconComponent(sport.icon_name) // Map icon_name to component
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};