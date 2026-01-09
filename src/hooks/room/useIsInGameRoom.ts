
import { useLocation } from "react-router-dom";

/**
 * Hook pour détecter si l'utilisateur est actuellement dans une room de jeu
 * @returns Vrai si l'utilisateur est dans une room de jeu
 */
export const useIsInGameRoom = () => {
  const location = useLocation();
  
  // Vérifie si le chemin actuel correspond à un pattern de room de jeu
  const isInGameRoom = /^\/games\/[^\/]+\/room\/[^\/]+$/.test(location.pathname);
  
  return isInGameRoom;
};
