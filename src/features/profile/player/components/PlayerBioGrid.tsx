import { Player } from '../types/player';
import { PlayerQuickInfo } from './PlayerQuickInfo';

interface PlayerBioGridProps {
  player: Player;
}

export function PlayerBioGrid({ player }: PlayerBioGridProps) {
  return <PlayerQuickInfo player={player} />;
}
